# Ned 0.3.2 validation candidate

This revision includes the 0.3.1 startup hotfix and configuration-import automatic restart. It is not a completed Windows acceptance release. Earlier component evidence and outstanding deployment checks remain in [0.3.1 validation](validation-0.3.1.md).

## Startup evidence

The deployment PC's private-profile probe identified `crates/paths/src/paths.rs:204:18`: LocalAppData/RoamingAppData Known Folder lookup returned 0x80070003 before logs initialized. Creating the standard private USERPROFILE/AppData directories resolved both lookups. The user subsequently confirmed that Ned starts after startup fix 1. A separate diagnostic invocation exited 0xC0000005; normal editor startup now works on that PC, but the diagnostic result is not attributed to GPU/DLLs without further evidence. Blank startup no longer requires project selection; AI project access still requires scope approval.

## Configuration import

A successful JSON import validates and encrypts the configuration, requests normal editor window closure, waits for the editor and managed services to exit, then schedules one Electron relaunch. The new host reloads the encrypted vault and rebuilds model gateways/engine configuration. No success dialog requires the user to quit/reopen manually. Windows closure uses a fixed PowerShell Win32 WM_CLOSE request, limited to visible, unowned windows belonging to the exact live editor child PID. No forced editor kill, shell interpolation of JSON, personal settings or model deadline is added.

Unsaved buffers use Zed's normal save prompts. Cancelling save keeps the editor/services running and restart pending; a tray action can cancel the pending relaunch while preserving the saved configuration for next startup. Invalid JSON or encryption failure never requests close. Imports are serialized. Abnormal editor exit or unconfirmed service shutdown never triggers a replacement host.

## Verification

Focused tests exercise real encrypted-vault import and fresh NativeRuntime model/limit reload, save-before-close and shutdown-before-relaunch order, concurrent import refusal, pending cancellation, failed close delivery, abnormal exit, shutdown failure, and editor closure during a vault write. Static Windows checks enforce numeric PID selection and normal WM_CLOSE without termination APIs. Existing startup/ACP tests and package verification are run for the candidate, with exact results recorded beside published downloads.

The full automatic-restart/save-prompt behavior still needs execution on the deployment Windows PC. Linux tests and installer extraction do not establish native Windows close delivery, Win10/Win11 acceptance, company model connectivity, or external-network isolation. Original settings/history/knowledge are preserved. Model and embedding queues retain their existing no-default-deadline behavior.
