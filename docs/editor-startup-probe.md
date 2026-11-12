# Ned editor startup probe

Ned 0.3.1 user evidence: Windows editor exit 101, panic marker, successful loader probe, and no app-owned Zed.log. This proves a Rust panic after binary loading; it does not establish a GPU, missing-DLL or model-server cause.

The small `Ned-editor-probe-1.tgz` is diagnostic only. Quit Ned and all Zed processes, unpack into a writable directory, and run `CHECK_EDITOR.cmd`. It uses the already installed Python and pinned Zed. No installer replacement or settings reset is performed.

Two fresh, app-owned temporary profiles are compared: the current launcher layout and a standard Windows profile with AppData/Local and AppData/Roaming. Windows Known Folder API returns are reported as HRESULT, directory-exists and inside-private-home flags only. Zed is first run with `--system-specs`; if that succeeds an empty diagnostic workspace is briefly started. All diagnostic descendants belong to the existing kill-on-close Job supervisor. Probe deadlines are local initialization checks, not LLM/embedding timeouts.

The output contains only static categories and Rust source locations matched to the pinned source allowlist. Unknown locations are hashed. Raw process output, environment values, user paths, settings, code, project files and keys are excluded. A bounded sanitized report is saved to `%APPDATA%\Ned\diagnostics\editor-probe-status.json`. Temporary profiles are removed after the child exits.

Checks cover panic-payload suppression, source allowlist integrity and private offline settings. The Windows Known Folder behavior and startup outcome require the actual deployment PC. Do not call this diagnostic tool a startup fix until its result identifies the cause.
