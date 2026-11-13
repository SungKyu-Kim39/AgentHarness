# Ned 0.3.6 validation scope

This candidate includes the compact desktop snapshot identity repair, Windows project-open workaround, late-exit diagnostic classification and an installation directory page. Original 0.3.4 and 0.3.5 binaries remain immutable; the separate snapshot-only repair archive targets their exact original hashes. New 0.3.6 installations do not need that repair.

## Desktop snapshot

The pinned agent-desktop 1.2.0 snapshot returns the app at the top level and only id/title in window. The host previously required full inventory fields inside window, causing valid snapshots to fail. Tests now use the actual compact contract. Capture is checked against full inventory before and after the call; contradictory optional fields, process replacement and blocked apps are refused. A dispatched snapshot clears old refs, including on failure. Regression checks exercise qualified mock actions and process changes. These are protocol/security checks, not actual Windows UIA capture or click acceptance.

## Project opening and editor exit

The user reported a 0xc000041d callback exception after selecting a folder in the native Windows picker on 0.3.5 (editor 1.28.1.0). The recorded fault module was unknown; no GPU, IME or desktop-tool cause is established. The editor now uses its internal path picker on Windows. A separate Ned tray folder picker runs in the host's unchanged Windows shell environment, exposing actual Desktop/Favorites. The selected canonical directory is dispatched to the fixed bundled CLI using literal argv and the private editor profile. Tests cover cancellation, failed dispatch, concurrent clicks and editor exit. Private Zed settings are not copied or read. Late abnormal termination is described as an editor exit rather than a startup failure.

This is a workaround for the reported native picker route. Reproduce installation, Desktop/Favorites selection, folder dispatch, reopening an existing project and closing/restarting multiple windows on Windows 10/11 before declaring the issue resolved. Virtual shell items without a filesystem directory are not project folders.

## Installation location

The NSIS directory page allows a dedicated writable folder such as D:\Programs\Ned, defaults upgrades to HKCU InstallLocation and retains user data under APPDATA\Ned. Drive roots and nonempty unrelated folders are refused before resource cleanup, including silent /D use. Moving an existing installation requires uninstalling the old program first; data is preserved. The new uninstaller only removes active shortcuts/registration when it still owns that registration. Diagnostics/export scripts also resolve the registered location.

The pinned NSIS compiler is exercised with a fixture payload. The optional Wine execution fixture covers configuration import, registered custom-directory reuse and refusal to delete unrelated resources; it is skipped when the Windows loader is unavailable. Compiler success and archive extraction do not establish actual Windows installation/ACL behavior.

Build, typecheck, focused regression results, actual installer extraction/hash/ASCII audits, source comparison and public download hashes are recorded separately in downloads metadata. Full Windows GUI, real company model/embedding endpoints, knowledge migration and DNS/TCP isolation acceptance remain deployment checks. Existing model queue behavior is preserved; no default model-response deadline is added.
