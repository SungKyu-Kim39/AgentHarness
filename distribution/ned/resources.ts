import path from 'node:path';
import { existsSync } from 'node:fs';
/** New bundles use ned/. Legacy app-owned resources remain readable during upgrades. */
export function managedResource(root: string, ...parts: string[]) {
  const current = path.join(root, 'ned', ...parts);
  return existsSync(current) ? current : path.join(root, 'l-vibe', ...parts);
}
