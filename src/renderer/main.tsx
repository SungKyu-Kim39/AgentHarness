import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { diffLines } from "diff";
import {
  FolderOpen,
  Plus,
  Settings2,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  Square,
  RotateCcw,
  FileCode2,
  Files,
  GitCompareArrows,
  X,
  Check,
  ShieldCheck,
  Circle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Terminal,
  ArrowUpRight,
  PanelRightClose,
  PanelRightOpen,
  CornerDownLeft,
  MessageSquare,
  Code2,
  FileText,
  Layers,
  LockKeyhole,
  Copy,
} from "lucide-react";
import type {
  AppState,
  Proposal,
  Request,
  ToolEvent,
} from "../shared/contracts";
import "./style.css";
import ligIcon from '../../assets/lig-icon.png';
const initial: AppState = {
  phase: "idle",
  projects: [],
  sessions: [],
  files: [],
  engine: "offline",
  sessionApproval: false,
  capabilities: { commands: false, serena: false, snapshots: true },
};
const statusLabel = {
  idle: "준비됨",
  running: "작업 중",
  stopping: "중지 확인 중",
  stopped: "중지 확인됨",
  unconfirmed: "중지 미확인",
  replaying: "답변 재출력 중",
};
const toolLabel = {
  waiting: "대기",
  approval: "승인 대기",
  running: "실행 중",
  success: "성공",
  failed: "실패",
};
function App() {
  const [state, setState] = useState<AppState>(initial);
  const [input, setInput] = useState("");
  const [modelPicker, setModelPicker] = useState(false);
  const [confirmIndex, setConfirmIndex] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState(false);
  const [right, setRight] = useState(true);
  const [tab, setTab] = useState<"files" | "changes">("files");
  const [selected, setSelected] = useState<string>();
  const [file, setFile] = useState<{ path: string; content: string }>();
  const [fileQuery, setFileQuery] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const current = state.sessions.find((s) => s.id === state.activeSessionId);
  const project = state.projects.find((p) => p.id === current?.projectId);
  const proposals = current?.proposals ?? [];
  const proposal = proposals.find((p) => p.id === selected) ?? proposals.at(-1);
  const busy = !["idle", "stopped"].includes(state.phase);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "n" && !busy) {
        event.preventDefault();
        void invoke(
          project
            ? { action: "newSession", projectId: project.id }
            : { action: "openProject" },
        );
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [project?.id, busy]);
  const preview = !window.vibe;
  useEffect(() => {
    if (!window.vibe) return;
    const off = window.vibe.subscribe(setState);
    void window.vibe.invoke({ action: "state" }).then((r) => {
      if (r.state) setState(r.state);
    });
    return off;
  }, []);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [current?.messages.at(-1)?.text, current?.tools.length]);
  useEffect(() => {
    if (proposals.some((p) => p.status === "pending")) {
      setTab("changes");
      setRight(true);
    }
  }, [proposals.length]);
  async function invoke(request: Request) {
    setError("");
    if (!window.vibe) {
      setError(
        "화면 미리보기입니다. 파일·모델 연결은 L-Vibe 데스크톱 앱에서 사용할 수 있습니다.",
      );
      return;
    }
    try {
      const reply = await window.vibe.invoke(request);
      if (!reply.ok) setError(reply.error ?? "요청 실패");
      return reply;
    } catch {
      setError("앱 호스트와 연결하지 못했습니다.");
    }
  }
  async function send() {
    if (!input.trim() || busy) return;
    const text = input;
    const result = await invoke({ action: "send", text });
    if (result?.ok) setInput("");
  }
  function starter(text: string) {
    setInput(text);
    textarea.current?.focus();
  }
  async function openFile(path: string) {
    const reply = await invoke({ action: "readFile", path });
    if (reply?.ok) setFile({ path, content: reply.content ?? "" });
  }
  const timeline = [
    ...(current?.messages ?? []).map((m) => ({
      kind: "message" as const,
      at: m.at,
      item: m,
    })),
    ...(current?.tools ?? []).map((t) => ({
      kind: "tool" as const,
      at: t.at,
      item: t,
    })),
  ].sort((a, b) => a.at.localeCompare(b.at));
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <img className="lig-logo" src={ligIcon} alt="LIG" />
          <div>
            <strong>L-Vibe</strong>
            <span className="brand-sub">VIBE CODING WORKSPACE</span>
          </div>
        </div>
        <button
          className="new-task"
          onClick={() =>
            project
              ? void invoke({ action: "newSession", projectId: project.id })
              : void invoke({ action: "openProject" })
          }
          disabled={busy}
        >
          <Plus size={17} />새 작업<span>Ctrl N</span>
        </button>
        <div className="side-heading">
          워크스페이스
          <button
            title="프로젝트 열기"
            disabled={busy}
            onClick={() => void invoke({ action: "openProject" })}
          >
            <Plus size={14} />
          </button>
        </div>
        <button
          className={"project-button " + (project ? "active" : "")}
          disabled={busy}
          onClick={() => void invoke({ action: "openProject" })}
        >
          <FolderOpen size={18} />
          <span>{project?.name ?? "프로젝트 열기"}</span>
          <ChevronDown size={14} />
        </button>
        {state.projects
          .filter((p) => p.id !== project?.id)
          .map((p) => (
            <button
              className="project-button"
              key={p.id}
              disabled={busy}
              onClick={() =>
                void invoke({ action: "newSession", projectId: p.id })
              }
            >
              <FolderOpen size={17} />
              <span>{p.name}</span>
            </button>
          ))}
        <div className="side-heading recent-heading">
          최근 대화
          <span>{state.sessions.length.toString().padStart(2, "0")}</span>
        </div>
        <nav className="conversation-list">
          {state.sessions.length ? (
            state.sessions.map((s) => (
              <button
                className={
                  "conversation " + (s.id === current?.id ? "selected" : "")
                }
                disabled={busy}
                key={s.id}
                onClick={() =>
                  void invoke({ action: "selectSession", sessionId: s.id })
                }
              >
                <MessageSquare size={15} />
                <span>{s.title}</span>
              </button>
            ))
          ) : (
            <div className="empty-recent">
              프로젝트의 첫 작업을
              <br />
              시작해 보세요.
            </div>
          )}
        </nav>
        <div className="side-bottom">
          <button className={'knowledge-status ' + state.knowledge?.status} onClick={() => setSettings(true)}><span className="model-dot"/><span>OpenViking <small>{({ready:'실행 중',starting:'시작 중',stopping:'종료 중',error:'확인 필요',disabled:'꺼짐',unconfigured:'설정 필요'} as Record<string,string>)[state.knowledge?.status ?? 'unconfigured']}</small></span></button>
          <div className="private-note">
            <ShieldCheck size={16} />
            <div>
              사내 개발 환경<span>대화는 이 PC에 보관됩니다</span>
            </div>
          </div>
          <button className="settings-button" onClick={() => setSettings(true)}>
            <Settings2 size={17} />
            모델 설정
            <ChevronRight size={14} />
          </button>
          <div className="version">
            <span>L-Vibe</span>
            <span>v0.1.0</span>
          </div>
        </div>
      </aside>
      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>워크스페이스</span>
            <ChevronRight size={13} />
            <strong>{project?.name ?? "새 작업"}</strong>
          </div>
          <div className="topbar-actions">
            <span className={"connection " + (state.model ? "configured" : "")}>
              <i />
              {state.model ? "사내 모델 설정됨" : "모델 연결 대기"}
            </span>
            <span className="topbar-divider" />
            <button
              title={right ? "파일 패널 닫기" : "파일 패널 열기"}
              onClick={() => setRight(!right)}
            >
              {right ? (
                <PanelRightClose size={18} />
              ) : (
                <PanelRightOpen size={18} />
              )}
            </button>
          </div>
        </header>
        <div className="workspace-bar">
          <div>
            <span className="tiny-label">WORKSPACE</span>
            <h1>{current?.title ?? "새로운 작업"}</h1>
          </div>
          <div className={"phase-badge " + state.phase}>
            <i />
            {statusLabel[state.phase]}
          </div>
        </div>
        <div className="chat-scroll">
          {!timeline.length ? (
            <div className="welcome">
              <div className="welcome-mark">
                <Layers size={27} />
                <span />
              </div>
              <div className="eyebrow">YOUR LOCAL DEVELOPMENT PARTNER</div>
              <h2>
                다음 작업을 함께
                <br />
                <span>만들어 볼까요?</span>
              </h2>
              <p>
                코드를 살펴보고, 변경을 제안하고, 문서를 작성하세요.
                <br />
                프로젝트의 모든 변경은 직접 확인할 수 있습니다.
              </p>
              <div className="starter-grid">
                <button
                  onClick={() =>
                    starter("프로젝트 구조와 주요 모듈의 역할을 분석해줘.")
                  }
                >
                  <Code2 size={20} />
                  <strong>코드 이해하기</strong>
                  <span>프로젝트 구조와 흐름 분석</span>
                  <ArrowUpRight size={16} />
                </button>
                <button
                  onClick={() =>
                    starter(
                      "변경하려는 요구사항을 먼저 정리하고, 관련 코드를 조사해줘.",
                    )
                  }
                >
                  <GitCompareArrows size={20} />
                  <strong>변경 시작하기</strong>
                  <span>영향 확인부터 수정 제안까지</span>
                  <ArrowUpRight size={16} />
                </button>
                <button
                  onClick={() =>
                    starter(
                      "프로젝트 코드를 바탕으로 개발 문서 초안을 작성해줘.",
                    )
                  }
                >
                  <FileText size={20} />
                  <strong>문서 작성하기</strong>
                  <span>코드에 근거한 개발 문서</span>
                  <ArrowUpRight size={16} />
                </button>
              </div>
              <div className="welcome-foot">
                <LockKeyhole size={13} />
                <span>
                  {project
                    ? "프로젝트 안의 읽기·검색은 자동으로 진행됩니다"
                    : "프로젝트를 선택하면 시작할 수 있습니다"}
                </span>
              </div>
            </div>
          ) : (
            <div className="timeline">
              {timeline.map((entry) =>
                entry.kind === "message" ? (
                  <div
                    className={"message " + entry.item.role}
                    key={entry.item.id}
                  >
                    <div className="message-avatar">
                      {entry.item.role === "assistant" ? "L" : "나"}
                    </div>
                    <div className="message-body">
                      <div className="message-meta">
                        <strong>
                          {entry.item.role === "assistant"
                            ? "L-Vibe"
                            : "사용자"}
                        </strong>
                        {entry.item.replay && (
                          <span className="replay-label">
                            <RotateCcw size={10} />
                            답변 재출력
                          </span>
                        )}
                        <time>
                          {new Date(entry.at).toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                      </div>
                      <TextContent text={entry.item.text} />
                    </div>
                  </div>
                ) : (
                  <ToolCard
                    key={entry.item.id}
                    tool={entry.item}
                    proposal={proposals.find((p) => p.callId === entry.item.id)}
                    onInspect={(id) => {
                      setSelected(id);
                      setTab("changes");
                      setRight(true);
                    }}
                    onApprove={(id, decision) =>
                      void invoke({
                        action: "approve",
                        proposalId: id,
                        decision,
                      })
                    }
                  />
                ),
              )}
            </div>
          )}
          {busy && (
            <div className="working-indicator">
              <Loader2 size={15} className="spin" />
              {state.phase === "running"
                ? state.engine === "starting"
                  ? "앱 전용 엔진을 준비하고 있습니다"
                  : "실제 작업 결과를 기다리고 있습니다"
                : statusLabel[state.phase]}
            </div>
          )}
          <div ref={end} />
        </div>
        <div className="composer-area">
          {(error || state.notice || state.configError) && (
            <div className="notice" role="status">
              <AlertCircle size={15} />
              <span>{error || state.notice || state.configError}</span>
              {error && (
                <button title="알림 닫기" onClick={() => setError("")}>
                  <X size={13} />
                </button>
              )}
            </div>
          )}
          {state.sessionApproval && (
            <div className="auto-approval">
              <ShieldCheck size={13} />이 세션의 파일 수정 자동 승인 사용 중
              <button onClick={() => void invoke({ action: "resetApproval" })}>
                해제
              </button>
            </div>
          )}
          <div className="composer">
            <textarea
              ref={textarea}
              aria-label="작업 요청"
              placeholder={
                project
                  ? "어떤 작업을 도와드릴까요?"
                  : "프로젝트를 열고 작업을 요청하세요"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={2}
            />
            <div className="composer-toolbar">
              <div className="model-picker-wrap"><button className="model-select" disabled={busy} onClick={() => (state.models?.length ?? 0) > 1 ? setModelPicker(!modelPicker) : setSettings(true)}>
                <span className="model-dot" />
                {state.model?.name ?? state.model?.id ?? "사내 모델 설정"}
                <ChevronDown size={12} />
              </button>{modelPicker && <div className="model-menu" role="listbox" aria-label="LLM 모델 선택">{state.models?.map(model => <button key={model.name} role="option" aria-selected={model.name === state.model?.name} onClick={async () => { await invoke({action:'selectModel',name:model.name});setModelPicker(false); }}><span><strong>{model.name}</strong><small>{model.id}</small></span>{model.name === state.model?.name && <Check size={13}/>}</button>)}</div>}</div>
              <div className="composer-actions">
                {state.phase === "stopped" && (
                  <button
                    className="replay-button"
                    onClick={() => void invoke({ action: "replay" })}
                    title="도구 없이 답변만 다시 작성"
                  >
                    <RotateCcw size={14} />
                    답변 재출력
                  </button>
                )}
                {state.phase === "unconfirmed" && (
                  <button
                    className="retry-stop"
                    onClick={() => void invoke({ action: "stop" })}
                  >
                    중지 확인 재시도
                  </button>
                )}
                {busy && state.phase !== "unconfirmed" ? (
                  <button
                    className="send-button stop"
                    title="작업 중지"
                    onClick={() => void invoke({ action: "stop" })}
                    disabled={state.phase === "stopping"}
                  >
                    <Square size={13} fill="currentColor" />
                  </button>
                ) : (
                  <button
                    className="send-button"
                    title="요청 보내기"
                    onClick={() => void send()}
                    disabled={!input.trim() || busy || (!project && !preview)}
                  >
                    <ArrowUp size={19} />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="composer-hint">
            <span>
              <ShieldCheck size={12} />
              파일 수정은 승인 후 적용됩니다
            </span>
            <span>
              Enter 전송<span className="hint-separator">·</span>Shift + Enter
              줄바꿈
            </span>
          </div>
        </div>
      </main>
      {right && (
        <aside className="right-panel">
          <div className="right-header">
            <span>프로젝트 컨텍스트</span>
            <button title="패널 닫기" onClick={() => setRight(false)}>
              <X size={15} />
            </button>
          </div>
          <div className="right-tabs">
            <button
              className={tab === "files" ? "active" : ""}
              onClick={() => setTab("files")}
            >
              <Files size={15} />
              파일<span>{state.files.length}</span>
            </button>
            <button
              className={tab === "changes" ? "active" : ""}
              onClick={() => setTab("changes")}
            >
              <GitCompareArrows size={15} />
              변경<span>{proposals.length}</span>
            </button>
          </div>
          {tab === "files" ? (
            <>
              <div className="file-search">
                <Search size={14} />
                <input
                  aria-label="파일 찾기"
                  placeholder="파일 찾기…"
                  value={fileQuery}
                  onChange={(e) => setFileQuery(e.target.value)}
                />
                <kbd>⌕</kbd>
              </div>
              <div className="file-tree">
                {state.files.length ? (
                  state.files
                    .filter((f) =>
                      f.toLowerCase().includes(fileQuery.toLowerCase()),
                    )
                    .map((f) => (
                      <button
                        className={file?.path === f ? "active" : ""}
                        title={f}
                        key={f}
                        onClick={() => void openFile(f)}
                      >
                        <FileCode2 size={15} />
                        <span>{f}</span>
                      </button>
                    ))
                ) : (
                  <div className="right-empty">
                    <div className="empty-icon">
                      <FolderOpen size={25} />
                    </div>
                    <strong>아직 열린 프로젝트가 없습니다</strong>
                    <p>
                      프로젝트 폴더를 선택하면
                      <br />
                      파일을 탐색할 수 있습니다.
                    </p>
                    <button
                      disabled={busy}
                      onClick={() => void invoke({ action: "openProject" })}
                    >
                      <Plus size={14} />
                      프로젝트 열기
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="changes-view">
              {proposals.length ? (
                <>
                  <div className="proposal-list">
                    {proposals.map((p) => (
                      <button
                        className={p.id === proposal?.id ? "active" : ""}
                        key={p.id}
                        onClick={() => setSelected(p.id)}
                      >
                        <FileCode2 size={14} />
                        <span>{p.path}</span>
                        <small>
                          {p.status === "applied"
                            ? "적용됨"
                            : p.status === "pending"
                              ? "제안"
                              : p.status === "conflict"
                                ? "충돌"
                                : "거절"}
                        </small>
                      </button>
                    ))}
                  </div>
                  {proposal && <DiffView proposal={proposal} />}
                </>
              ) : (
                <div className="right-empty">
                  <div className="empty-icon">
                    <GitCompareArrows size={25} />
                  </div>
                  <strong>변경 제안이 없습니다</strong>
                  <p>
                    수정 제안과 적용 결과를
                    <br />
                    이곳에서 확인할 수 있습니다.
                  </p>
                </div>
              )}
            </div>
          )}
          <div className="context-footer">
            <div>
              <span className="context-dot" />
              로컬 프로젝트
            </div>
            <span>명령 실행 차단</span>
          </div>
        </aside>
      )}
      {settings && (
        <div
          className="modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSettings(false);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
          >
            <div className="modal-title">
              <div>
                <Settings2 size={19} />
                <h2 id="settings-title">모델 설정</h2>
              </div>
              <button title="설정 닫기" onClick={() => setSettings(false)}>
                <X size={18} />
              </button>
            </div>
            <p className="modal-description">
              사내에서 배포한 agent-config.json을 가져오세요.
              <br />
              API Key는 Windows 사용자 보호 기능으로 암호화됩니다.
            </p>
            <label>API 기준 경로</label>
            <div className="setting-value">
              {state.model?.baseUrl ?? "설정되지 않음"}
            </div>
            <label>모델 ID</label>
            <div className="setting-value">
              {state.model?.id ?? "서버에 등록된 ID가 필요합니다"}
            </div>
            <label>등록된 LLM</label><div className="setting-value">{state.models?.length ? state.models.map(m => m.name).join(' · ') : state.model?.id ?? '없음'}</div>
            <label>OpenViking · 임베딩 모델 한 개</label><div className="setting-value">{state.knowledge?.embedding ? `${state.knowledge.embedding.id} (${state.knowledge.embedding.dimension} 차원)\n${state.knowledge.embedding.baseUrl}` : 'JSON의 openViking.embedding에서 설정하세요.'}</div>
            {state.knowledge?.message && <p className="modal-description">{state.knowledge.message}</p>}
            <details className="bundled-skills"><summary>바이브 코딩 기본 스킬 {state.skills?.length ?? 0}개</summary><ul>{state.skills?.map(s => <li key={s.id}><strong>{s.name}</strong><span>{s.description}</span></li>)}</ul></details>
            <div className="security-info">
              <LockKeyhole size={17} />
              <span>
                API Key는 화면에 전달되지 않습니다.
                <br />
                모델 목록을 조회하거나 외부 서비스에 연결하지 않습니다.
              </span>
            </div>
            {state.configError && (
              <div className="notice">{state.configError}</div>
            )}
            <div className="modal-actions">
              <button className="secondary" onClick={() => setSettings(false)}>
                닫기
              </button>
              <button
                className="primary"
                disabled={busy}
                onClick={async () => {
                  const r = await invoke({
                    action: "importConfig",
                    replace: !!(state.model || state.configError),
                  });
                  if (r?.ok) setSettings(false);
                }}
              >
                <FolderOpen size={15} />
                {state.model || state.configError
                  ? "설정 파일을 선택해 교체"
                  : "설정 파일 가져오기"}
              </button>
            </div>
            <small>
              저장된 설정과 대화는 앱 업데이트·제거 후에도 보존됩니다.
            </small>
          </section>
        </div>
      )}
      {file && (
        <div className="modal-overlay">
          <section className="file-modal">
            <div className="modal-title">
              <div>
                <FileCode2 size={17} />
                <strong>{file.path}</strong>
              </div>
              <button title="파일 닫기" onClick={() => setFile(undefined)}>
                <X size={18} />
              </button>
            </div>
            <pre>{file.content}</pre>
            <div className="file-knowledge-actions">{confirmIndex ? <><span>이 파일 내용을 사내 임베딩 모델로 보내 현재 프로젝트의 로컬 지식에 저장합니다.</span><button className="secondary" disabled={indexing} onClick={() => setConfirmIndex(false)}>취소</button><button className="primary" disabled={indexing || busy} onClick={async () => { setIndexing(true);await invoke({action:'indexKnowledge',path:file.path});setIndexing(false);setConfirmIndex(false); }}>{indexing ? '색인 중…' : '선택 파일 색인 승인'}</button></> : <button className="secondary" disabled={busy || state.knowledge?.status !== 'ready'} onClick={() => setConfirmIndex(true)}>OpenViking 지식에 추가</button>}</div>
          </section>
        </div>
      )}
    </div>
  );
}
function TextContent({ text }: { text: string }) {
  const parts = text.split(/(```[\s\S]*?(?:```|$))/g);
  return (
    <div className="message-text">
      {parts.map((part, i) =>
        part.startsWith("```") ? (
          <pre key={i}>
            <code>{part.replace(/^```[^\n]*\n?/, "").replace(/```$/, "")}</code>
          </pre>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </div>
  );
}
function ToolCard({
  tool,
  proposal,
  onInspect,
  onApprove,
}: {
  tool: ToolEvent;
  proposal?: Proposal;
  onInspect(id: string): void;
  onApprove(id: string, decision: "once" | "session" | "reject"): void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={"tool-card " + tool.status}>
      <button className="tool-summary" onClick={() => setExpanded(!expanded)}>
        {tool.status === "success" ? (
          <CheckCircle2 size={16} />
        ) : tool.status === "failed" ? (
          <AlertCircle size={16} />
        ) : tool.status === "approval" ? (
          <ShieldCheck size={16} />
        ) : (
          <Loader2 className="spin" size={16} />
        )}
        <strong>{tool.tool}</strong>
        <span>{tool.target}</span>
        <small>{toolLabel[tool.status]}</small>
        <ChevronDown size={13} />
      </button>
      <div className="tool-call-id">호출 ID {tool.id}</div>
      {expanded && tool.result && (
        <pre className="tool-result">{tool.result}</pre>
      )}
      {proposal && (
        <div className="approval-content">
          <div>
            <FileCode2 size={15} />
            <strong>{proposal.path}</strong>
            <button onClick={() => onInspect(proposal.id)}>
              변경 비교
              <ArrowUpRight size={12} />
            </button>
          </div>
          {proposal.status === "pending" && (
            <>
              <p>제안 내용을 확인한 뒤 파일 수정을 승인하세요.</p>
              <div className="approval-actions">
                <button
                  className="secondary"
                  onClick={() => onApprove(proposal.id, "reject")}
                >
                  거절
                </button>
                <button
                  className="secondary"
                  onClick={() => onApprove(proposal.id, "session")}
                >
                  이 세션 자동 승인
                </button>
                <button
                  className="primary"
                  onClick={() => onApprove(proposal.id, "once")}
                >
                  <Check size={13} />한 번 승인
                </button>
              </div>
            </>
          )}
          {proposal.result && <p>{proposal.result}</p>}
        </div>
      )}
    </div>
  );
}
function DiffView({ proposal }: { proposal: Proposal }) {
  const parts = diffLines(proposal.before, proposal.after);
  return (
    <div className="diff-view">
      <div className="diff-caption">
        <strong>
          {proposal.status === "applied"
            ? "실제 적용 결과"
            : "승인 전 수정 제안"}
        </strong>
        <span>호스트 스냅샷 비교</span>
      </div>
      <div className="diff-legend">
        <span className="removed">− 변경 전</span>
        <span className="added">+ 변경 후</span>
      </div>
      <pre>
        {parts.map((part, i) =>
          part.value
            .split("\n")
            .filter((line, j, all) => j < all.length - 1 || line)
            .map((line, j) => (
              <div
                key={`${i}-${j}`}
                className={
                  part.added ? "diff-added" : part.removed ? "diff-removed" : ""
                }
              >
                <span>{part.added ? "+" : part.removed ? "−" : " "}</span>
                {line || " "}
              </div>
            )),
        )}
      </pre>
      {proposal.result && <p className="diff-result">{proposal.result}</p>}
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
