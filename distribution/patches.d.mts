export function digest(bytes: Uint8Array | string): string;
export interface PatchManifest { schemaVersion: number; upstreamCommit: string; files: Record<string, string> }
export function planPatches(root: string, project: string): Promise<{ lock: { commit: string; files: Record<string, string> }; changes: Map<string, Buffer> }>;
export function applyPatches(root: string, project: string): Promise<PatchManifest>;
