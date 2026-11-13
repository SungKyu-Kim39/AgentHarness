# Ned agent-desktop integration

Ned 0.3.5 includes the official native agent-desktop 1.2.0 binary, matching source, Apache-2.0 license, pinned VCRUNTIME140.dll with its original CPython/Windows notice, and two reviewed static skills. It does not require an employee-side npm install or an external service. The selected intranet LLM chooses when to call host tools; agent-desktop itself has no model.

## Usage

Ask Ned to inspect an external local application. It calls `desktop_status`, then applies the selected Ned permission mode to window inventory, a selected window snapshot and subsequent actions. Full access automatically approves supported desktop calls; ask/file-edit-only modes show the native prompts. Qualified refs belong only to that agent session and project. After acting, observe again; an uncertain result must not be retried automatically. File-edit-only auto-approval never grants desktop permission; the explicit persistent full-access mode does.

The reviewed host surface has 20 tools: status, list_windows, list_apps, launch, snapshot, screenshot, focus_window, get, is, click, set_value, clear, select, toggle, check, uncheck, expand, collapse, scroll, scroll_to (each prefixed `desktop_`). Screenshots are restricted to one selected window; they can enter the intranet model context and local conversation history under the user-selected approval mode. No automatic screen upload to OpenViking is performed.

Ned/Zed/agent/terminal/system/approval windows are excluded. Raw MCP access, shell/script execution, global key/coordinate input, clipboard, batch, trace export and automatic headed fallback are not exposed. Upstream examples of those operations are reference documentation, not permission or a promise of availability. A native unsupported-action response is reported as a failure rather than silently switching executors. See the upstream Windows guide through `read_skill` for platform limitations.

## Launching local apps

After status, use `desktop_list_apps` to discover installed applications. `desktop_launch` accepts `calculator` (`calc`), `notepad`, `paint` or an absolute local Windows GUI `.exe` path. It checks the PE GUI subsystem, excludes managed apps/shells/script launchers/system administration tools, freezes executable hash/empty arguments/working directory and applies the selected approval mode (automatic in full access). It rechecks the file before dispatch. Caller-supplied arguments, environment, shell strings, documents and URI associations are not accepted. An approved program runs as the normal user and has its own file/network effects; this is not an OS sandbox for that program.

A successful launch means only that process dispatch succeeded. It must be followed by window inventory and a verified snapshot before interaction. UWP Calculator can broker to another process; a launcher PID disappearing does not justify another launch. GUI apps belong to the user and are not killed when Ned closes. The managed MCP runtime remains independently supervised.

For `3+4*2`, inspect the Calculator mode. Standard sequential entry can produce 14; scientific mode uses precedence and should display 11. Select the mode and buttons from actual observed refs and read the result afterward. A number calculated in the conversation is not GUI execution evidence.

## Lifecycle and offline bundle

The binary is started on demand over private stdio with a fresh app-owned home, standard private AppData directories and explicit `AGENT_DESKTOP_HOME`. The pure standard-library supervisor skips site-package startup. Raw desktop trace capture is not enabled. Temporary ref state is removed after confirmed stop; after a crash, leftovers are not reused as another session's refs. Windows descendants are owned by the existing Job Object supervisor. Cancellation closes the process and revokes refs; an unconfirmed exit blocks subsequent desktop operations until restart. App shutdown closes all managed clients. A closed or timed-out connection is discarded after confirmed stop; subsequent observations create a new connection and old refs cannot be reused. An uncertain action is not replayed and further actions require a fresh verified snapshot. Unconfirmed termination continues to block new processes. Safe failure metadata is written to `%APPDATA%\Ned\diagnostics\desktop-status.json` without raw error text, input, titles or keys. File/image tool responses use the existing bounded MCP content validator and model-key redactor.

Windows 10 1809+ and an unlocked interactive user session are required by this component. Administrator/UAC secure desktop and higher-integrity windows are outside its supported access. The pinned Zed editor has its own requirements. No administrator prompt is introduced by this integration.

## Validation limits

The real pinned Linux MCP starts and returns its version/permissions through the same private client. This cloud shell has no D-Bus accessibility session; a real GUI click/screenshot is not established by that check. Approval denial, unknown refs, project mismatch, target process replacement and managed-window exclusion have separate tests. Actual Windows UIA observation/actions, offline DNS/TCP behavior and child-tree cancellation must be verified on the deployment PC before release acceptance.

## Deployment diagnosis

A deployment probe failed before desktop inspection because the installed Python could not import `urllib` and reported missing `pywin32_bootstrap`. This does not establish the desktop timeout cause. `CHECK_DESKTOP.cmd` / `desktop-probe.ps1` uses Windows PowerShell without Python, checks five runtime-file hashes and compares native status/window inventory with native MCP status. It performs no desktop actions or model calls. The subsequent PowerShell check verified all five file hashes and native status/MCP status; a repeated Python probe successfully listed 18 windows and initialized the supervised MCP with 67 tools and a status reply. The earlier import error did not reproduce. Those results establish runtime readiness, not GUI action success or an exact cause of the old timeout. This revision aligns the host private environment with the successful probe and removes stale client reuse. The refreshed installer checks critical files after extraction and preserves user data.
