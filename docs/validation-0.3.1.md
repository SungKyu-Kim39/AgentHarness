# Ned 0.3.1 validation candidate

Date: 2026-11-12 UTC. This is a candidate, not a completed Windows acceptance release.

## Changes and evidence

- Editor launcher: retain safe exit codes/hex/OS error and fixed failure categories; inspect only a bounded app-owned log tail. A failing early Windows process gets a GUI-free loader probe. Never persist raw process output or environment variables. Close/error handling is unified, including signal exit. Create all private profile directories and supply fixed Windows shell/system runtime paths. The installer fails if the bundled editor, CLI helper or app archive is missing after extraction.
- User evidence: Windows 10.0.19044; no log or editor/helper at the presumed default Ned installation path. Actual installed path/version remains necessary to distinguish location mismatch from incomplete installation. These facts do not prove a GPU/DLL cause or establish that the user-visible startup failure is resolved.
- OpenViking: registration exposes lookup/upload/import/verify/state progress and safe per-skill HTTP/error codes, with persisted `openviking/skills-status.json`. Keep the last 20 safe model transport events in `model-status.json`. Manual recheck retains successes and external conflicts. Float embedding requests avoid implicit base64/dimension-reduction parameters and validate returned dimensions. The company 0/34 failure still requires its resulting safe diagnostics for causal attribution.
- agent-desktop: official 1.2.0 Windows/Linux native binaries and corresponding source hashes pinned. Eighteen host-mediated semantic tools, separate native approvals, private homes, qualified-ref/window/process/session binding, managed/system/terminal exclusion, Job supervisor and confirmed stop. Two static adapted skills increase the default total from 34 to 36.
- Personal export: 401/500 occurred at the OLD server, before Ned import. Add authenticated user-root preflight, fixed stage/status messages and explicit no-vector export. Never bypass auth, overwrite output, copy a live DB or silently drop vectors. Ned and legacy L-Vibe Python paths are supported.

## Executed checks

The real pinned Linux OpenViking 0.5.4 registered all 36 default skills, restarted without duplicate model requests and enforced project scope. The real 0.5.0 server exported a synthetic user pack into 0.5.4; personal reads and cross-project queries passed. These use synthetic local model endpoints and test credentials, not the company's BGE/Qwen service.

The native agent-desktop MCP reported version/permissions using a private home. No D-Bus accessibility session is available in this shell, so no actual GUI operation is claimed. Focused tests cover approval/ref/project/process guards, startup diagnostic privacy, fixed profile directories, BGE request/response shape, HTTP 401 diagnostics and retrying only unfinished skills. Final test counts and installer audit are recorded alongside artifacts when published.

## Required deployment checks

Confirm actual installed editor path and startup result, UIA actions on Win10/Win11, BGE vector shape and skill registration, old-server export authentication/vector behavior, intranet model queuing, DNS/TCP observations, file ACLs, child-process stop and real SDK/compiler compatibility. Source/unit/Linux tests and an extracted installer are not substitutes for those checks. Existing settings, history and original OpenViking storage must be preserved.
