# Ned 0.3.7 validation and review

Status: the first complete installer passed Windows import checks but LZMA regressed installation time. The final zlib installer is being rebuilt and remeasured before publication. This file does not establish employee Windows 10/11 GUI or intranet-model acceptance.

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
- Runtime-pin review: MCP and desktop consumers accept only the compiled-in original manifest or its corresponding reviewed optimized manifest. The production MCP integrity path verifies the complete optimized staging payload without a fixture bypass; modified or unrelated manifest hashes remain rejected.
- Integrity review: malformed manifests and directory escapes fail closed; declared text files are checked before exposing the bundle to the engine and again when read. A corrupt catalog is no longer silently ignored. Long documents have explicit offset continuation rather than silent truncation.
- Context review: local suggestions are only candidates; the answering model uses actual intent/context and may choose other guidance. Preloading is byte-bounded against configured context/output limits and omitted when headroom is insufficient. Engine-side semantic selection is included in normal context accounting. Compaction/checkpoint prompts and tool_choice=none requests are not rewritten with task skills. Original user text, tool definitions and reasoning options are preserved.
- Installer review: reject installation at or below Ned/L-Vibe private-data roots, and refuse recursive removal if an old installation overlaps those roots. Missing dedicated installation directories are still created automatically. The pinned NSIS compilation fixture passed; Windows CI also checks that a private-data installation is refused before normal installation.
- Existing test-harness issue: the editor-owner fixture lacked the current permission-change subscription stub and left its server open on failure. The fixture is corrected; no product permission was relaxed. The NSIS fixture must use a writable ELECTRON_BUILDER_CACHE in this Cloud workspace.
- Preserved boundaries: encrypted settings and private data, editor preferences/buffers, ask/edits/full permissions, project scopes, child-process ownership/cancellation, fixed endpoint/model IDs and deadline-free model waits remain under their existing policies. No private configuration or user conversation is added to release content.

## Verification record

Environment: Linux Cloud executor; Node 24.22.1; fixed OpenCode v2.2.6 Linux baseline archive SHA-256 08bb21d6326ce740d91cce7ebe88a6536933f6e1e30353b91a06b01f25da306c, binary SHA-256 50503d24577fa4117a7c95ee85b2cd679606a87eacf20ca54ed5db5c9e1cf895. Model endpoints are synthetic loopback OpenAI-compatible fixtures; no company model or embedding credentials are used.

- npm run typecheck: passed.
- ELECTRON_BUILDER_CACHE=$PWD/.cache/ned/builder-cache npm test: 147 tests, 132 passed, 15 skipped, zero failures (309.8 seconds). Skips cover unavailable legacy 1.19.5 paths, Linux OpenViking/native runtime fixtures and optional Wine/Windows execution; they are not reported as acceptance success.
- Targeted latest transport/routing/skill/native-runtime suite: 21 passed, zero skips (104.7 seconds). It includes real v2 engine skill discovery, model wire IDs/thinking variants and guarded file edits. Follow-up checks cover the final byte-budget and tool-free/compaction exclusions.
- node --test tests/runtime-optimization.test.mjs: source-backed cache removal, ZIP-member identity, actual isolated Python ZIP import and preservation of asset/native/path-sensitive packages passed.
- Post-review runtime pin/boundary checks: 11 passed, zero failures, one unavailable native desktop fixture skipped (20.8 seconds); includes full production MCP file verification. Typecheck passed again.
- NSIS fixture compiles with the cached pinned toolchain; optional Windows/Wine execution remains skipped locally.
- The real v2 queue fixture waited beyond the former 180-second response deadline and then verified explicit cancellation (187.7 seconds); no default model-response timeout is added.
- Rejected LZMA experiment producer: 3a0d450b200c2555f0aa1ad3bfea3d79db7bc6e0. Installer: 811,344,026 bytes / SHA-256 4a740aac58b78ce002dc9d2d52d9dc9373b5ffcd6dc1b2eb6e915d6edf38428c (31.06% below the 0.3.6-rebuild1 installer).
- Complete installer extraction audit: all 55,925 staged application files match byte-for-byte. Four generated installer/plugin files are accounted for separately. All 55,929 archive files/7,934 directories use ASCII paths; the installed catalog has 66 skills/569 verified documents. Archive file count decreases 40.65%.
- The fully bundled host initializes through the smoke boundary with only Electron/Node imports. Every component manifest, the runtime transformation report, editor icon and complete payload manifest are verified from the EXE.
- Windows experiment (run 43540857847, Server 2022/10.0.20348): missing directory creation, private-data path refusal, OpenViking import, all seven tokenizer encodings and bundled Node passed. However, LZMA installation took 90,792 ms versus the baseline 54,182 ms, so this candidate is not selected for the release. The raw summary is Ned-0.3.7-lzma-benchmark.json.
- Use zlib with the lossless SDK packing/host shrink to prioritize both installation time and a smaller payload. Final installer metrics, Windows remeasurement, handover TGZ and complete public download hashes are pending.

Keep releaseReady false until the existing real Win10/Win11 GUI/intranet/offline-network acceptance criteria are met. Windows Server CI, when completed, is reported separately from those criteria.
