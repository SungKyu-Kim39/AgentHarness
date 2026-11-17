// Build-PC fixtures use the same host sources with installed Windows runtimes.
import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import {hostAliases} from './ned-host-build.mjs';
const version = JSON.parse(await readFile('package.json', 'utf8')).version;
if (version !== '0.3.8') throw new Error('Review fixture selection for the next release');
const revision=process.env.NED_BUILD_REVISION??'';
if(revision!=='rebuild1')throw Error('Published fixtures are immutable; use the reviewed rebuild1 fixture set');
const artifactVersion=version+'-'+revision;
const entries = {
  namespace: ['tests/openviking-namespace.integration.test.ts'],
  delete: ['tests/delete-file.test.ts'],
  compaction: ['tests/compaction.integration.test.ts'],
  native: ['tests/git-tools.test.ts', 'tests/external-read.test.ts', 'tests/personal-pack-recovery.test.ts', 'tests/ghidra-network.test.ts', 'tests/rea-ghidra.integration.test.ts','tests/zed-native.test.ts','tests/astryx-windows.integration.test.ts','tests/subagents.test.ts','tests/subagents.integration.test.ts','tests/message-delivery.test.ts','tests/subagents-acp.integration.test.ts'],
  python: ['tests/python-windows.integration.test.ts'],
};
for (const [name, files] of Object.entries(entries)) {
  const output = `downloads/Ned-${artifactVersion}-windows-${name}-test.cjs`;
  await build({ stdin: { contents: files.map(file => `import './${file}';`).join('\n'), resolveDir: process.cwd(), sourcefile: `ned-windows-${name}-fixture.ts`, loader: 'ts' }, alias:hostAliases, bundle: true, platform: 'node', format: 'cjs', target: 'node24', outfile: output });
  const sha = createHash('sha256').update(await readFile(output)).digest('hex');
  await writeFile(output + '.sha256', `${sha}  ${output.split('/').at(-1)}\n`);
  console.log(name, sha);
}
