# Astryx component reference: hooks/useScrollableArea.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useScrollableArea.doc.mjs. Original SHA-256: c9f4f5c49a4061fdb5072d12c79c56b220b52992489a1ce0e6829fbcee66dbc0.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useScrollableArea',
  displayName: 'useScrollableArea',
  keywords: [
    'scroll',
    'overflow',
    'logical axis',
    'keyboard',
    'overscroll',
    'sticky',
    'resize',
  ],
  params: [
    {
      name: 'options',
      type: 'UseScrollableAreaOptions',
      description:
        'Logical scroll intent, fixed or automatic keyboard owner, overscroll policy, and fitting Sticky containment.',
      required: true,
    },
  ],
  returns: [
    {
      name: 'getViewportProps',
      type: '<E extends HTMLElement>(props?: ScrollableElementProps<E>) => ScrollableElementProps<E>',
      description:
        'Consumes caller viewport props, xstyle, and refs; composes fitting/active overflow, Sticky containment, accessibility, chaining, and owner registration.',
    },
    {
      name: 'getContentProps',
      type: '<E extends HTMLElement>(props?: ScrollableElementProps<E>) => ScrollableElementProps<E>',
      description:
        'Composes caller content-box props, xstyle, and refs with content observation.',
    },
    {
      name: 'state',
      type: 'ScrollableAreaState',
      description:
        'Stable inline and block effective-scroll and logical-edge state.',
    },
  ],
  usage: {
    description:
      'Adds canonical axis-aware scroll behavior to structure owned by the caller. An axis is effective only when its computed overflow is scroll-capable and geometry exceeds the shared 1px tolerance. Both viewport and content boxes are observed.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Pass already-resolved props and refs through both prop getters, then spread each returned object once.',
      },
      {
        guidance: true,
        description:
          'Use viewport keyboard ownership only when the viewport itself should enter the tab order; provide a concise accessible label.',
      },
      {
        guidance: true,
        description:
          'Use contentOrViewport to delegate forward Tab entry to the first sequential native link or button when it preserves native scroll keys. Inputs, composite widgets, and nested scroll areas retain the named viewport stop. Shift+Tab from the delegated first child skips the viewport; pointer and programmatic focus stay on it.',
      },
      {
        guidance: true,
        description:
          'Use content keyboard ownership when your integration already supplies keyboard access to the full scroll range. Automatic delegation checks current content at each keyboard entry without continuously tracking its focusability.',
      },
      {
        guidance: true,
        description:
          'Pass caller `xstyle` through `getViewportProps`; the getter composes it with fitting clip, active overflow, and Sticky containment.',
      },
      {
        guidance: true,
        description:
          'Give a viewport-owned tab stop a visible focus indicator; compose `focusOutlineStyles.focusVisible` (or an equivalent) into the viewport `xstyle`, as ScrollableArea does.',
      },
      {
        guidance: false,
        description:
          'Attach only the viewport getter. A real observed content box is required for live overflow changes.',
      },
      {
        guidance: false,
        description:
          'Declare overflow through caller props on the viewport; the getter owns overflow declarations and strips conflicting inline values.',
      },
    ],
  },
  relatedComponents: ['ScrollableArea'],
  relatedHooks: ['useScrollOverflow'],
  importPath: '@astryxdesign/core/hooks',
  category: 'layout',
}
```
