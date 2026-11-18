import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

type PersonalRequest = { method?: 'POST'; body?: unknown; signal?: AbortSignal };
export type PersonalTransport = (user: string, route: string, options?: PersonalRequest) => Promise<any>;

const rootPattern = /^viking:\/\/user\/(?!local-user$)[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
const entrySchema = z.object({
  sha256: z.string().regex(/^[a-f0-9]{64}$/), root: z.string().regex(rootPattern),
  roots: z.array(z.string()).max(64), status: z.enum(['importing', 'ready', 'failed']),
  files: z.number().int().nonnegative(), importedAt: z.string(),
  sourceRoot: z.string().regex(rootPattern).optional(), imported: z.boolean().optional(),
  lastStage: z.string().regex(/^OV_PERSONAL_[A-Z_]+$/).optional(), lastHttpStatus: z.number().int().min(100).max(599).optional(),
}).strict();
const registrySchema = z.object({ schemaVersion: z.literal(1), entries: z.array(entrySchema).max(32) }).strict();
type Entry = z.infer<typeof entrySchema>;

function validRoot(root: string, base: string) {
  if (root === base + '/memories' || root === base + '/resources' || root === base + '/skills') return true;
  if (!root.startsWith(base + '/peers/')) return false;
  const parts = root.slice((base + '/peers/').length).split('/');
  return parts.length === 2 && parts[1] === 'memories' && /^[A-Za-z0-9_.@-]{1,255}$/.test(parts[0]) &&
    !['.', '..'].includes(parts[0]) && (parts[0].match(/@/g)?.length ?? 0) <= 1;
}
function uriAllowed(uri: string, roots: string[]) {
  return !/[%\\\x00-\x1f?#]/.test(uri) && !/(?:^|\/)\.{1,2}(?:\/|$)/.test(uri) &&
    roots.some(root => uri === root || uri.startsWith(root + '/'));
}

// 0.3.9 and earlier imports remain available read-only after upgrade.
export class PersonalKnowledge {
  private abort = new AbortController();
  constructor(private directory: string, private transport: PersonalTransport) {}
  private request(root: string, route: string, options?: PersonalRequest) {
    if (!rootPattern.test(root)) throw new Error('개인 지식 사용자 범위가 올바르지 않습니다.');
    return this.transport(root.slice('viking://user/'.length), route, options);
  }
  private get file() { return path.join(this.directory, 'personal-imports.json'); }
  private async registry() {
    let raw: string;
    try { raw = await readFile(this.file, 'utf8'); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { schemaVersion: 1 as const, entries: [] as Entry[] }; throw error; }
    const registry = registrySchema.parse(JSON.parse(raw));
    if (registry.entries.some(e => e.roots.some(r => !validRoot(r, e.root)))) throw new Error('개인 지식 등록 기록의 범위가 올바르지 않습니다.');
    return registry;
  }
  private async roots() { return (await this.registry()).entries.filter(e => e.status === 'ready').flatMap(e => e.roots); }
  async search(query: string, limit: number) {
    const roots = await this.roots(), hits: any[] = [];
    for (const root of roots) {
      const base = root.split('/').slice(0, 4).join('/');
      const response = await this.request(base, '/api/v1/search/find', { method: 'POST', body: { query, target_uri: root, limit, read_content: false }, signal: this.abort.signal });
      const result = response.result;
      for (const item of [...(result?.memories ?? []), ...(result?.resources ?? []), ...(result?.skills ?? [])])
        if (typeof item.uri === 'string' && uriAllowed(item.uri, [root])) hits.push({ uri: item.uri, abstract: item.abstract, score: item.score });
    }
    const seen = new Set<string>();
    const results = hits.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).filter(h => !seen.has(h.uri) && !!seen.add(h.uri)).slice(0, limit);
    return JSON.stringify({ source: 'OpenViking', scope: 'personal', importedAreas: (await this.registry()).entries.filter(e => e.status === 'ready').length, results });
  }
  async read(uri: string) {
    if (!uriAllowed(uri, await this.roots())) throw new Error('가져오기가 완료된 개인 기억·자료·스킬 범위만 읽을 수 있습니다.');
    const base = uri.split('/').slice(0, 4).join('/');
    return JSON.stringify(await this.request(base, '/api/v1/content/read?uri=' + encodeURIComponent(uri) + '&limit=300', { signal: this.abort.signal }));
  }
  async close() { this.abort.abort(); }
}
