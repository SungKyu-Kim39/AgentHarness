# Ned 0.3.4 validation candidate

0.3.4 incorporates the JSONC startup repair into the full Windows installer. It keeps the 0.3.3 feature set, settings/history/knowledge paths, editor preference retention and branded managed editor. A separate 0.3.3 host patch is unnecessary and must not be applied to 0.3.4. Original published 0.3.3 binaries, archives and patch remain immutable.

## Startup packaging correction

The exact published 0.3.3 main.cjs failed before the launcher opened with `Cannot find module './impl/format'`. esbuild had selected jsonc-parser's UMD entry; its factory aliases require, hiding relative submodules from the bundler. The host build now explicitly selects that dependency's static ESM entry. No user configuration reset or knowledge deletion is involved.

The build gate and actual installer-extraction audit load distributed main.cjs bytes in an isolated VM with only Node builtins and a controlled Electron stub. They require all top-level imports to initialize, then stop at the first app.setName before a profile, editor, service or model can start. A negative test using the original UMD entry fails the same gate. A separate isolated bundle exercises parse/edit/format with comments, trailing commas and UI preference retention without node_modules. This catches the reported defect; it is not a full Windows GUI launch test.

## Included export repair

The offline archive includes the current OpenViking exporter and CHECK_EXPORT.cmd. Export preflight uses an authenticated, bounded, non-recursive minimal fs/ls request rather than the old server's failing stat route. Diagnostic mode uses safe fixed status fields without exporting documents or prompting a model. Export authentication, private scope and vector behavior remain explicit. A healthy OpenViking health response alone does not prove its filesystem/backend is ready. Actual success against the user's old 0.5.0 server remains unconfirmed.

## Verification and limits

The release records its exact source commit, build OS, module smoke result, installer EXE/archive sizes and SHA-256, actual extracted runtime manifests and ASCII paths. The TGZ's nested EXE must match the audited EXE, and selected included source files must match that source commit. Focused checks cover bundled-host initialization, JSONC preference retention, configuration restart, installer policy and extraction guards. Exact results are recorded in the downloadable validation JSON after building.

Before installer compilation, the 0.3.4 host/ACP build and TypeScript check passed, all 36 bundled skill hashes passed, and 20 focused checks passed with no failures (21 discovered; one optional Wine installer-execution fixture skipped because its Windows loader is unavailable). That skipped fixture does not establish a successful Windows install. Actual installer/archive audit results are separate release records.

Earlier 0.3.3 Linux regression results and user-supplied Windows desktop component probes are historical evidence, not new 0.3.4 GUI acceptance. Windows 10/11 actual first launch/upgrade, company-model traffic, external DNS/TCP observation, real desktop actions and full knowledge migration still require deployment acceptance. There is no new default deadline for queued LLM or embedding responses. This release does not claim completion of 1.0 acceptance.
