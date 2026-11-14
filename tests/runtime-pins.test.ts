import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { matchesPinnedRuntimeManifest } from '../src/main/runtime-pins';
import optimized from '../release-runtime-lock.json';
import { McpExtensions } from '../src/main/mcp-extensions';

test('runtime pins accept only the reviewed baseline and its corresponding optimized manifest', () => {
  for (const component of Object.keys(optimized.components) as Array<keyof typeof optimized.components>) {
    const pin = optimized.components[component];
    assert.equal(matchesPinnedRuntimeManifest(component, pin.originalManifestSha256, pin.originalManifestSha256), true);
    assert.equal(matchesPinnedRuntimeManifest(component, pin.manifestSha256, pin.originalManifestSha256), true);
    assert.equal(matchesPinnedRuntimeManifest(component, '0'.repeat(64), pin.originalManifestSha256), false);
    assert.equal(matchesPinnedRuntimeManifest(component, pin.manifestSha256, '1'.repeat(64)), false);
  }
  // A Windows transformation must not satisfy a different platform's baseline.
  assert.equal(matchesPinnedRuntimeManifest('agent-desktop', optimized.components['agent-desktop'].manifestSha256, 'linux-baseline'), false);
});

const resources = path.resolve('release/ned/win-unpacked/resources');
test('production MCP integrity verifies the complete optimized payload without fixture bypass', {
  skip: !existsSync(path.join(resources, 'ned/locks/release-runtime.json')), timeout: 180000,
}, async () => {
  const tools = new McpExtensions(path.resolve('.cache/ned'), resources, { approve: async () => false });
  await (tools as unknown as { verify(): Promise<void> }).verify();
});
