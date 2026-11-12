# Ned 0.3.1 startup fix 1

The deployment PC reported an early editor panic at `crates/paths/src/paths.rs:204:18`. In the original launcher layout, Windows Known Folder lookup for LocalAppData/RoamingAppData returned `0x80070003` (path not found). Both calls succeeded and pointed into the private home when `USERPROFILE/AppData/Local` and `USERPROFILE/AppData/Roaming` existed. The Windows source at that line calls `dirs::cache_dir().expect("failed to determine LocalAppData directory")` during `init_paths`, before logging is initialized.

The managed profile now creates the standard AppData tree (including LocalLow) and aligns APPDATA/LOCALAPPDATA with it. Core Zed config, DB and log paths remain under `--user-data-dir`; original settings/history/knowledge are preserved. The standard profile's `--system-specs` invocation also exited with native `0xc0000005`; this is separate from the confirmed missing-directory panic. Normal GUI success must be checked after this patch. Do not claim all crashes are fixed from the folder-API result alone.

## Blank startup

The original 0.3.1 installer forced a project picker before launching Zed; cancellation exited the app. This patch removes that picker and sets the pinned editor's `restore_on_startup: launchpad`. A recent-project/open-folder start screen can open without selecting a project. No project positional argument is passed, and the process working directory is app-owned. AI project access still goes through the existing native scope approval; app-managed directories cannot become an AI project by default.

## Applying the small patch

Use `Ned-startup-fix-1.tgz` only on the exact original Ned 0.3.1 installer. Quit Ned and all Zed instances, unpack in a new writable folder and run `APPLY_FIX.cmd`. Status must be `applied` or `already-applied`, with EXIT_CODE=0. Start the installed Ned shortcut. `ROLLBACK_FIX.cmd` restores only the verified backup for this patch.

The patch verifies the original Ned.exe and app.asar hashes, preserves the entire original dependency/license archive, and replaces app.asar atomically. The original executable's archive-validation fuse is disabled; this was verified without changing any fuse or executable. Unknown versions and conflicting backups are refused. The installation's Control Panel version remains 0.3.1 for this patch. No vault, model endpoint, key, knowledge storage or project file is changed.

If startup still fails, `editor-startup-status.json` now has `diagnosticRevision: 2`, native failure category and pinned Rust source locations. Raw panic payloads, environment values and arbitrary paths are not saved. The included updated CHECK_EDITOR can test normal GUI initialization even if `--system-specs` fails; it uses temporary offline profiles and starts no model services.

## Verification

Focused checks cover the standard private AppData tree, blank argv and launchpad setting, project approval before binding, source-location privacy, source allowlist integrity, patch idempotence, refusal of tampered payload/unknown hosts, backup preservation and rollback. The original missing-directory problem was reproduced by the user's Windows probe. GUI success and any remaining native access violation still require that PC's next result. A full refreshed installer follows confirmed startup behavior.
