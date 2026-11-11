import { readFile, writeFile, mkdir, cp, rm, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { verifyAsciiTree, verifyAsciiTar } from './package-paths.mjs';
const project = path.resolve(import.meta.dirname, '..');
const runtime = path.join(project, 'vendor/runtime/windows-x64/openviking');
const output = path.join(project, 'release/desktop');
const name = 'L-Vibe-openviking-tokenizer-fix-1';
const root = path.join(output, name);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
execFileSync('git', ['diff', '--quiet'], { cwd: project });
execFileSync('git', ['diff', '--cached', '--quiet'], { cwd: project });
const manifestBytes = await readFile(path.join(runtime, 'manifest.json'));
const manifest = JSON.parse(manifestBytes);
const lock = JSON.parse(await readFile(path.join(project, 'python-runtime-lock.json')));
if (hash(manifestBytes) !== lock.manifestSha256) throw new Error('Runtime differs from the committed lock');
const catalog = JSON.parse(await readFile(path.join(runtime, 'tokenizers/assets.json')));
const managed = ['launch.py', 'tokenizers/assets.json', ...catalog.licenses.map(p => 'tokenizers/' + p),
  ...catalog.assets.map(p => 'tokenizers/' + p.path), ...catalog.canonicalVendorFiles];
const unique = [...new Set(managed)];
await rm(root, { recursive: true, force: true }); await mkdir(path.join(root, 'files'), { recursive: true });
const files = [];
for (const [index, relative] of unique.entries()) {
  const entry = manifest.files.find(f => f.path === relative);
  const bytes = await readFile(path.join(runtime, relative));
  if (!entry || hash(bytes) !== entry.sha256) throw new Error('Unverified repair input: ' + relative);
  const payload = 'files/' + String(index).padStart(3, '0') + '.bin';
  await writeFile(path.join(root, payload), bytes);
  files.push({ path: relative, sha256: entry.sha256, payload, repairMissingCache: catalog.canonicalVendorFiles.includes(relative) });
}
const descriptor = { schemaVersion: 1, name, sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: project, encoding: 'utf8' }).trim(),
  baseManifests: ['8d2fbf5aef25d431433feb5f34f09cbf908c025476cb7ac024f6e3674b473a3d', '42f101caef4f976cc20bc3df5f1b3a25356f1a75d3f0297b79af77379733c901'],
  newManifestSha256: hash(manifestBytes), encodings: catalog.encodings, assets: catalog.assets.length, files,
  preservesUserConfiguration: true, pathEncoding: 'ascii', downloadsDependencies: false };
const descriptorBytes = Buffer.from(JSON.stringify(descriptor, null, 2) + '\n');
await writeFile(path.join(root, 'PATCH-MANIFEST.json'), descriptorBytes);
await writeFile(path.join(root, 'new-manifest.json'), manifestBytes);
const installer = (await readFile(path.join(project, 'distribution/openviking-tokenizer-fix.py'), 'utf8')).replaceAll('@DESCRIPTOR_SHA@', hash(descriptorBytes));
await writeFile(path.join(root, 'apply-fix.py'), installer);
await cp(path.join(project, 'distribution/openviking-import-check.py'), path.join(root, 'check-import.py'));
for (const [command, script, label] of [['APPLY_FIX.cmd', 'apply-fix.py', 'FIX'], ['CHECK_IMPORT.cmd', 'check-import.py', 'CHECK']])
  await writeFile(path.join(root, command), '@echo off\r\n"%LOCALAPPDATA%\\Programs\\L-Vibe\\resources\\runtime\\windows-x64\\openviking\\python\\python.exe" -I -B "%~dp0' + script + '"\r\nset "L_VIBE_' + label + '_RESULT=%ERRORLEVEL%"\r\necho EXIT_CODE=%L_VIBE_' + label + '_RESULT%\r\npause\r\nexit /b %L_VIBE_' + label + '_RESULT%\r\n');
await cp(path.join(project, 'LICENSE'), path.join(root, 'LICENSE'));
await writeFile(path.join(root, 'README.txt'), 'L-Vibe OpenViking cumulative offline tokenizer repair\n\n1. L-Vibe를 완전히 종료합니다.\n2. 이 TGZ를 별도 폴더에 압축 해제하고 APPLY_FIX.cmd를 실행합니다.\n3. applied 또는 already-applied이면 CHECK_IMPORT.cmd를 실행합니다.\n4. TOKENIZERS_OK 7, OPENVIKING_IMPORT_OK, EXIT_CODE=0을 확인하고 앱을 다시 실행합니다.\n\n0.2.2/0.2.3/0.2.4의 지원 manifest에 적용하는 누적 패치입니다. 이전 loopback 수정도 포함합니다.\n공식 SHA-256과 일치하는 데이터 6종으로 인코더 7종을 지원합니다. LiteLLM의 잘못된 CRLF 캐시와 삭제된 캐시도 복구합니다.\n추가 설치·다운로드·외부 접속이 필요하지 않습니다. 실행 중 누락/손상 데이터의 온라인 다운로드는 차단합니다.\n설정·키·대화·프로젝트·지식 데이터는 읽거나 수정하지 않습니다. 원래 런타임 파일의 복구 사본은 %APPDATA%\\L-Vibe\\openviking\\patch-backups에 남깁니다.\n모듈 검사 성공은 실제 사내 모델 인증이나 전체 서비스 시작 성공을 대신하지 않습니다.\n');
await verifyAsciiTree(root);
const archive = path.join(output, name + '.tgz');
execFileSync('tar', ['-I', 'gzip -1', '-cf', archive, '-C', output, name]);
const paths = verifyAsciiTar(archive);
const sha256 = hash(await readFile(archive));
await writeFile(archive + '.sha256', sha256 + '  ' + path.basename(archive) + '\n');
console.log(JSON.stringify({ archive, bytes: (await stat(archive)).size, sha256, paths, newManifestSha256: descriptor.newManifestSha256, managedFiles: files.length, sourceCommit: descriptor.sourceCommit }, null, 2));
