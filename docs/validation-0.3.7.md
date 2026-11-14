# Ned 0.3.7 validation and review

Status: implementation and verification in progress. This file does not establish Windows installation or intranet-model acceptance.

## Authorized scope

- Apply the six project-scoped Codex skills to review the host, ACP boundary, settings, tool/knowledge lifecycle, runtime dependencies, installer and release pipeline.
- Optimize installer size and installation file count while retaining offline functionality, user settings, editor state, knowledge, pinned runtimes and license/source availability.
- Add the recently recommended skills (rated at least 3/5) as reviewed static, offline host adapters. Existing duplicate capabilities are retained or complemented rather than replaced silently.
- Activate relevant guidance from request and conversation context without requiring explicit skill names, an extra model call, remote services, new permissions or a default model-response timeout.
- Build and publish version 0.3.7 with source, hashes, installer extraction audit and explicit remaining acceptance limits.

## Baseline observed on Linux

Ned 0.3.6-rebuild1 installer: 1,176,899,012 bytes; SHA-256 4ee7e8809c1a838e593c3654e99b1f37715fb625216290b7d89613463ea52252. Archive extraction reports 94,240 files and 3,375,931,544 uncompressed bytes. These are archive measurements, not Windows installation timings.

Largest areas: OpenViking Python 870 MB/63,622 files; MCP browser 465 MB; separate MCP Python packages 449 MB/17,117 files. Large generated SDK trees contain many small Python modules. Preserve code and native libraries; investigate deterministic ZIP import for reviewed pure-Python SDKs and relocation of optional source archives to the offline handover bundle. Preserve redistributable source and notices.

## Review findings and corrections

- Distribution review: 139 generated pure-Python SDK packages (37,876 modules) are ZIP-imported after every archived source byte is compared with its original. Native/asset/path-sensitive packages remain unpacked. Source-backed build bytecode caches are removed. The preparation report records 38,605 avoided file writes and 312,699,583 installed bytes avoided before the smaller host ASAR is applied.
- Host ASAR review: the host is fully bundled and its smoke check permits only Electron and Node builtins. The release assembler creates a two-file ASAR instead of carrying unused parent-project dependencies. Host and ACP are both rebuilt; the latter uses 192 SHA-locked OpenCode source files and a separate npm dependency lock, not the full desktop development workspace.
- Skill review: 30 static adapters expand the catalog to 66. Modern Web Guidance includes 204 fixed web references; the five built-in-AI/model-download guides are excluded. No upstream executable plugins, online CLI, telemetry, hook setup, mandatory Q&A or parallel agents are installed by these skills.
- Integrity review: malformed manifests and directory escapes fail closed; declared text files are checked before exposing the bundle to the engine and again when read. A corrupt catalog is no longer silently ignored. Long documents have explicit offset continuation rather than silent truncation.
- Context review: local suggestions are only candidates; the answering model uses actual intent/context and may choose other guidance. Preloading is byte-bounded against configured context/output limits and omitted when headroom is insufficient. Engine-side semantic selection is included in normal context accounting. Compaction/checkpoint prompts and tool_choice=none requests are not rewritten with task skills. Original user text, tool definitions and reasoning options are preserved.
- Existing test-harness issue: the editor-owner fixture lacked the current permission-change subscription stub and left its server open on failure. The fixture is corrected; no product permission was relaxed. The NSIS fixture must use a writable ELECTRON_BUILDER_CACHE in this Cloud workspace.
- Preserved boundaries: encrypted settings and private data, editor preferences/buffers, ask/edits/full permissions, project scopes, child-process ownership/cancellation, fixed endpoint/model IDs and deadline-free model waits remain under their existing policies. No private configuration or user conversation is added to release content.

## Verification record

Environment: Linux Cloud executor; Node 24.22.1; fixed OpenCode v2.2.6 Linux baseline archive SHA-256 08bb21d6326ce740d91cce7ebe88a6536933f6e1e30353b91a06b01f25da306c, binary SHA-256 50503d24577fa4117a7c95ee85b2cd679606a87eacf20ca54ed5db5c9e1cf895. Model endpoints are synthetic loopback OpenAI-compatible fixtures; no company model or embedding credentials are used.

- npm run typecheck: passed.
- ELECTRON_BUILDER_CACHE=$PWD/.cache/ned/builder-cache npm test: 147 tests, 132 passed, 15 skipped, zero failures (309.8 seconds). Skips cover unavailable legacy 1.19.5 paths, Linux OpenViking/native runtime fixtures and optional Wine/Windows execution; they are not reported as acceptance success.
- Targeted latest transport/routing/skill/native-runtime suite: 21 passed, zero skips (104.7 seconds). It includes real v2 engine skill discovery, model wire IDs/thinking variants and guarded file edits. Follow-up checks cover the final byte-budget and tool-free/compaction exclusions.
- node --test tests/runtime-optimization.test.mjs: source-backed cache removal, ZIP-member identity, actual isolated Python ZIP import and preservation of asset/native/path-sensitive packages passed.
- NSIS fixture compiles with the cached pinned toolchain; optional Windows/Wine execution remains skipped locally.
- The real v2 queue fixture waited beyond the former 180-second response deadline and then verified explicit cancellation (187.7 seconds); no default model-response timeout is added.
- Full installer generation, complete staged-vs-extracted byte comparison, ASCII path checks, public download hashes and the Windows installer/import comparison are pending at this checkpoint.

Keep releaseReady false until the existing real Win10/Win11 GUI/intranet/offline-network acceptance criteria are met. Windows Server CI, when completed, is reported separately from those criteria.
