# Astryx component reference: Layer/Layer.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Layer/Layer.doc.mjs. Original SHA-256: 0276bfedbefbd34afd10e7e0bfe4b2ad98796c294039220fc618df7405ffa141.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Layer',
  displayName: 'Layer',
  group: 'Utilities',
  category: 'Utility',
  keywords: [
    'layer',
    'overlay',
    'popover',
    'positioning',
    'anchor',
    'floating',
    'dropdown',
    'popper',
    'popup',
    'portal',
  ],
  usage: {
    description:
      'Layer utilities provide the app-level provider used by overlay systems. Use LayerProvider at the app root for toast/layer configuration; use higher-level Popover, HoverCard, or Tooltip APIs for most overlay UI. Rendered layer content, not the provider’s application subtree, uses theme body text defaults and exits ancestor surface/group membership. Establish intentional groups and complete required providers inside each layer. Every anchored layer keeps a gutter from each viewport edge — the spacing-4 step or the device safe-area inset, whichever is larger — and is capped to the viewport, never to the room beside its trigger: an explicit width renders at its size, flips when it does not fit beside the trigger, and slides into view when it fits on neither side. An app that floats a persistent bar over a viewport edge declares it once as inset on LayerProvider (blockStart, blockEnd, inlineStart, inlineEnd); each edge adds to that edge\u2019s gutter for every anchored layer and moves the toast viewport by the same amount, and defaults to zero. The inset is app configuration, not a theme value.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Declare a persistent bar floating over the viewport once, as inset on LayerProvider; every anchored layer and toast then stays clear of it.',
      },
      {
        guidance: true,
        description:
          'Use LayerProvider once near the app root when you need shared toast/layer configuration.',
      },
      {
        guidance: true,
        description:
          'Build on higher-level components like Popover, HoverCard, and Tooltip for common overlay patterns.',
      },
      {
        guidance: false,
        description:
          'Nest a LayerProvider to change toast settings: a nested provider keeps the outer toast configuration and mounts no second toast viewport.',
      },
    ],
  },
  components: [
    {
      name: 'LayerProvider',
      displayName: 'Layer Provider',
      description:
        'App-level configuration for toasts and the viewport inset. A nested provider mounts no second toast viewport and keeps the outer toast configuration; one that declares an inset applies its declared edges to the anchored layers in its subtree.',
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Application subtree that can use the shared layer context.',
          required: true,
        },
        {
          name: 'toast',
          type: 'LayerToastConfig',
          description:
            'Toast viewport configuration. Controls position, maxVisible, and a toast-only inset that overrides the provider inset per edge for toasts shown through useToast.',
        },
        {
          name: 'inset',
          type: 'LayerInset',
          description:
            'A persistent bar floating over a viewport edge, declared once: blockStart, blockEnd, inlineStart, inlineEnd as pixel numbers or CSS lengths. Each edge adds to the gutter every anchored layer keeps from that edge and moves the toast viewport by the same amount. Defaults to zero on every edge.',
        },
      ],
    },
  ],
}
```
