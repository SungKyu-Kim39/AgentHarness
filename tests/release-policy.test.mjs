import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isReleaseVersion,
  isGhidraVersion,
  isModernVersion,
  isNoSeedVersion,
  isActionsTransportVersion,
  isUserDataPreservedVersion,
  isWorkspaceToolsVersion,
  isSupportedReleaseVersion,
  isRebuiltEditorReusable,
  hasUserMcp,
  isStableRelease,
  pinnedEditorRevision,
  previousReleaseVersion,
} from '../scripts/release-policy.mjs';

test('release-policy covers historical 0.3.x versions and generalizes cleanly to 0.4.x', () => {
  assert.equal(isReleaseVersion('0.3.6'), false);
  assert.equal(isReleaseVersion('0.3.7'), true);
  assert.equal(isGhidraVersion('0.3.7'), false);
  assert.equal(isGhidraVersion('0.3.8'), true);
  assert.equal(isModernVersion('0.3.8'), false);
  assert.equal(isModernVersion('0.3.9'), true);
  assert.equal(isNoSeedVersion('0.3.9'), false);
  assert.equal(isNoSeedVersion('0.3.10'), true);
  assert.equal(isActionsTransportVersion('0.3.10'), false);
  assert.equal(isActionsTransportVersion('0.3.11'), true);
  assert.equal(isUserDataPreservedVersion('0.3.11'), false);
  assert.equal(isUserDataPreservedVersion('0.3.12'), true);
  assert.equal(isUserDataPreservedVersion('0.3.15'), true);
  assert.equal(isUserDataPreservedVersion('0.3.20'), true);

  assert.equal(isWorkspaceToolsVersion('0.3.16'), false);
  assert.equal(isWorkspaceToolsVersion('0.4.0'), true);
  assert.equal(isSupportedReleaseVersion('0.3.9'), false);
  assert.equal(isSupportedReleaseVersion('0.3.16'), true);
  assert.equal(isSupportedReleaseVersion('0.4.0'), true);
  assert.equal(isReleaseVersion('0.4.0'), true);
  assert.equal(isGhidraVersion('0.4.0'), true);
  assert.equal(isModernVersion('0.4.0'), true);
  assert.equal(isNoSeedVersion('0.4.0'), true);
  assert.equal(isActionsTransportVersion('0.4.0'), true);
  assert.equal(isUserDataPreservedVersion('0.4.0'), true);
  assert.equal(hasUserMcp('0.4.1'), false);
  assert.equal(hasUserMcp('0.4.2'), true);
  assert.equal(hasUserMcp('0.4.3'), true);
  assert.equal(isStableRelease('0.4.1'), true);
  assert.equal(isStableRelease('0.4.2', 'rebuild3'), false);
  assert.equal(isStableRelease('0.4.3'), true);
  assert.equal(isStableRelease('0.4.3', 'rebuild1'), false);

  assert.equal(isRebuiltEditorReusable('0.3.11', 'rebuild1'), false);
  assert.equal(isRebuiltEditorReusable('0.3.12', 'rebuild2'), true);
  assert.equal(isRebuiltEditorReusable('0.3.15', 'rebuild1'), true);
  assert.equal(isRebuiltEditorReusable('0.3.15', ''), false);
  assert.equal(isRebuiltEditorReusable('0.4.0', 'rebuild1'), true);
  assert.equal(pinnedEditorRevision('0.3.8', 'rebuild1'), 'rebuild1');
  assert.equal(pinnedEditorRevision('0.4.2', 'rebuild2'), '');
  assert.equal(pinnedEditorRevision('0.4.2', 'rebuild3'), 'rebuild3');
  assert.equal(pinnedEditorRevision('0.4.2', 'rebuild4'), 'rebuild3');

  assert.equal(previousReleaseVersion('0.3.12', ''), '0.3.11');
  assert.equal(previousReleaseVersion('0.3.12', 'rebuild1'), '0.3.12');
  assert.equal(previousReleaseVersion('0.3.12', 'rebuild2'), '0.3.12-rebuild1');
  assert.equal(previousReleaseVersion('0.3.13', ''), '0.3.12-rebuild2');
  assert.equal(previousReleaseVersion('0.3.14', ''), '0.3.13');
  assert.equal(previousReleaseVersion('0.3.15', ''), '0.3.14');
  assert.equal(previousReleaseVersion('0.3.15', 'rebuild1'), '0.3.15');
  assert.equal(previousReleaseVersion('0.3.15', 'rebuild2'), '0.3.15-rebuild1');
  assert.equal(previousReleaseVersion('0.4.0', ''), '0.3.16-rebuild1');
  assert.equal(previousReleaseVersion('0.4.0', 'rebuild1'), '0.4.0');
  assert.equal(previousReleaseVersion('0.4.1', ''), '0.4.0-rebuild6');
  assert.equal(previousReleaseVersion('0.4.1', 'rebuild1'), '0.4.1');
  assert.equal(previousReleaseVersion('0.4.3', ''), '0.4.2-rebuild3');
  assert.equal(previousReleaseVersion('0.4.3', 'rebuild1'), '0.4.3');
});
