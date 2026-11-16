# Astryx component reference: hooks/useLongPress.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useLongPress.doc.mjs. Original SHA-256: 32d6caa5c45fe8e382a239ce24dc3c562698e03a8886bec32a2e177d62592248.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useLongPress',
  displayName: 'useLongPress',
  keywords: [
    'long press',
    'touch',
    'press and hold',
    'context menu',
    'mobile',
    'ios',
    'safari',
    'gesture',
    'tap',
  ],
  params: [
    {
      name: 'options',
      type: 'UseLongPressOptions',
      description: 'Configuration object.',
      required: true,
    },
    {
      name: 'options.onLongPress',
      type: '(point: {x: number; y: number}) => void',
      description:
        'Fired with the touch start point once the press is held for delayMs.',
      required: true,
    },
    {
      name: 'options.disabled',
      type: 'boolean',
      description: 'When true, the returned touch handlers are inert.',
      default: 'false',
    },
    {
      name: 'options.delayMs',
      type: 'number',
      description: 'Hold duration before the press fires, in milliseconds.',
      default: '500',
    },
    {
      name: 'options.moveCancelPx',
      type: 'number',
      description:
        'Movement past this distance on either axis cancels the press, treating it as a scroll or drag.',
      default: '10',
    },
  ],
  returns: [
    {
      name: 'handlers',
      type: 'UseLongPressHandlers',
      description:
        'onTouchStart, onTouchMove, onTouchEnd and onTouchCancel to spread onto the target element.',
    },
  ],
  usage: {
    description:
      'Detects a single-finger press-and-hold and reports where it happened, so touch users can reach affordances that a pointer gets from right-click. iOS Safari never synthesizes a contextmenu event on long-press, which makes this the only touch route into a cursor-positioned surface such as ContextMenu. The press cancels on movement, lift, multi-touch or unmount. The hold is timed on the touch events\u2019 own timestamps: when a busy page handles the lift late, a finger held for the full delay still reports its long press, before the lift acts.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use the reported point to position the surface you open, so it appears under the finger.',
      },
      {
        guidance: true,
        description:
          'Pair it with the pointer contextmenu handler rather than replacing it; this hook only covers touch.',
      },
      {
        guidance: false,
        description:
          'Use it for the primary action of a control; press-and-hold is undiscoverable as the only way to do something.',
      },
    ],
  },
  relatedComponents: ['ContextMenu'],
  relatedHooks: ['useClickableContainer', 'useHotkeys'],
  importPath: '@astryxdesign/core/hooks',
  category: 'interaction',
}
```
