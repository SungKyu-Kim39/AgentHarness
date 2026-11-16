# Astryx component reference: SnapPaging/useSnapPaging.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/SnapPaging/useSnapPaging.doc.mjs. Original SHA-256: e932f255bb51826097a3244db7b16bf8543e3753c5dd460d6e2b7471ef783d09.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useSnapPaging',
  displayName: 'useSnapPaging',
  group: 'Carousel',
  keywords: ['carousel', 'paging', 'snap', 'swipe', 'flick', 'onboarding'],
  params: [
    {
      name: 'options',
      type: "{pages?: 'view' | 'item'}",
      description:
        "What one flick moves. 'view' moves one view and lands on the item start edge nearest one viewport on; 'item' moves one item. A new value applies from the next flick.",
      default: "{pages: 'view'}",
    },
  ],
  returns: [
    {
      name: 'paging',
      type: 'SnapPaging',
      description:
        "Snap paging for Carousel's hasSnap. The value is the same for the component's life, and Carousel keeps the value it first attached.",
    },
  ],
  usage: {
    description:
      "Gives a Carousel iOS paging on native snap's stops: pass the value as hasSnap={useSnapPaging()}. Under a finger and on a trackpad swipe, a flick moves one view, or one item with {pages: 'item'}, and the row rests on an item's start edge. A mouse wheel keeps native snapping. Only a carousel given the value loads the paging code.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Use it for a row read one view at a time, such as onboarding screens or a photo strip, where a fast flick must not skip past the next view.',
      },
      {
        guidance: true,
        description:
          "Pass {pages: 'item'} when several items show at once and each flick should move only one of them.",
      },
      {
        guidance: false,
        description:
          'Use it for a row people scan quickly; plain hasSnap keeps native momentum, which can pass several items in one swipe.',
      },
    ],
  },
  relatedComponents: ['Carousel'],
  relatedHooks: [],
  importPath: '@astryxdesign/core/SnapPaging',
  category: 'motion & gestures',
}
```
