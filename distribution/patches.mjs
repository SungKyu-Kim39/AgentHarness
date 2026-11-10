import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
export const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const once = (text, before, after) => {
  if (text.split(before).length !== 2) throw new Error(`Upstream patch anchor changed: ${before.slice(0, 90)}`);
  return text.replace(before, after);
};
export async function planPatches(root, project) {
  const lock = JSON.parse(await readFile(path.join(project, 'upstream-lock.json'), 'utf8'));
  const originals = new Map();
  // Validate the whole boundary before writing. Mixed upstream revisions must
  // not receive only the patches whose old anchors happened to remain.
  for (const [file, expected] of Object.entries(lock.files)) {
    const bytes = await readFile(path.join(root, file));
    if (digest(bytes) !== expected) throw new Error(`Upstream source hash mismatch: ${file}`);
    originals.set(file, bytes.toString());
  }
  const changes = new Map();
  const edit = (file, transform) => changes.set(file, Buffer.from(transform(originals.get(file))));
  edit('packages/desktop/src/main/constants.ts', text => text.replaceAll('OpenCode Dev', 'L-Vibe Dev').replaceAll('OpenCode Beta', 'L-Vibe Beta').replaceAll('"OpenCode"', '"L-Vibe"').replaceAll('ai.opencode.desktop', 'com.lig.l-vibe'));
  edit('packages/desktop/src/main/lifecycle/configure.ts', text => {
    text = once(text, 'import { homedir, tmpdir } from "node:os"', 'import { tmpdir } from "node:os"');
    text = once(text, 'import { APP_ID, APP_NAME, CHANNEL } from "../constants"', 'import { APP_ID, APP_NAME, CHANNEL } from "../constants"\nimport { configureLVibeEnvironment } from "./l-vibe"');
    text = once(text, '  try {\n    process.chdir(homedir())\n  } catch {}', '  const root = path.join(app.getPath("appData"), APP_NAME)\n  configureLVibeEnvironment(root)\n  process.chdir(root)');
    text = once(text, 'path.join(app.getPath("appData"), APP_ID)', 'root');
    return once(text, '  app.setName(APP_NAME)', '  app.setName(APP_NAME)\n  app.commandLine.appendSwitch("disable-background-networking")\n  app.commandLine.appendSwitch("disable-component-update")\n  app.commandLine.appendSwitch("disable-sync")\n  app.commandLine.appendSwitch("disable-domain-reliability")');
  });
  edit('packages/desktop/src/main/lifecycle/environment.ts', text => {
    text = once(text, 'import { getUserShell, loadShellEnv } from "../service/shell-env"\n', '');
    const start = text.indexOf('export const preferApplicationEnvironment =');
    const end = text.indexOf('\nexport const prepareDesktop =', start);
    if (start < 0 || end < 0) throw new Error('Desktop environment entry changed');
    text = text.slice(0, start) + 'export const preferApplicationEnvironment = Effect.sync(() => {\n  process.env.OPENCODE_CLIENT = "desktop"\n})\n' + text.slice(end);
    return once(text, 'app.setAsDefaultProtocolClient("opencode")', 'app.setAsDefaultProtocolClient("l-vibe")');
  });
  changes.set('packages/desktop/src/main/service/sidecar-probe.ts', Buffer.from('import type { Endpoint } from "@opencode/client/service"\n\n// L-Vibe does not discover another OpenCode installation.\nexport function startSidecarProbe() {}\n\nexport function takeSidecarProbe(): Promise<Endpoint | undefined> {\n  return Promise.resolve(undefined)\n}\n'));
  changes.set('packages/desktop/src/renderer/startup/sentry.ts', Buffer.from('import pkg from "../../../package.json"\n\nexport function desktopVersion() {\n  return import.meta.env.OPENCODE_VERSION ?? pkg.version\n}\n\n// No diagnostic upload, even when a build machine has a Sentry DSN.\nexport async function initializeSentry(_version: string) {}\n'));
  edit('packages/gui-plugins/src/updater/main.ts', text => once(text, '  const enabled = build.packaged', '  // L-Vibe updates are distributed offline by the administrator.\n  const enabled = false'));
  edit('packages/desktop/src/renderer/index.html', text => once(text, '<title data-sm>OpenCode</title>', '<title data-sm>L-Vibe</title>'));
  edit('packages/desktop/electron-builder.config.ts', text => {
    text = once(text, 'export function getConfig() {', 'function getUpstreamConfig() {');
    return once(text, 'export default getConfig()', `export function getConfig() {
  const upstream = getUpstreamConfig()
  return {
    ...upstream,
    appId: "com.lig.l-vibe",
    productName: "L-Vibe",
    artifactName: "L-Vibe-\${version}-\${os}-\${arch}.\${ext}",
    extraMetadata: { ...upstream.extraMetadata, name: "l-vibe" },
    publish: null,
    protocols: { name: "L-Vibe", schemes: ["l-vibe"] },
    nsis: {
      ...upstream.nsis,
      perMachine: false,
      allowElevation: false,
      packElevateHelper: false,
      deleteAppDataOnUninstall: false,
    },
  } satisfies Configuration
}

export default getConfig()`);
  });
  edit('packages/desktop/script/pack.ts', text => {
    const start = text.indexOf('async function writeUpdateConfig(resources: string) {');
    if (start < 0) throw new Error('Update metadata writer changed');
    return once(text.slice(0, start), 'import { getConfig } from "../electron-builder.config"\n', '') + '// L-Vibe ships no updater feed or app-update.yml.\nasync function writeUpdateConfig(_resources: string) {}\n';
  });
  changes.set('packages/desktop/script/copy-icons.ts', Buffer.from(`import { cp, mkdir, readdir, rm } from "node:fs/promises"
const destination = "resources/icons"
await rm(destination, { recursive: true, force: true })
await mkdir(destination, { recursive: true })
const channel = process.argv[2] ?? "prod"
await cp("icons/" + channel, destination, { recursive: true })
for (const name of await readdir(destination)) {
  if (name.endsWith(".png")) await cp("resources/l-vibe/icon.png", destination + "/" + name)
}
await cp("resources/l-vibe/icon.ico", destination + "/icon.ico")
`));
  for (const [source, target] of [
    ['distribution/l-vibe-environment.ts', 'packages/desktop/src/main/lifecycle/l-vibe.ts'],
    ['distribution/windows-installer.nsh', 'packages/desktop/resources/windows/installer.nsh'],
    ['assets/lig-icon.png', 'packages/desktop/resources/l-vibe/icon.png'],
    ['assets/lig-icon.ico', 'packages/desktop/resources/l-vibe/icon.ico'],
    ['assets/lig-icon.png', 'packages/app/public/favicon-96x96-v3.png'],
    ['assets/lig-icon.ico', 'packages/app/public/favicon-v3.ico'],
  ]) changes.set(target, await readFile(path.join(project, source)));
  return { lock, changes };
}
export async function applyPatches(root, project) {
  const { lock, changes } = await planPatches(root, project);
  for (const [file, bytes] of changes) {
    await mkdir(path.dirname(path.join(root, file)), { recursive: true });
    await writeFile(path.join(root, file), bytes);
  }
  const manifest = { schemaVersion: 1, upstreamCommit: lock.commit, files: Object.fromEntries([...changes].map(([file, bytes]) => [file, digest(bytes)])) };
  await writeFile(path.join(root, '.l-vibe-patches.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}
