import { build } from 'esbuild';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const upstream = path.join(root, '.cache/l-vibe-desktop/source');
const output = path.join(root, '.cache/ned/app');
await mkdir(output, { recursive: true });
const version = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).version;
const lock = JSON.parse(await readFile(path.join(root, 'upstream-lock.json'), 'utf8'));
const common = { bundle: true, platform: 'node', format: 'cjs', target: 'node22', logLevel: 'info', legalComments: 'eof' };
const acpBuild = await build({
  ...common, metafile: true, entryPoints: [path.join(root, 'distribution/ned/agent.ts')], outfile: path.join(output, 'agent.cjs'),
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
await writeFile(path.join(root, '.cache/ned/acp-inputs.json'), JSON.stringify(acpBuild.metafile.inputs, null, 2));
const sourceLock = JSON.parse(await readFile(path.join(root, 'ned-acp-lock.json'), 'utf8').catch(() => '{"files":{}}'));
if (!Object.keys(sourceLock.files).length && !process.env.NED_BOOTSTRAP_SOURCE_LOCK) throw new Error('Ned ACP source lock is required');
for (const [filename, expected] of Object.entries(sourceLock.files)) {
  const actual = createHash('sha256').update(await readFile(path.join(upstream, filename))).digest('hex');
  if (actual !== expected) throw new Error('Pinned ACP source differs: ' + filename);
}
const packages = new Map();
for (const input of Object.keys(acpBuild.metafile.inputs)) {
  let directory = path.dirname(path.resolve(root, input));
  while (directory !== path.dirname(directory)) {
    const metadata = await readFile(path.join(directory, 'package.json'), 'utf8').then(JSON.parse).catch(() => undefined);
    if (metadata?.name) {
      const key = metadata.name + '@' + metadata.version;
      if (!packages.has(key)) {
        const licenses=[];
        for(const file of await readdir(directory)) if(/^(license|copying|notice)([.-].*)?$/i.test(file)) {
          const body=await readFile(path.join(directory,file),'utf8').catch(()=>undefined);
          if(body) licenses.push(file+'\n'+body);
        }
        if (!licenses.length && metadata.name.startsWith('@opencode/')) licenses.push(await readFile(path.join(upstream,'LICENSE'),'utf8'));
        packages.set(key, '## '+key+'\nLicense: '+String(metadata.license ?? 'See upstream notice')+'\n'+licenses.join('\n\n'));
      }
      break;
    }
    directory=path.dirname(directory);
  }
}
await writeFile(path.join(output,'ACP-THIRD-PARTY-NOTICES.txt'), [...packages.values()].join('\n\n')+'\n');
if (process.argv[2] !== 'agent') {
  await build({ ...common, entryPoints: [path.join(root, 'distribution/ned/main.ts')], outfile: path.join(output, 'main.cjs'), external: ['electron'], define: { NED_VERSION: JSON.stringify(version) } });
  await writeFile(path.join(output, 'package.json'), JSON.stringify({ name: 'ned', productName: 'Ned', version, main: 'main.cjs', private: true, description: 'Managed offline Zed and OpenCode workspace', author: 'SungKyu Kim', license: 'MIT' }, null, 2));
}
