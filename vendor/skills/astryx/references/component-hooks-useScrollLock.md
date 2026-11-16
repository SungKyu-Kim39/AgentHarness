# Astryx component reference: hooks/useScrollLock.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useScrollLock.doc.mjs. Original SHA-256: 33e2456cba36b10994c07e0c247cd9a5979f01d95a78e0c330bcad21392c7ab3.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useScrollLock',
  displayName: 'useScrollLock',
  keywords: [
    'scroll',
    'lock',
    'modal',
    'dialog',
    'page',
    'prevent',
    'background',
    'ios',
    'safari',
    'touch',
    'scrollbar',
    'gutter',
    'layout shift',
    'reflow',
  ],
  params: [
    {
      name: 'isLocked',
      type: 'boolean',
      description: 'whether page scroll should be locked.',
      required: true,
    },
  ],
  returns: [],
  usage: {
    description:
      'Locks page scroll while active and keeps the page where it is. The page gets overflow: hidden (on the root, or on body when its own overflow is the one the viewport uses), which stops wheel, keyboard and scrollbar scrolling, and overscroll-behavior-y: none on the root and body, which stops the overscroll bounce while the lock holds. Where the primary pointer is coarse (phones and tablets), a one-finger pan that would scroll the page is cancelled, because iOS Safari scrolls an overflow: hidden page under a finger; pans that a scroller inside the overlay can take, drags on a native range input, pinch-zoom, and one-finger drags on a pinch-zoomed page (which pan the zoomed view) still work. The scroll offset never changes, so nothing jumps when the lock starts or ends, and iOS Safari keeps its toolbar as it was. Where the hidden scrollbar takes layout space (desktop), the hook holds its gutter open with scrollbar-gutter: stable, so the page, including any position: fixed chrome, does not shift sideways.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use when opening full-screen modals or dialogs to prevent background content from scrolling.',
      },
      {
        guidance: true,
        description:
          'Pass the same boolean that controls dialog visibility (e.g., isOpen) as the isLocked parameter.',
      },
      {
        guidance: false,
        description:
          'Use for non-modal overlays like popovers or tooltips; users should be able to scroll away from those.',
      },
    ],
  },
  relatedComponents: ['Dialog'],
  relatedHooks: ['useFocusTrap'],
  importPath: '@astryxdesign/core/hooks',
  category: 'layout',
}
```
