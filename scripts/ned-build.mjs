import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const upstream = path.join(root, '.cache/l-vibe-desktop/source');
const output = path.join(root, '.cache/ned/app');
await mkdir(output, { recursive: true });
const version = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).version;
const lock = JSON.parse(await readFile(path.join(root, 'upstream-lock.json'), 'utf8'));
const common = { bundle: true, platform: 'node', format: 'cjs', target: 'node22', logLevel: 'info', legalComments: 'eof' };
await build({
  ...common, entryPoints: [path.join(root, 'distribution/ned/agent.ts')], outfile: path.join(output, 'agent.cjs'),
  nodePaths: [path.join(upstream, 'packages/cli/node_modules'), path.join(upstream, 'node_modules')],
  alias: { '@ned/acp': path.join(upstream, 'packages/cli/src/acp/agent.ts') },
  define: { NED_VERSION: JSON.stringify(version), OPENCODE_VERSION: JSON.stringify(lock.tag.replace(/^v/, '')), OPENCODE_CHANNEL: '"prod"', OPENCODE_ARTIFACT: '"ned-agent"', OPENCODE_RELEASE_HIGHLIGHTS: '"[]"' },
  plugins: [{
    name: 'node-acp-read-file',
    setup(api) {
      api.onLoad({ filter: /acp[/\\]permission\.ts$/ }, async args => {
        const text = await readFile(args.path, 'utf8');
        const matches = text.match(/Bun\.file\(path\)\.text\(\)/g) ?? [];
        if (matches.length !== 3) throw new Error('Pinned ACP file-read boundary changed');
        return { contents: 'import { readFile as nedReadFile } from "node:fs/promises";\n' + text.replaceAll('Bun.file(path).text()', 'nedReadFile(path, "utf8")'), loader: 'ts' };
      });
    },
  }],
});
if (process.argv[2] !== 'agent') {
  await build({ ...common, entryPoints: [path.join(root, 'distribution/ned/main.ts')], outfile: path.join(output, 'main.cjs'), external: ['electron'], define: { NED_VERSION: JSON.stringify(version) } });
  await writeFile(path.join(output, 'package.json'), JSON.stringify({ name: 'ned', productName: 'Ned', version, main: 'main.cjs', private: true }, null, 2));
}
