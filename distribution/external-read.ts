import { lstat, open, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';

export class ExternalRead {
  constructor(private approve: (message: string, detail: string, signal?: AbortSignal) => Promise<boolean>, private protectedRoots: string[]) {}
  private async target(input: string, signal?: AbortSignal) {
    signal?.throwIfAborted();
    if (!path.isAbsolute(input) || /[\x00-\x1f]/.test(input) || /^(?:\\\\|\/\/)/.test(input) || (process.platform === 'win32' && /:/.test(input.slice(2)))) throw new Error('로컬 파일의 절대 경로를 지정하세요. 네트워크 경로·장치·대체 데이터 스트림은 지원하지 않습니다.');
    const target = await realpath(input);
    for (const root of this.protectedRoots) {
      const relative = path.relative(await realpath(root).catch(() => path.resolve(root)), target);
      if (!relative || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative))) throw new Error('Ned의 키·실행 자격증명이 있는 앱 관리 경로는 외부 읽기에 노출하지 않습니다.');
    }
    signal?.throwIfAborted(); return target;
  }
  async read(input: string, signal?: AbortSignal) {
    const target = await this.target(input, signal), info = await lstat(target);
    if (!info.isFile() || info.size > 2 * 1024 * 1024) throw new Error('2 MiB 이하의 일반 UTF-8 텍스트 파일만 읽을 수 있습니다.');
    if (!await this.approve('프로젝트 외부 파일 읽기 승인', `${target}\n선택한 프로젝트 외부의 로컬 텍스트 파일을 읽기 전용으로 조회합니다. 외부 파일 생성·수정·삭제는 차단됩니다.`, signal))
      throw new Error('프로젝트 외부 파일 읽기가 승인되지 않았습니다.');
    if (await this.target(input, signal) !== target) throw new Error('승인 후 대상 경로가 변경되었습니다.');
    const file = await open(target, 'r');
    try {
      const stat = await file.stat(); if (!stat.isFile() || stat.size > 2 * 1024 * 1024) throw new Error('파일 종류 또는 크기가 변경되었습니다.');
      const bytes = Buffer.alloc(2 * 1024 * 1024 + 1); let bytesRead = 0;
      while (bytesRead < bytes.length) {
        signal?.throwIfAborted(); const next = await file.read(bytes, bytesRead, bytes.length - bytesRead, bytesRead);
        if (!next.bytesRead) break; bytesRead += next.bytesRead;
      }
      if (bytesRead > 2 * 1024 * 1024 || bytes.subarray(0, bytesRead).includes(0)) throw new Error('일반 UTF-8 텍스트 파일만 읽을 수 있습니다.');
      const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes.subarray(0, bytesRead));
      signal?.throwIfAborted(); return JSON.stringify({ path: input, resolvedPath: target, readOnly: true, text });
    } finally { await file.close(); }
  }
  async list(input: string, signal?: AbortSignal) {
    const target = await this.target(input, signal);
    if (!(await lstat(target)).isDirectory()) throw new Error('폴더의 절대 경로를 지정하세요.');
    if (!await this.approve('프로젝트 외부 폴더 목록 조회 승인', `${target}\n선택한 프로젝트 외부의 로컬 폴더 목록을 읽기 전용으로 조회합니다. 외부 파일 생성·수정·삭제는 차단됩니다.`, signal))
      throw new Error('프로젝트 외부 폴더 조회가 승인되지 않았습니다.');
    if (await this.target(input, signal) !== target) throw new Error('승인 후 대상 경로가 변경되었습니다.');
    const entries = await readdir(target, { withFileTypes: true });
    signal?.throwIfAborted();
    return JSON.stringify({ path: input, resolvedPath: target, readOnly: true, truncated: entries.length > 1000,
      entries: entries.slice(0, 1000).map(e => ({ name: e.name, kind: e.isSymbolicLink() ? 'link' : e.isDirectory() ? 'directory' : e.isFile() ? 'file' : 'other' })) });
  }
}
