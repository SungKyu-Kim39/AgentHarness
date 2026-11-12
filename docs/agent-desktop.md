# Ned agent-desktop integration

Ned 0.3.1 includes the official native agent-desktop 1.2.0 binary, matching source, Apache-2.0 license, and two reviewed static skills. It does not require an employee-side npm install or an external service. The selected intranet LLM chooses when to call host tools; agent-desktop itself has no model.

## Usage

Ask Ned to inspect an external local application. It calls `desktop_status`, then requests native approval for window inventory, a selected window snapshot and subsequent actions. Qualified refs belong only to that agent session and project. After acting, observe again; an uncertain result must not be retried automatically. File-edit auto-approval never grants desktop permission.

The reviewed host surface has 18 tools: status, list_windows, snapshot, screenshot, focus_window, get, is, click, set_value, clear, select, toggle, check, uncheck, expand, collapse, scroll, scroll_to (each prefixed `desktop_`). Screenshots are restricted to one selected window; they can enter the intranet model context and local conversation history after explicit approval. No automatic screen upload to OpenViking is performed.

Ned/Zed/agent/terminal/system/approval windows are excluded. Raw MCP access, arbitrary application launch, global key/coordinate input, clipboard, batch, trace export and automatic headed fallback are not exposed. Upstream examples of those operations are reference documentation, not permission or a promise of availability. A native unsupported-action response is reported as a failure rather than silently switching executors. See the upstream Windows guide through `read_skill` for platform limitations.

## Lifecycle and offline bundle

The binary is started on demand over private stdio with a fresh app-owned home. Raw desktop trace capture is not enabled. Temporary ref state is removed after confirmed stop; after a crash, leftovers are not reused as another session's refs. Windows descendants are owned by the existing Job Object supervisor. Cancellation closes the process and revokes refs; an unconfirmed exit blocks subsequent desktop operations until restart. App shutdown closes all managed clients. File/image tool responses use the existing bounded MCP content validator and model-key redactor.

Windows 10 1809+ and an unlocked interactive user session are required by this component. Administrator/UAC secure desktop and higher-integrity windows are outside its supported access. The pinned Zed editor has its own requirements. No administrator prompt is introduced by this integration.

## Validation limits

The real pinned Linux MCP starts and returns its version/permissions through the same private client. This cloud shell has no D-Bus accessibility session; a real GUI click/screenshot is not established by that check. Approval denial, unknown refs, project mismatch, target process replacement and managed-window exclusion have separate tests. Actual Windows UIA observation/actions, offline DNS/TCP behavior and child-tree cancellation must be verified on the deployment PC before release acceptance.
