# Astryx component reference: SideNav/SideNavCollapseButton.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/SideNav/SideNavCollapseButton.doc.mjs. Original SHA-256: ef8e0220aec4ceff9abb38f1efd06dfc9007c3ead12b9df0b2668d296d2f7e7d.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'SideNavCollapseButton',
  subComponentOf: 'SideNav',
  displayName: 'Side Nav Collapse Button',
  isHiddenFromOverview: true,
  description: 'Toggle button for sidenav collapse. Place inside SideNav (reads context automatically) or outside it (hand the same controlled collapsible config to both). Renders as an icon-only ghost button by default.',
  playground: {
    defaults: {
      collapsible: {
        isCollapsed: false,
        onCollapsedChange: undefined,
      },
    },
  },
  props: [
    {
      name: 'collapsible',
      type: '{isCollapsed: boolean, onCollapsedChange: (isCollapsed: boolean) => void, defaultIsCollapsed?: boolean, hasButton?: boolean, buttonLabel?: string}',
      description: 'The same controlled collapsible config passed to SideNav, with all its keys. Only needed when the button is rendered outside the sidenav, where collapse context cannot reach it.',
    },
    {
      name: 'handleRef',
      type: 'RefObject<SideNavImperativeCollapseHandle | null>',
      description: 'Deprecated. Imperative collapse handle from SideNav; pass collapsible instead.',
    },
    {
      name: 'label',
      type: 'string',
      description: 'Custom button label. When provided, renders as a text button with chevron. When omitted, renders icon-only.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: "Button size. Defaults to the size its container cascades ('sm' inside a SideNav footer) and to 'md' with no container. Set it when the button sits outside a sized container and has to match its neighbours.",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Custom button content. Overrides the default chevron icon and label.',
    },
  ],
}
```
