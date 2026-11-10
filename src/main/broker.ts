import { createServer, type Server } from "node:http";
import { randomBytes, randomUUID } from "node:crypto";
import { z } from "zod";
import type { Session, ToolEvent, Proposal } from "../shared/contracts";
import { ProjectFiles } from "./files";
import type { Redactor } from "./config";
import type { BrokerExtension } from './skills';
export const toolDefinitions = [
  {
    name: "list_files",
    description: "프로젝트 내부 파일 목록을 읽습니다.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "read_file",
    description: "프로젝트 내부 텍스트 파일을 읽습니다.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string" } },
      required: ["path"],
      additionalProperties: false,
    },
  },
  {
    name: "search_text",
    description:
      "일반 텍스트 검색입니다. 의미 기반 분석이 아닙니다. 최대 100건.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string" } },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "propose_edit",
    description:
      "파일 전체 변경 내용을 제안합니다. 호스트의 승인이 끝나야 적용되며 결과가 반환됩니다. 기존 파일을 먼저 읽으세요.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string" }, content: { type: "string" } },
      required: ["path", "content"],
      additionalProperties: false,
    },
  },
  {
    name: "methodology",
    description:
      "검토한 순수 지침 또는 기존 Conductor 트랙의 자료를 읽습니다. 목록 확인 후 document로 필요한 스킬만 선택하세요.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", enum: ["aegis", "conductor"] },
        document: { type: "string" },
      },
      required: ["name"],
      additionalProperties: false,
    },
  },
];
export class ToolBroker {
  private server?: Server;
  readonly token = randomBytes(32).toString("hex");
  url = "";
  active = 0;
  sessionApproval = false;
  private enabled = true;
  private waiting = new Map<
    string,
    { proposal: Proposal; resolve: (decision: boolean) => void }
  >();
  constructor(
    readonly files: ProjectFiles,
    readonly session: Session,
    private changed: () => void,
    private redactor: Redactor,
    private methodology: (name: string, document?: string) => Promise<string>,
    private extension?: BrokerExtension,
  ) {}
  async start() {
    this.server = createServer(async (req, res) => {
      if (req.headers.authorization !== `Bearer ${this.token}`) {
        res.writeHead(401).end();
        return;
      }
      if (req.url !== "/mcp") {
        res.writeHead(404).end();
        return;
      }
      if (req.method === "GET") {
        res.writeHead(405).end();
        return;
      }
      if (req.method !== "POST") {
        res.writeHead(405).end();
        return;
      }
      let body = "";
      try {
        for await (const chunk of req) {
          body += chunk;
          if (Buffer.byteLength(body) > 3 * 1024 * 1024)
            throw new Error("요청 크기 초과");
        }
        const input = JSON.parse(body);
        if (input.id === undefined) {
          res.writeHead(202).end();
          return;
        }
        let result: unknown;
        if (input.method === "initialize")
          result = {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: { name: "l-vibe-broker", version: "0.1.0" },
          };
        else if (input.method === "ping") result = {};
        else if (input.method === "tools/list")
          result = { tools: [...toolDefinitions, ...(this.extension?.tools ?? [])] };
        else if (input.method === "tools/call") {
          try {
            result = {
              content: [
                {
                  type: "text",
                  text: await this.call(
                    input.params.name,
                    input.params.arguments ?? {},
                  ),
                },
              ],
            };
          } catch (e) {
            result = {
              isError: true,
              content: [
                {
                  type: "text",
                  text: this.redactor.text(
                    e instanceof Error ? e.message : "도구 실행 실패",
                  ),
                },
              ],
            };
          }
        } else {
          res.writeHead(200, { "Content-Type": "application/json" }).end(
            JSON.stringify({
              jsonrpc: "2.0",
              id: input.id,
              error: { code: -32601, message: "허용되지 않는 메서드" },
            }),
          );
          return;
        }
        res.writeHead(200, { "Content-Type": "application/json" }).end(
          JSON.stringify({
            jsonrpc: "2.0",
            id: input.id,
            result: this.redactor.object(result),
          }),
        );
      } catch {
        res.writeHead(400).end();
      }
    });
    await new Promise<void>((resolve, reject) => {
      this.server!.once("error", reject);
      this.server!.listen(0, "127.0.0.1", resolve);
    });
    const address = this.server.address();
    if (!address || typeof address === "string")
      throw new Error("중계 포트 할당 실패");
    this.url = `http://127.0.0.1:${address.port}/mcp`;
  }
  async call(name: string, args: unknown): Promise<string> {
    if (!this.enabled)
      throw new Error("중지된 작업의 도구 호출을 차단했습니다.");
    if (![...toolDefinitions, ...(this.extension?.tools ?? [])].some((t) => t.name === name))
      throw new Error("알 수 없거나 실행 효과가 통제되지 않은 도구입니다.");
    const event: ToolEvent = {
      id: randomUUID(),
      tool: name,
      target: "",
      status: "running",
      at: new Date().toISOString(),
    };
    this.session.tools.push(event);
    this.active++;
    this.changed();
    try {
      let output = "";
      if (this.extension?.tools.some(t => t.name === name)) output = await this.extension.call(name, args);
      if (name === "list_files") {
        z.object({}).strict().parse(args);
        event.target = ".";
        output = (await this.files.list()).join("\n");
      }
      if (name === "read_file") {
        const a = z.object({ path: z.string() }).strict().parse(args);
        event.target = a.path;
        output = await this.files.read(a.path);
      }
      if (name === "search_text") {
        const a = z
          .object({ query: z.string().min(1).max(500) })
          .strict()
          .parse(args);
        event.target = a.query;
        const matches: string[] = [];
        for (const file of await this.files.list()) {
          if (!this.enabled) throw new Error("검색을 중지했습니다.");
          let text: string;
          try {
            text = await this.files.read(file);
          } catch {
            continue;
          }
          for (const [i, line] of text.split("\n").entries())
            if (line.includes(a.query)) {
              matches.push(`${file}:${i + 1}: ${line.slice(0, 500)}`);
              if (matches.length >= 100) break;
            }
          if (matches.length >= 100) break;
        }
        output =
          "호스트 일반 텍스트 검색 (Serena 의미 분석 미사용; 최대 4,000개 파일·깊이 12, 빌드/의존성/바이너리 제외, 최대 100건)\n" +
          (matches.join("\n") || "일치 없음");
      }
      if (name === "methodology") {
        const a = z
          .object({
            name: z.enum(["aegis", "conductor"]),
            document: z.string().max(512).optional(),
          })
          .strict()
          .parse(args);
        event.target = a.name + (a.document ? `/${a.document}` : "");
        output = await this.methodology(a.name, a.document);
      }
      if (name === "propose_edit") {
        const a = z
          .object({ path: z.string(), content: z.string() })
          .strict()
          .parse(args);
        event.target = a.path;
        const proposal = await this.files.propose(event.id, a.path, a.content);
        this.session.proposals.push(proposal);
        event.status = "approval";
        this.changed();
        const approved =
          this.sessionApproval ||
          (await new Promise<boolean>((resolve) => {
            this.waiting.set(proposal.id, { proposal, resolve });
            this.changed();
          }));
        if (!approved || !this.enabled) {
          proposal.status = "rejected";
          throw new Error("수정이 거절되거나 실행이 중지되었습니다.");
        }
        event.status = "running";
        this.changed();
        output = await this.files.apply(proposal);
      }
      event.status = "success";
      event.result = this.redactor.text(output.slice(0, 48000));
      return this.redactor.text(output.slice(0, 48000));
    } catch (e) {
      event.status = "failed";
      event.result = this.redactor.text(
        e instanceof Error ? e.message : "도구 실행 실패",
      );
      throw e;
    } finally {
      this.active--;
      this.changed();
    }
  }
  approve(id: string, decision: "once" | "session" | "reject") {
    const waiting = this.waiting.get(id);
    if (!waiting || !this.enabled)
      throw new Error("만료되거나 다른 세션의 승인 요청입니다.");
    if (decision === "session") this.sessionApproval = true;
    this.waiting.delete(id);
    waiting.resolve(decision !== "reject");
    this.changed();
  }
  stop() {
    this.enabled = false;
    this.sessionApproval = false;
    for (const waiting of this.waiting.values()) {
      waiting.proposal.status = "rejected";
      waiting.resolve(false);
    }
    this.waiting.clear();
    this.changed();
  }
  async close() {
    this.stop();
    this.server?.closeAllConnections();
    await new Promise<void>((resolve) => {
      if (!this.server?.listening) resolve();
      else this.server.close(() => resolve());
    });
  }
}
