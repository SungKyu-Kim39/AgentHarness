# Ned 0.3.3 validation candidate

This revision adds installer-side configuration staging, memory-only conversation/project edit approval, approved GUI application dispatch and desktop connection recovery. It remains a Windows acceptance candidate. The prior deployment confirmation of ACP chat and automatic configuration restart belongs to the cumulative 0.3.1 patch; it is not proof that every new full-installer feature has run on Windows.

## Configuration installation

Only `$EXEDIR/agent-config.json` is copied on a first install without existing encrypted settings. A provided file bypasses the template editor; an absent file retains the existing default-template workflow. On first application launch ConfigVault validates, encrypts and removes only the staged plaintext. Existing settings, history and knowledge remain unchanged on upgrades. Invalid JSON/encryption failure does not silently initialize defaults. NSIS checks critical editor/desktop/Python files and errors on failed config copies or a directory supplied as the config.

## Edit approval

The native file dialog offers this edit, current request and current conversation/project grants. The latter survives new messages but is revoked on use of a different conversation/project, cancellation, restart, configuration-restart request or tray revocation. ACP session binding also detects scope changes. Grants stay in memory; no engine `always` or persistent config permission is written. An epoch and combined abort signal prevent delayed writes after revocation, including editor validation/snapshot waits. Protected paths, base-content conflicts and unsaved buffers remain checked.

## Desktop changes and evidence limits

The managed surface has 20 tools, adding installed-app discovery and GUI dispatch. Dispatch accepts named Windows builtins or an explicitly approved absolute local GUI `.exe`, validates PE subsystem/exclusions, freezes hash/empty argv/cwd and rechecks before execution. It has no caller shell/args/env or file/URI associations. The user GUI process remains outside the managed MCP Job and is not killed on Ned shutdown. It can perform its own ordinary user-level effects; this is not an OS sandbox for that app. Launch success never claims a visible window or completed task.

A dead/timed-out private client is no longer retained in the desktop-session cache. Confirmed stop discards refs and home; observations can create a new connection. Uncertain actions are not replayed and require a new verified snapshot before further actions. An unconfirmed exit blocks new executions. Private Windows AppData directories and explicit AGENT_DESKTOP_HOME are provided; the stdlib-only supervisor skips site packages.

The deployment Python-based probe failed on missing `urllib` and `pywin32_bootstrap` before inspecting desktop behavior. Missing files, altered Python paths, installer faults and security software have not yet been distinguished. Python-independent probe 2 checks fixed file hashes and native CLI/MCP status; its Windows result remains pending. No Windows Calculator launch, click or result has yet been verified by these changes. Calculator standard sequential arithmetic and scientific precedence are distinguished in bundled guidance; conversational arithmetic is not GUI evidence.

## Execution record

Typecheck, Ned build and all 36 skill hashes passed during development. Focused approval/config/scope checks passed 26/26; focused desktop/GUI validation/private MCP checks passed 9/9. The real pinned Linux desktop MCP returned version/permissions. That check has no Windows UIA or active GUI session. Full regression, exact source commit and installer/archive audit results will be recorded with published artifacts. Deployment checks must include first-install EXE config, existing-data preservation, conversation approval reset, actual GUI launch/observation/actions and cancellation on Win10/Win11 with external DNS/TCP observed and company model endpoints only. Corporate LLM/embedding queue waits retain no default generation deadline.

A small NSIS/Wine fixture was attempted, but the cached Wine runtime lacks kernel32.dll and cannot load cmd.exe (c0000135). No installer-execution success is claimed from that attempt; the optional Wine test is skipped where that dependency is absent. Full installer compilation/extraction and ConfigVault behavior are checked separately.
