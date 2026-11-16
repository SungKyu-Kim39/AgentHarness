import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:net';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
const exec = promisify(execFile);
const resources = process.env.NED_TEST_RESOURCES ?? path.resolve('release/ned/win-unpacked/resources');
const javaHome = process.env.NED_TEST_JAVA ?? path.resolve('.cache/ghidra/linux-java/jdk-21.0.13+9');
const java = path.join(javaHome, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
test('pinned Java guard denies external DNS/socket and removal while allowing actual loopback IPC', { skip: !existsSync(java), timeout: 30000 }, async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'ned-java-guard-')), server = createServer(s => s.end());
  t.after(async () => { server.close(); await rm(root, { recursive: true, force: true }); });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
  const source = path.join(root, 'GuardProbe.java');
  await writeFile(source, `import java.net.*; public class GuardProbe { public static void main(String[] args) throws Exception {
    try (Socket local = new Socket("127.0.0.1", Integer.parseInt(args[0]))) { System.out.println("LOOPBACK_OK"); }
    try { new Socket("example.invalid", 443); throw new AssertionError("network guard missing"); }
    catch (SecurityException expected) { System.out.println(expected.getMessage()); }
    try { System.setSecurityManager(null); throw new AssertionError("guard removable"); }
    catch (SecurityException expected) { System.out.println(expected.getMessage()); }
  }}\n`);
  const guard = path.join(resources, 'runtime/windows-x64/ghidra/network-guard.jar');
  await exec(path.join(javaHome, 'bin', process.platform === 'win32' ? 'javac.exe' : 'javac'), ['-d', root, source], { timeout: 25000 });
  const result = await exec(java, ['-Xbootclasspath/a:' + guard, '-Djava.security.manager=NedOfflineNetworkGuard', '-cp', root, 'GuardProbe', String((server.address() as { port: number }).port)], { timeout: 25000 });
  assert.match(result.stdout, /LOOPBACK_OK/); assert.match(result.stdout, /NED_GHIDRA_EXTERNAL_NETWORK_BLOCKED/); assert.match(result.stdout, /NED_GHIDRA_NETWORK_GUARD_LOCKED/);
});
