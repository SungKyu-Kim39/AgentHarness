import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { build } from 'esbuild';

const compiled = await build({
  entryPoints: ['distribution/ned/topmost-dialog.ts'],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
  target: 'node22',
  external: ['electron'],
});
const require = createRequire(import.meta.url);

function fixture() {
  const created = [];
  class FakeBrowserWindow {
    destroyed = false;
    calls = [];
    constructor(options) {
      this.options = options;
      created.push(this);
    }
    setAlwaysOnTop(flag, level) { this.calls.push(['setAlwaysOnTop', flag, level]); }
    show() { this.calls.push(['show']); }
    moveTop() { this.calls.push(['moveTop']); }
    focus() { this.calls.push(['focus']); }
    isDestroyed() { return this.destroyed; }
    destroy() { this.destroyed = true; this.calls.push(['destroy']); }
  }
  const electron = {
    BrowserWindow: FakeBrowserWindow,
    screen: {
      getCursorScreenPoint: () => ({ x: 2100, y: 400 }),
      getDisplayNearestPoint: () => ({ workArea: { x: 1920, y: 0, width: 1920, height: 1040 } }),
    },
  };
  const mod = { exports: {} };
  vm.runInNewContext(compiled.outputFiles[0].text, {
    module: mod,
    exports: mod.exports,
    require: name => (name === 'electron' ? electron : require(name)),
  });
  return { withTopmostDialogOwner: mod.exports.withTopmostDialogOwner, created };
}

test('withTopmostDialogOwner creates an invisible screen-saver topmost owner centered on the active display and destroys it', async () => {
  const f = fixture();
  const result = await f.withTopmostDialogOwner(async owner => {
    assert.equal(owner.destroyed, false);
    assert.equal(owner.options.x, 2880);
    assert.equal(owner.options.y, 520);
    assert.equal(owner.options.alwaysOnTop, true);
    assert.equal(owner.options.skipTaskbar, true);
    assert.equal(owner.options.opacity, 0);
    assert.equal(owner.options.hasShadow, false);
    assert.equal(owner.options.webPreferences.sandbox, true);
    assert.equal(owner.options.webPreferences.nodeIntegration, false);
    assert.deepEqual(owner.calls, [
      ['setAlwaysOnTop', true, 'screen-saver'],
      ['show'],
      ['moveTop'],
      ['focus'],
    ]);
    return 'approved';
  });
  assert.equal(result, 'approved');
  assert.equal(f.created.length, 1);
  assert.equal(f.created[0].destroyed, true);
});

test('withTopmostDialogOwner destroys the owner even when the dialog throws', async () => {
  const f = fixture();
  await assert.rejects(f.withTopmostDialogOwner(async () => { throw new Error('dialog aborted'); }), /dialog aborted/);
  assert.equal(f.created.length, 1);
  assert.equal(f.created[0].destroyed, true);
});
