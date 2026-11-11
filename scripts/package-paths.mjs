import { readdir, readlink } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

// Check product-relative names, not the user's OS profile/project root.
// Korean document contents and UI strings remain valid UTF-8.
export function assertAsciiPath(value) {
  if (typeof value !== 'string' || !value || !/^[\x20-\x7e]+$/.test(value))
    throw new Error('Package filenames and paths must use printable ASCII: ' + JSON.stringify(value));
}

export async function verifyAsciiTree(root) {
  let files = 0, directories = 0;
  async function visit(relative = '') {
    for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
      const name = relative ? relative + '/' + entry.name : entry.name;
      assertAsciiPath(name);
      if (entry.isDirectory()) { directories++; await visit(name); }
      else if (entry.isFile()) files++;
      else if (entry.isSymbolicLink()) { assertAsciiPath(await readlink(path.join(root, name))); files++; }
      else throw new Error('Unsupported package entry: ' + name);
    }
  }
  await visit();
  return { encoding: 'ascii', files, directories };
}

export function verifyAsciiGitTree(root, commit) {
  const names = execFileSync('git', ['ls-tree', '-r', '-z', '--name-only', commit], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).split('\0').filter(Boolean);
  for (const name of names) assertAsciiPath(name);
  return { encoding: 'ascii', files: names.length };
}

export function verifyAsciiTar(archive) {
  // Read tar headers directly: listing tools may escape non-ASCII names and
  // hide the offending bytes. Also check link targets without extracting them.
  const script = `import json, sys, tarfile
files = 0
entries = 0
with tarfile.open(sys.argv[1], 'r:*') as source:
    for member in source:
        for value in [member.name] + ([member.linkname] if member.issym() or member.islnk() else []):
            if not value or any(ord(c) < 32 or ord(c) > 126 for c in value):
                raise ValueError('Non-ASCII package archive path: ' + ascii(value))
        entries += 1
        files += int(member.isfile())
print(json.dumps({'encoding': 'ascii', 'entries': entries, 'files': files}))
`;
  return JSON.parse(execFileSync('python3', ['-c', script, archive], { encoding: 'utf8', maxBuffer: 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }));
}
