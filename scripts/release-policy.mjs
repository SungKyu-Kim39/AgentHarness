// Centralized release version policy for Ned 0.3.x builds, audits, and publishing.
export function parsePatch03(version) {
  const match = /^0\.3\.(\d+)$/.exec(String(version ?? ''));
  return match ? Number(match[1]) : undefined;
}

export function isValidRevision(revision) {
  return /^rebuild[1-9][0-9]*$/.test(String(revision ?? ''));
}

export function isReleaseVersion(version) {
  const patch = parsePatch03(version);
  return patch !== undefined && patch >= 7;
}

export function isGhidraVersion(version) {
  const patch = parsePatch03(version);
  return patch !== undefined && patch >= 8;
}

export function isModernVersion(version) {
  const patch = parsePatch03(version);
  return patch !== undefined && patch >= 9;
}

export function isNoSeedVersion(version) {
  const patch = parsePatch03(version);
  return patch !== undefined && patch >= 10;
}

export function isActionsTransportVersion(version) {
  const patch = parsePatch03(version);
  return patch !== undefined && patch >= 11;
}

export function isUserDataPreservedVersion(version) {
  const patch = parsePatch03(version);
  return patch !== undefined && patch >= 12;
}

export function isRebuiltEditorReusable(version, revision) {
  return isUserDataPreservedVersion(version) && isValidRevision(revision);
}

export function previousReleaseVersion(version, revision = '') {
  const artifact = version + (revision ? '-' + revision : '');
  if (artifact === '0.3.12-rebuild2') return '0.3.12-rebuild1';
  if (artifact === '0.3.12-rebuild1') return '0.3.12';
  if (version === '0.3.13') return revision ? '0.3.13' : '0.3.12-rebuild2';
  const patch = parsePatch03(version);
  if (patch === undefined || patch < 10) return '0.3.9';
  if (revision && isValidRevision(revision)) {
    const revNum = Number(revision.slice(7));
    return revNum > 1 ? `${version}-rebuild${revNum - 1}` : version;
  }
  return `0.3.${patch - 1}`;
}
