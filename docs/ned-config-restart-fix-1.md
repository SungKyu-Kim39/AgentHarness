# Ned settings and ACP fix 1

[Download cumulative patch (about 4.2MB)](https://github.com/SungKyu-Kim39/AgentHarness/raw/refs/heads/work/downloads/Ned-config-restart-fix-1.tgz)

Apply only to original Ned 0.3.1 or Ned 0.3.1 with startup fix 1. Quit Ned and all Zed instances, extract into a new writable folder, run `APPLY_FIX.cmd` and confirm `applied`/`already-applied`, `EXIT_CODE=0`. Start Ned. No settings, keys, knowledge or project files are replaced. `ROLLBACK_FIX.cmd` restores the exact prior host archive. The installer version remains 0.3.1; the updated host tray menu identifies 0.3.2.

## Configuration import

Use **설정 JSON 가져와 적용 (자동 재시작)**. Valid JSON is encrypted first. Ned asks its editor to close normally, waits for editor/service shutdown and relaunches automatically to load the saved configuration. No manual success dialog/quit/reopen step is required. Complete Zed's normal save prompt if a buffer is dirty. Cancelling save keeps the editor/services live with restart pending; **설정 적용 재시작 대기 취소** cancels the automatic relaunch reservation while preserving the saved config for next launch. Invalid imports do not request close; unconfirmed shutdown does not start another host.

## Failed to Launch / exit code 0

The deployment probe confirmed direct Node startup and direct ACP initialization. PowerShell-mediated launch returned exit 0 instead of maintaining the connection. Zed tracks that shell as its external server. The Windows settings now launch the existing bundled Python console supervisor, which waits for Electron's Node agent and preserves ACP stdio. No external Node or new online dependency is installed. The adapter and model settings themselves initialized successfully in the direct probe; do not delete settings or reset knowledge to repair shell lifetime.

The AppData/blank-launchpad startup fix is also included. Startup was confirmed by the user after the earlier patch. Linux source/build/focused tests and archive comparisons passed. Actual Windows new-thread/chat and automatic save/restart behavior remain to be confirmed after this patch; see [0.3.2 validation](validation-0.3.2.md).
