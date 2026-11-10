import { randomUUID } from "node:crypto";
import { realpath, readFile, stat } from "node:fs/promises";
import path from "node:path";
import type {
  AgentConfig,
  AppState,
  Request,
  Reply,
  Session,
} from "../shared/contracts";
import { ConfigVault, Redactor, atomicJSON } from "./config";
import { History } from "./history";
import { Lifecycle } from "./lifecycle";
import { ProjectFiles } from "./files";
import { ToolBroker } from "./broker";
import { Engine } from "./engine";
import { Methodologies } from "./adapters";
import { replayAnswer } from "./replay";
import { detectRepetition } from "./repetition";
import { OpenVikingService, type KnowledgeService } from './openviking';
import { OfflineSkills, developerExtension } from './skills';
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export interface HostOptions {
  data: string;
  runtime: string;
  methodologies: string;
  vault: ConfigVault;
  chooseProject(): Promise<string | undefined>;
  chooseConfig(): Promise<string | undefined>;
  changed(state: AppState): void;
  skills?: string;
  knowledge?: KnowledgeService;
}
export class Host {
  readonly redactor = new Redactor();
  readonly life = new Lifecycle();
  readonly history: History;
  private config?: AgentConfig;
  private configError?: string;
  private notice?: string;
  private engineState: AppState["engine"] = "offline";
  private engine?: Engine;
  private broker?: ToolBroker;
  private activeSessionId?: string;
  private files: string[] = [];
  private autoApproved = false;
  private historyHealthy = true;
  private replayAbort?: AbortController;
  private setup?: Promise<void>;
  private stoppingTask?: Promise<void>;
  private switching = false;
  private replayTask?: Promise<void>;
  private knowledge: KnowledgeService;
  private skills?: OfflineSkills;
  constructor(private options: HostOptions) {
    this.history = new History(
      path.join(options.data, "history.json"),
      this.redactor,
    );
    this.knowledge = options.knowledge ?? new OpenVikingService(options.runtime, options.data, () => this.emit());
    if (options.skills) this.skills = new OfflineSkills(options.skills);
  }
  async initialize() {
    try {
      this.config = await this.options.vault.load();
      this.registerSecrets();
      if (this.config?.models) {
        const preference = await readFile(path.join(this.options.data, 'model-preference.json'), 'utf8').then(JSON.parse).catch(() => undefined);
        const selected = this.config.models.find(m => m.name === preference?.name);
        if (selected) this.config = { ...this.config, model: selected };
      }
    } catch (e) {
      this.configError = this.error(e);
    }
    try {
      await this.history.load();
    } catch (e) {
      this.notice = this.error(e);
      this.historyHealthy = false;
    }
    try { await this.skills?.load(); } catch { this.notice = '기본 스킬 번들을 읽을 수 없습니다. 반입 전 번들 검증이 필요합니다.'; }
    void this.knowledge.configure(this.config).catch(() => { this.notice = 'OpenViking 수명 관리 오류'; this.emit(); });
    this.emit();
  }
  private registerSecrets() {
    if (!this.config) return;
    this.redactor.add(this.config.model.apiKey);
    for (const model of this.config.models ?? []) this.redactor.add(model.apiKey);
    if (this.config.openViking) {
      this.redactor.add(this.config.openViking.embedding.apiKey);
      if (this.config.openViking.vlm) this.redactor.add(this.config.openViking.vlm.apiKey);
    }
  }
  state(): AppState {
    return this.redactor.object({
      phase: this.life.phase,
      projects: this.history.projects,
      sessions: this.history.sessions,
      activeSessionId: this.activeSessionId,
      files: this.files,
      model: this.config
        ? { name: this.config.models?.find(m => m.baseUrl === this.config!.model.baseUrl && m.id === this.config!.model.id && m.apiKey === this.config!.model.apiKey)?.name, baseUrl: this.config.model.baseUrl, id: this.config.model.id }
        : undefined,
      models: this.config?.models?.map(({ name, baseUrl, id }) => ({ name, baseUrl, id })) ?? [],
      configError: this.configError,
      notice: this.notice,
      engine: this.engineState,
      sessionApproval: this.autoApproved,
      capabilities: { commands: false, serena: false, snapshots: true },
      knowledge: this.knowledge.state(),
      skills: this.skills?.catalog() ?? [],
    });
  }
  private emit = () => {
    this.options.changed(this.state());
  };
  private changed = () => {
    this.emit();
    if (this.historyHealthy)
      void this.history.save().catch((e) => {
        this.notice = this.error(e);
        this.emit();
      });
  };
  private error(e: unknown) {
    return this.redactor.text(
      e instanceof Error ? e.message : "알 수 없는 오류",
    );
  }
  private idle() {
    if (!["idle", "stopped"].includes(this.life.phase))
      throw new Error("현재 실행을 중지하고 중지 확인이 끝난 후 전환하세요.");
    if (!this.historyHealthy)
      throw new Error(
        "기록 파일 복구 전 새 기록을 저장할 수 없습니다. 원본은 보존되어 있습니다.",
      );
  }
  private session(): Session {
    const s = this.history.sessions.find((s) => s.id === this.activeSessionId);
    if (!s) throw new Error("프로젝트를 열고 새 작업을 만드세요.");
    return s;
  }
  private projectFiles() {
    const project = this.history.projects.find(
      (p) => p.id === this.session().projectId,
    );
    if (!project) throw new Error("프로젝트가 없습니다.");
    return new ProjectFiles(project.path);
  }
  async handle(request: Request): Promise<Reply & { state?: AppState }> {
    let ownsTransition = false;
    try {
      if (this.switching && !["state", "stop"].includes(request.action))
        throw new Error("프로젝트 또는 설정 전환이 끝날 때까지 기다리세요.");
      if (
        ["importConfig", "openProject", "newSession", "selectSession", "indexKnowledge", "selectModel"].includes(
          request.action,
        )
      ) {
        this.idle();
        this.switching = true;
        ownsTransition = true;
      }
      if (request.action === "state") return { ok: true, state: this.state() };
      if (request.action === "importConfig") {
        this.idle();
        const file = await this.options.chooseConfig();
        if (file) {
          const size = (await stat(file)).size;
          if (size > 65536) throw new Error("설정 파일이 너무 큽니다.");
          this.config = await this.options.vault.importText(
            await readFile(file, "utf8"),
            request.replace,
          );
          this.registerSecrets();
          this.configError = undefined;
          this.notice = "모델 설정을 암호화해 저장했습니다.";
          this.autoApproved = false;
          await this.knowledge.configure(this.config);
          await atomicJSON(path.join(this.options.data, 'model-preference.json'), { name: this.config.defaultModel ?? this.config.models?.[0]?.name });
        }
      }
      if (request.action === "openProject") {
        this.idle();
        const selected = await this.options.chooseProject();
        if (selected) {
          const folder = await realpath(selected);
          if (!(await stat(folder)).isDirectory())
            throw new Error("프로젝트 폴더가 아닙니다.");
          let project = this.history.projects.find((p) => p.path === folder);
          if (!project) {
            project = {
              id: randomUUID(),
              name: path.basename(folder),
              path: folder,
            };
            this.history.projects.push(project);
          }
          await this.newSession(project.id);
        }
      }
      if (request.action === "newSession") {
        this.idle();
        await this.newSession(request.projectId);
      }
      if (request.action === "selectSession") {
        this.idle();
        if (!this.history.sessions.some((s) => s.id === request.sessionId))
          throw new Error("작업을 찾을 수 없습니다.");
        this.activeSessionId = request.sessionId;
        this.autoApproved = false;
        this.files = await this.projectFiles().list();
      }
      if (request.action === "send") {
        this.idle();
        if (!this.config) throw new Error("모델 설정을 먼저 가져오세요.");
        const session = this.session();
        session.messages.push({
          id: randomUUID(),
          role: "user",
          text: request.text,
          at: new Date().toISOString(),
        });
        if (session.title === "새 작업")
          session.title = request.text.slice(0, 40);
        this.notice = undefined;
        const epoch = this.life.start();
        this.changed();
        void this.run(session, epoch).catch((e) => {
          this.notice = this.error(e);
          this.life.confirmStop(false, false, this.broker?.active ?? 0, 0);
          this.engineState = "error";
          this.changed();
        });
      }
      if (request.action === "stop") await this.stop();
      if (request.action === "replay") {
        if (!this.config) throw new Error("모델 설정이 없습니다.");
        this.life.replay();
        this.replayAbort = new AbortController();
        this.changed();
        this.replayTask = this.replay(this.session());
      }
      if (request.action === "approve") {
        if (!this.broker || this.life.phase !== "running")
          throw new Error("유효한 실행의 승인 요청이 아닙니다.");
        this.broker.approve(request.proposalId, request.decision);
        if (request.decision === "session") this.autoApproved = true;
      }
      if (request.action === "resetApproval") {
        this.autoApproved = false;
        if (this.broker) this.broker.sessionApproval = false;
      }
      if (request.action === 'indexKnowledge') {
        const project = this.session().projectId;
        const content = await this.projectFiles().read(request.path);
        this.notice = await this.knowledge.index(project, request.path, this.redactor.text(content));
      }
      if (request.action === 'selectModel') {
        this.idle();
        const chosen = this.config?.models?.find(m => m.name === request.name);
        if (!chosen || !this.config) throw new Error('JSON에 등록된 LLM만 선택할 수 있습니다.');
        await atomicJSON(path.join(this.options.data, 'model-preference.json'), { name: chosen.name });
        this.config = { ...this.config, model: chosen };
        this.notice = `${chosen.name} 모델을 선택했습니다.`;
      }
      if (request.action === "readFile")
        return {
          ok: true,
          content: this.redactor.text(
            await this.projectFiles().read(request.path),
          ),
        };
      this.changed();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: this.error(e) };
    } finally {
      if (ownsTransition) this.switching = false;
    }
  }
  private async newSession(projectId: string) {
    if (!this.history.projects.some((p) => p.id === projectId))
      throw new Error("프로젝트를 찾을 수 없습니다.");
    const session: Session = {
      id: randomUUID(),
      projectId,
      title: "새 작업",
      at: new Date().toISOString(),
      messages: [],
      tools: [],
      proposals: [],
    };
    this.history.sessions.unshift(session);
    this.activeSessionId = session.id;
    this.autoApproved = false;
    this.files = await this.projectFiles().list();
    this.life.phase = "idle";
  }
  private async run(session: Session, epoch: number) {
    const files = this.projectFiles();
    const methodologies = new Methodologies(this.options.methodologies, files);
    const broker = new ToolBroker(
      files,
      session,
      this.changed,
      this.redactor,
      (name, document) => methodologies.read(name, document),
      this.skills ? developerExtension(this.skills, this.knowledge, session.projectId) : undefined,
    );
    const engine = new Engine(this.options.runtime, this.options.data);
    this.broker = broker;
    this.engine = engine;
    broker.sessionApproval = this.autoApproved;
    this.engineState = "starting";
    this.emit();
    this.setup = (async () => {
      await broker.start();
      if (this.life.valid(epoch)) await engine.start(this.config!, broker);
    })();
    try {
      await this.setup;
      if (!this.life.valid(epoch)) return;
      this.engineState = "ready";
      this.emit();
      const assistantTexts = new Map<string, string>();
      const updateText = (messageId: string, raw: string) => {
        if (!this.life.valid(epoch)) return;
        const text = this.redactor.text(raw);
        const id = `engine:${messageId}`;
        let local = session.messages.find((m) => m.id === id);
        if (!local) {
          local = {
            id,
            role: "assistant",
            text: "",
            at: new Date().toISOString(),
          };
          session.messages.push(local);
        }
        if (local.text === text) return;
        local.text = text;
        assistantTexts.set(messageId, text);
        this.emit();
        const reason = detectRepetition(
          [...assistantTexts.values()].join("\n"),
        );
        if (reason) {
          this.notice = reason;
          void this.stop();
        }
      };
      await engine.watch(updateText, (e) => {
        if (this.life.valid(epoch)) {
          this.notice = this.error(e);
          void this.stop();
        }
      });
      const context = session.messages
        .slice(-20)
        .map((m) => `${m.role}: ${m.text}`)
        .join("\n\n");
      await engine.prompt(
        context,
        '당신은 L-Vibe, 폐쇄망 바이브 코딩 파트너입니다. 사용자의 아이디어를 작은 검증 가능한 기능으로 구체화하고 코드·문서·수정 제안을 실제로 만드세요. 한국어로 응답하세요. 필요한 정보는 프로젝트·기존 트랙·현재 대화에서 먼저 조사하세요. skill_catalog와 read_skill로 요구사항·계획·TDD·디버깅·리뷰·UI·보안 등 필요한 고정 스킬만 읽고 적용하세요. 복잡한 작업은 Aegis·Conductor를 필요한 만큼 조합하세요. OpenViking knowledge_search/knowledge_read는 사용자가 색인한 현재 프로젝트 지식만 조회하며 현재 코드와 출처를 대조하세요. 개인 대화를 자동 색인하지 마세요. 실제 파일 작업은 l_vibe 도구만 사용합니다. 수정은 호스트 승인 대상입니다. 명령·웹·외부 설치·임의 실행 플러그인은 금지됩니다. 원본 스킬의 도구 이름은 호스트 도구에 매핑하고 사용할 수 없는 실행기·브라우저 테스트는 검증 미실행으로 밝히세요. 계획과 실제 성공을 구분하고 검증 없이 완료를 주장하지 마세요. 검색은 일반 텍스트 검색이며 의미 분석과 구분합니다. 제품 범위를 바꾸는 미결 결정만 사용자에게 질문하고 의존 변경을 보류하며 독립 작업은 계속하세요.',
      );
      while (this.life.valid(epoch)) {
        await pause(400);
        if (!this.life.valid(epoch)) return;
        const messages = await engine.messages();
        let completed = false;
        for (const message of messages) {
          if (message.info.role !== "assistant") continue;
          if (message.info.error)
            throw new Error(
              "엔진이 모델 응답 오류를 보고했습니다. 모델 ID·API 호환성과 연결을 확인하세요.",
            );
          const text = this.redactor.text(
            message.parts
              .filter((p) => p.type === "text")
              .map((p) => p.text ?? "")
              .join("\n"),
          );
          if (text) updateText(message.info.id, text);
          if (message.info.time?.completed) completed = true;
        }
        if (completed && (await engine.idle()) && broker.active === 0) break;
      }
      if (this.life.valid(epoch)) {
        await engine.close();
        await broker.close();
        this.engineState = "offline";
        this.life.finish();
        this.files = await files.list();
        this.changed();
      }
    } catch (e) {
      broker.stop();
      let closed = true;
      await engine.close().catch(() => {
        closed = false;
      });
      await broker.close();
      if (this.life.valid(epoch)) {
        this.notice = this.error(e);
        this.engineState = "error";
        this.life.confirmStop(closed, closed, broker.active, 0);
        this.changed();
      }
    }
  }
  async stop() {
    if (this.stoppingTask) return this.stoppingTask;
    this.stoppingTask = this.stopInternal();
    try {
      await this.stoppingTask;
    } finally {
      this.stoppingTask = undefined;
    }
  }
  private async stopInternal() {
    if (["idle", "stopped"].includes(this.life.phase)) return;
    const wasReplay = this.life.phase === "replaying";
    this.life.stopping();
    this.autoApproved = false;
    this.broker?.stop();
    this.replayAbort?.abort();
    this.emit();
    if (wasReplay) {
      await this.replayTask;
      this.life.confirmStop(true, true, 0, 0);
      this.changed();
      return;
    }
    try {
      await this.setup?.catch(() => {});
      const aborted = await this.engine?.abort();
      let idle = false;
      for (let i = 0; i < 25; i++) {
        idle = await this.engine!.idle();
        if (idle && (this.broker?.active ?? 0) === 0) break;
        await pause(200);
      }
      await this.engine?.close();
      await this.broker?.close();
      this.engineState = "offline";
      this.life.confirmStop(
        aborted === true,
        idle,
        this.broker?.active ?? 0,
        0,
      );
    } catch {
      this.life.confirmStop(false, false, this.broker?.active ?? 0, 0);
      this.notice =
        "실행 중지가 확인되지 않았습니다. 중지 확인을 다시 시도하세요.";
    }
    this.changed();
  }
  private async replay(session: Session) {
    const epoch = this.life.generation;
    try {
      const text = await replayAnswer(
        this.config!,
        session,
        this.replayAbort!.signal,
      );
      if (!this.life.valid(epoch)) return;
      const reason = detectRepetition(text);
      if (reason) this.notice = `재출력 중 반복 감지: ${reason}`;
      session.messages.push({
        id: randomUUID(),
        role: "assistant",
        text: this.redactor.text(text),
        replay: true,
        at: new Date().toISOString(),
      });
    } catch (e) {
      if (this.life.valid(epoch)) this.notice = this.error(e);
    } finally {
      if (this.life.valid(epoch)) {
        this.life.finish();
        this.changed();
      }
    }
  }
  async close() {
    this.broker?.stop();
    this.replayAbort?.abort();
    await this.engine?.close().catch(() => {});
    await this.broker?.close();
    await this.knowledge.close();
    if (this.historyHealthy) await this.history.save();
  }
}
