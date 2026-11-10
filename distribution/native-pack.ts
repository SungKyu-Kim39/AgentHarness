import { $ } from 'bun';
import { mkdir, cp, stat } from 'node:fs/promises';
import path from 'node:path';
import { getMakeNsisPath } from 'app-builder-lib/out/toolsets/windows.js';

const directory = path.resolve(import.meta.dir, '..');
process.chdir(directory);
if (process.env.OPENCODE_TARGET !== 'windows-x64') throw new Error('L-Vibe installer target must be Windows x64');
await $`bunx --no-install electron-builder --win --dir --x64 --publish never --config electron-builder.config.ts`;
// NSIS creates the uninstaller normally at install time. This does not run a
// Windows stub under Wine on the Linux build PC or require Wine on employee PCs.
const makensis = await getMakeNsisPath('0.0.0'); // builder-pinned NSIS 3.0.4.1 archive/hash
const version = process.env.OPENCODE_VERSION;
if (!version || !/^\d+\.\d+\.\d+$/.test(version)) throw new Error('L-Vibe package version is required');
const filename = `L-Vibe-${version}-win-x64.exe`;
const installer = path.join(directory, 'dist', filename);
await $`${makensis.path} -V2 ${'-DL_VIBE_VERSION=' + version} ${'-DL_VIBE_APP_DIR=' + path.join(directory, 'dist/win-unpacked')} ${'-DL_VIBE_OUT_FILE=' + installer} ${'-DL_VIBE_ICON=' + path.join(directory, 'resources/icons/icon.ico')} resources/windows/l-vibe-installer.nsi`.env({ ...process.env, ...makensis.env });
if ((await stat(installer)).size < 10 * 1024 * 1024) throw new Error('Installer payload is missing or incomplete');
const output = process.env.L_VIBE_RELEASE_DIR;
if (!output || !path.isAbsolute(output)) throw new Error('L_VIBE_RELEASE_DIR must be absolute');
await mkdir(output, { recursive: true }); await cp(installer, path.join(output, filename));
console.log('Packaged full L-Vibe installer: ' + filename);
