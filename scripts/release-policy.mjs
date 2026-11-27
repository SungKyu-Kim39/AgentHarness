// Centralized release version policy for Ned 0.3.x and 0.4.x builds, audits, and publishing.
export function parseReleaseSemver(version) {
  const match = /^0\.([34])\.(\d+)$/.exec(String(version ?? ''));
  return match ? { minor: Number(match[1]), patch: Number(match[2]) } : undefined;
}

export function parsePatch03(version) {
  const match = /^0\.3\.(\d+)$/.exec(String(version ?? ''));
  return match ? Number(match[1]) : undefined;
}

export function isValidRevision(revision) {
  return /^rebuild[1-9][0-9]*$/.test(String(revision ?? ''));
}

export function isSupportedReleaseVersion(version) {
  const parsed = parseReleaseSemver(version);
  if (!parsed) return false;
  return parsed.minor >= 4 || (parsed.minor === 3 && parsed.patch >= 10);
}

export function isReleaseVersion(version) {
  const parsed = parseReleaseSemver(version);
  return parsed !== undefined && (parsed.minor >= 4 || parsed.patch >= 7);
}

export function isGhidraVersion(version) {
  const parsed = parseReleaseSemver(version);
  return parsed !== undefined && (parsed.minor >= 4 || parsed.patch >= 8);
}

export function isModernVersion(version) {
  const parsed = parseReleaseSemver(version);
  return parsed !== undefined && (parsed.minor >= 4 || parsed.patch >= 9);
}

export function isNoSeedVersion(version) {
  const parsed = parseReleaseSemver(version);
  return parsed !== undefined && (parsed.minor >= 4 || parsed.patch >= 10);
}

export function isActionsTransportVersion(version) {
  const parsed = parseReleaseSemver(version);
  return parsed !== undefined && (parsed.minor >= 4 || parsed.patch >= 11);
}

export function isUserDataPreservedVersion(version) {
  const parsed = parseReleaseSemver(version);
  return parsed !== undefined && (parsed.minor >= 4 || parsed.patch >= 12);
}

export function isWorkspaceToolsVersion(version) {
  const parsed = parseReleaseSemver(version);
  return parsed !== undefined && parsed.minor >= 4;
}

export function isRebuiltEditorReusable(version, revision) {
  return isUserDataPreservedVersion(version) && isValidRevision(revision);
}

export function pinnedEditorRevision(version, revision = '') {
  if (!isRebuiltEditorReusable(version, revision)) return revision;
  // 0.4.2 rebuild3 is the first editor with the ACP skill completion group.
  return version === '0.4.2' && Number(revision.slice(7)) >= 3 ? 'rebuild3' : '';
}

export function previousReleaseVersion(version, revision = '') {
  const artifact = version + (revision ? '-' + revision : '');
  if (artifact === '0.3.12-rebuild2') return '0.3.12-rebuild1';
  if (artifact === '0.3.12-rebuild1') return '0.3.12';
  if (version === '0.3.13') return revision ? '0.3.13' : '0.3.12-rebuild2';
  if (artifact === '0.4.1') return '0.4.0-rebuild6';
  const parsed = parseReleaseSemver(version);
  if (!parsed) return '0.3.9';
  if (revision && isValidRevision(revision)) {
    const revNum = Number(revision.slice(7));
    return revNum > 1 ? `${version}-rebuild${revNum - 1}` : version;
  }
  if (parsed.minor === 4) {
    return parsed.patch === 0 ? '0.3.16-rebuild1' : `0.4.${parsed.patch - 1}`;
  }
  if (parsed.patch < 10) return '0.3.9';
  return `0.3.${parsed.patch - 1}`;
}
