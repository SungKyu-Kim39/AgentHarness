import optimized from '../../release-runtime-lock.json';

/** Accept only the reviewed baseline or its byte-verified release transformation. */
export function matchesPinnedRuntimeManifest(component: keyof typeof optimized.components, actual: string, baseline: string): boolean {
  const entry = optimized.components[component];
  return actual === baseline || (entry.originalManifestSha256 === baseline && actual === entry.manifestSha256);
}
