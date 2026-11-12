import { spawn, type ChildProcess } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { randomBytes, createHash } from "node:crypto";
import path from "node:path";
import type { AgentConfig } from "../shared/contracts";
import type { ToolBroker } from "./broker";
import { ModelGateway } from "./model-gateway";
import { createServer } from "node:net";
export const engineConfig = (
  config: AgentConfig,
  broker: Pick<ToolBroker, "url" | "token">,
) => ({
  logLevel: "ERROR",
  autoupdate: false,
  share: "disabled",
  snapshot: false,
  enabled_providers: ["intranet"],
  model: `intranet/${config.model.id}`,
  small_model: `intranet/${config.model.id}`,
  plugin: [],
  lsp: false,
  formatter: false,
  skills: { paths: [], urls: [] },
  provider: {
    intranet: {
      npm: "@ai-sdk/openai-compatible",
      name: "사내 모델",
      options: { baseURL: config.model.baseUrl, apiKey: config.model.apiKey },
      models: {
        [config.model.id]: {
          id: config.model.id,
          name: config.model.id,
          tool_call: true,
          limit: { context: 32768, output: 4096 },
        },
      },
    },
  },
  permission: { "*": "deny", "ned_*": "allow" },
  mcp: {
    ned: {
      type: "remote",
      url: broker.url,
      headers: { Authorization: `Bearer ${broker.token}` },
      oauth: false,
      timeout: 3600000,
    },
  },
  default_agent: "harness",
  agent: {
    harness: {
      mode: "primary",
      description: "Ned 개발 지원",
      permission: { "*": "deny", "ned_*": "allow" },
      steps: 50,
    },
    build: { disable: true },
    plan: { disable: true },
    general: { disable: true },
    explore: { disable: true },
  },
  compaction: { auto: false },
});
export class Engine {
  private process?: ChildProcess;
  private url = "";
  private auth = "";
  private sessionID?: string;
  private exited = false;
  private closing?: Promise<void>;
  private eventAbort?: AbortController;
  private gateway?: ModelGateway;
  constructor(
    private runtime: string,
    private data: string,
  ) {}
  async start(config: AgentConfig, broker: ToolBroker) {
    const platform = process.platform === "win32" ? "windows-x64" : "linux-x64";
    const executable = path.join(
      this.runtime,
      platform,
      process.platform === "win32" ? "opencode.exe" : "opencode",
    );
    const lock = JSON.parse(
      await readFile(path.join(this.runtime, "manifest.json"), "utf8").catch(
        () => '{"files":[]}',
      ),
    );
    const entry = lock.files?.find(
      (f: { path: string }) =>
        f.path === `${platform}/${path.basename(executable)}`,
    );
    if (
      !entry ||
      createHash("sha256")
        .update(await readFile(executable))
        .digest("hex") !== entry.sha256
    )
      throw new Error(
        "검증된 앱 전용 OpenCode 런타임이 없습니다. 빌드 환경에서 npm run vendor:fetch를 실행하세요.",
      );
    this.gateway = new ModelGateway(config);
    await this.gateway.start();
    const engineModel: AgentConfig = {
      schemaVersion: 1,
      model: {
        ...config.model,
        baseUrl: this.gateway.baseUrl,
        apiKey: this.gateway.token,
      },
    };
    const isolated = path.join(this.data, "engine");
    const cwd = path.join(isolated, "workspace");
    for (const dir of [
      "home",
      "config",
      "cache",
      "data",
      "state",
      "workspace",
      "empty-path",
    ])
      await mkdir(path.join(isolated, dir), { recursive: true, mode: 0o700 });
    const password = randomBytes(32).toString("hex");
    // OpenCode 1.19.5 treats --port=0 as its default 4096. Reserve an explicit
    // ephemeral port, then require the spawned process to announce that port.
    const reservation = createServer();
    await new Promise<void>((resolve, reject) => { reservation.once('error', reject); reservation.listen(0, '127.0.0.1', resolve); });
    const reserved = reservation.address();
    if (!reserved || typeof reserved === 'string') throw new Error('엔진 포트 할당 실패');
    const port = reserved.port;
    await new Promise<void>(resolve => reservation.close(() => resolve()));
    this.auth = `Basic ${Buffer.from(`opencode:${password}`).toString("base64")}`;
    const env: NodeJS.ProcessEnv = {
      SYSTEMROOT: process.env.SYSTEMROOT,
      WINDIR: process.env.WINDIR,
      TEMP: process.env.TEMP,
      TMP: process.env.TMP,
      HOME: path.join(isolated, "home"),
      USERPROFILE: path.join(isolated, "home"),
      APPDATA: path.join(isolated, "config"),
      LOCALAPPDATA: path.join(isolated, "data"),
      XDG_CONFIG_HOME: path.join(isolated, "config"),
      XDG_CACHE_HOME: path.join(isolated, "cache"),
      XDG_DATA_HOME: path.join(isolated, "data"),
      XDG_STATE_HOME: path.join(isolated, "state"),
      PATH: path.join(isolated, "empty-path"),
      NO_PROXY: "127.0.0.1,localhost",
      OPENCODE_SERVER_PASSWORD: password,
      OPENCODE_SERVER_USERNAME: "opencode",
      OPENCODE_CONFIG_CONTENT: JSON.stringify(
        engineConfig(engineModel, broker),
      ),
      OPENCODE_DISABLE_PROJECT_CONFIG: "1",
      OPENCODE_DISABLE_AUTOUPDATE: "1",
      OPENCODE_DISABLE_MODELS_FETCH: "1",
      OPENCODE_DISABLE_LSP_DOWNLOAD: "1",
      OPENCODE_DISABLE_DEFAULT_PLUGINS: "1",
      OPENCODE_DISABLE_EXTERNAL_SKILLS: "1",
      OPENCODE_DISABLE_CLAUDE_CODE: "1",
      DO_NOT_TRACK: "1",
    };
    this.process = spawn(
      executable,
      ["serve", "--hostname=127.0.0.1", `--port=${port}`],
      { cwd, env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] },
    );
    this.process.once("exit", () => {
      this.exited = true;
    });
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("앱 전용 엔진 시작 시간이 초과되었습니다.")),
        30000,
      );
      this.process!.once("error", () => {
        clearTimeout(timer);
        reject(new Error("앱 전용 엔진을 실행할 수 없습니다."));
      });
      this.process!.once("exit", (code) => {
        clearTimeout(timer);
        reject(new Error(`엔진 시작 중 종료 (${code})`));
      });
      let output = "";
      this.process!.stdout!.on("data", (chunk) => {
        output = (output + chunk.toString()).slice(-4096);
        const match =
          /opencode server listening on (http:\/\/127\.0\.0\.1:\d+)/.exec(
            output,
          );
        if (match) {
            if (new URL(match[1]).port !== String(port)) { clearTimeout(timer); reject(new Error('엔진이 지정한 임의 포트로 실행되지 않았습니다.')); return; }
          this.url = match[1];
          clearTimeout(timer);
          resolve();
        }
      });
      // Drain diagnostics without writing possible secret-bearing text to app logs.
      this.process!.stderr!.on("data", () => {});
    }).catch(async (e) => {
      await this.close();
      throw e;
    });
    await this.request("/global/health");
    const session = await this.request("/session", {
      method: "POST",
      body: JSON.stringify({ title: "Ned" }),
    });
    this.sessionID = session.id;
    if (typeof this.sessionID !== "string")
      throw new Error("엔진 세션 생성 실패");
  }
  async request(route: string, options: RequestInit = {}) {
    if (!this.url || this.exited)
      throw new Error("앱 전용 엔진 연결이 종료되었습니다.");
    const response = await fetch(this.url + route, {
      ...options,
      redirect: "error",
      headers: { Authorization: this.auth, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      throw new Error(`엔진 API 오류 (HTTP ${response.status})`);
    return response.status === 204 ? undefined : response.json();
  }
  async prompt(text: string, system: string) {
    await this.request(`/session/${this.sessionID}/prompt_async`, {
      method: "POST",
      body: JSON.stringify({
        agent: "harness",
        parts: [{ type: "text", text }],
        system,
      }),
    });
  }
  async watch(
    onText: (messageId: string, text: string) => void,
    onFailure: (error: Error) => void,
  ) {
    this.eventAbort = new AbortController();
    const signal = this.eventAbort.signal;
    const response = await fetch(this.url + "/event", {
      headers: { Authorization: this.auth },
      redirect: "error",
      signal,
    });
    if (!response.ok || !response.body)
      throw new Error("엔진 이벤트 스트림을 열 수 없습니다.");
    const roles = new Map<string, string>();
    const parts = new Map<
      string,
      { message: string; text: string; source: "next" | "legacy" }
    >();
    const next = new Set<string>();
    const publish = (message: string) => {
      const source = next.has(message) ? "next" : "legacy";
      if (source === "legacy" && roles.get(message) !== "assistant") return;
      const text = [...parts.values()]
        .filter((p) => p.message === message && p.source === source)
        .map((p) => p.text)
        .join("\n");
      if (text) onText(message, text);
    };
    const receive = (event: any) => {
      const p = event.properties;
      if (!p || (p.sessionID && p.sessionID !== this.sessionID)) return;
      if (event.type === "message.updated" && p.info)
        roles.set(p.info.id, p.info.role);
      if (
        event.type === "session.next.text.delta" ||
        event.type === "session.next.text.ended"
      ) {
        const message = p.assistantMessageID;
        if (typeof message !== "string" || typeof p.textID !== "string") return;
        next.add(message);
        const key = `next:${p.textID}`;
        const previous = parts.get(key)?.text ?? "";
        const text = event.type.endsWith(".ended")
          ? p.text
          : previous + (p.delta ?? "");
        if (typeof text === "string") {
          parts.set(key, { message, text, source: "next" });
          publish(message);
        }
      }
      if (event.type === "message.part.updated" && p.part?.type === "text") {
        const part = p.part;
        parts.set(`legacy:${part.id}`, {
          message: part.messageID,
          text: part.text ?? "",
          source: "legacy",
        });
        publish(part.messageID);
      }
      if (event.type === "message.part.delta" && p.field === "text") {
        const part = parts.get(`legacy:${p.partID}`);
        if (part) {
          part.text += p.delta ?? "";
          publish(part.message);
        }
      }
      // reasoning, user content, tool output and unknown event types never reach onText.
    };
    void (async () => {
      const decoder = new TextDecoder();
      let buffer = "";
      const reader = response.body!.getReader();
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        buffer += decoder.decode(chunk, { stream: true });
        buffer = buffer.replace(/\r\n/g, "\n");
        if (buffer.length > 4 * 1024 * 1024)
          throw new Error("엔진 이벤트 크기 제한을 초과했습니다.");
        let boundary;
        while ((boundary = buffer.indexOf("\n\n")) !== -1) {
          const frame = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          const data = frame
            .split("\n")
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trimStart())
            .join("\n");
          if (data) receive(JSON.parse(data));
        }
      }
      if (!signal.aborted)
        throw new Error("엔진 이벤트 연결이 종료되었습니다.");
    })().catch((e) => {
      if (!signal.aborted)
        onFailure(e instanceof Error ? e : new Error("엔진 이벤트 오류"));
    });
  }
  async messages(): Promise<
    Array<{
      info: {
        id: string;
        role: string;
        time?: { completed?: number };
        error?: unknown;
      };
      parts: Array<{ type: string; text?: string }>;
    }>
  > {
    return this.request(`/session/${this.sessionID}/message`);
  }
  async idle() {
    if (!this.process || this.exited) return true;
    const status = await this.request("/session/status");
    return !status[this.sessionID!] || status[this.sessionID!].type === "idle";
  }
  async abort() {
    if (!this.process || this.exited) return true;
    const result = await this.request(`/session/${this.sessionID}/abort`, {
      method: "POST",
    });
    return result === true;
  }
  async close() {
    this.eventAbort?.abort();
    await this.gateway?.close();
    if (!this.process || this.exited) return;
    if (this.closing) return this.closing;
    const child = this.process;
    this.closing = new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        child.kill("SIGKILL");
        reject(new Error("엔진 프로세스 종료를 확인하지 못했습니다."));
      }, 5000);
      child.once("exit", () => {
        clearTimeout(timer);
        resolve();
      });
      child.kill();
    });
    return this.closing;
  }
}
