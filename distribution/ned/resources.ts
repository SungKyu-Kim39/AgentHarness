import path from 'node:path';
/** Installed Ned resources use one current namespace. User-data migration is separate. */
export function managedResource(root: string, ...parts: string[]) {
  return path.join(root, 'ned', ...parts);
}
