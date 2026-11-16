// Build-PC fixtures use the same host sources with installed Windows runtimes.
import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const version = JSON.parse(await readFile('package.json', 'utf8')).version;
if (version !== '0.3.8') throw new Error('Review fixture selection for the next release');
const entries = {
  namespace: ['tests/openviking-namespace.integration.test.ts'],
  delete: ['tests/delete-file.test.ts'],
  compaction: ['tests/compaction.integration.test.ts'],
  native: ['tests/git-tools.test.ts', 'tests/external-read.test.ts', 'tests/personal-pack-recovery.test.ts', 'tests/ghidra-network.test.ts', 'tests/rea-ghidra.integration.test.ts'],
  python: ['tests/python-windows.integration.test.ts'],
};
for (const [name, files] of Object.entries(entries)) {
  const output = `downloads/Ned-${version}-windows-${name}-test.cjs`;
  await build({ stdin: { contents: files.map(file => `import './${file}';`).join('\n'), resolveDir: process.cwd(), sourcefile: `ned-windows-${name}-fixture.ts`, loader: 'ts' }, bundle: true, platform: 'node', format: 'cjs', target: 'node24', outfile: output });
  const sha = createHash('sha256').update(await readFile(output)).digest('hex');
  await writeFile(output + '.sha256', `${sha}  ${output.split('/').at(-1)}\n`);
  console.log(name, sha);
}
