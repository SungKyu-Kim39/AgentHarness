# Astryx component reference: hooks/useHotkeys.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useHotkeys.doc.mjs. Original SHA-256: fd3474bd610483cdf9749e2e08d5989ac67c78cf32184122a2c68fcf81f56b0a.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useHotkeys',
  displayName: 'useHotkeys',
  keywords: ['hotkey', 'shortcut', 'keyboard', 'keydown', 'command', 'palette', 'mod', 'cmd', 'ctrl', 'kbd'],
  params: [
    {
      name: 'hotkeys',
      type: 'Hotkey[]',
      description:
        'Shortcut registrations. Each entry: `{ keys, onPress, allowInInputs?, isDisabled? }`. `keys` is a "+"-separated combo like "mod+k", "shift+/", "escape"; "mod" is ⌘ on macOS and Ctrl elsewhere. `onPress` receives the KeyboardEvent after preventDefault(). `allowInInputs` (default false) lets the hotkey fire while typing in inputs/textareas/selects/contenteditable. `isDisabled` temporarily disables the entry.',
      required: true,
    },
  ],
  returns: [],
  usage: {
    description:
      'Registers global keyboard shortcuts with a single window keydown listener per hook instance. Handlers live in a ref, so re-renders never re-subscribe. Skips events from typing targets (input, textarea, select, contenteditable) unless allowInInputs, skips defaultPrevented events, and calls preventDefault() on match. SSR-safe.',
    bestPractices: [
      { guidance: true, description: 'Use for app-level shortcuts like command palettes (mod+k), help overlays (shift+/), and navigation keys.' },
      { guidance: true, description: 'Pair with the Kbd component to display the same combo you register; both resolve "mod" per platform identically.' },
      { guidance: true, description: 'Use isDisabled to suspend shortcuts while a modal or wizard owns the keyboard, instead of unmounting the hook.' },
      { guidance: false, description: 'Use for focus-scoped keyboard navigation inside a widget; use useListFocus or useGridFocus instead.' },
    ],
  },
  relatedComponents: ['Kbd'],
  relatedHooks: ['useListFocus', 'useGridFocus'],
  importPath: '@astryxdesign/core/hooks',
  category: 'interaction',
}
```
