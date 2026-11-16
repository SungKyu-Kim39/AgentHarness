# Astryx component reference: TopNav/TopNavMegaMenu.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/TopNav/TopNavMegaMenu.doc.mjs. Original SHA-256: 79cd792e09e2236774c0c3956a9bf472ec400005c4f707309c09bb7995edf4cb.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'TopNavMegaMenu',
  subComponentOf: 'TopNav',
  displayName: 'Top Nav Mega Menu',
  description: 'Navigation item that displays a full-width mega menu panel on hover. Uses a slots API with items and featured props. TopNavMegaMenuItem renders itself in both desktop and mobile drawer modes. Supports inline collapsible drawer via render mode context.',
  // The panel anchors to the nearest <nav>; wrap the preview in a TopNav so
  // it opens below the bar instead of pinning to the viewport corner (#4905).
  playground: {
    wrapper: {component: 'TopNav'},
  },
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Visible label for the trigger button.',
      required: true,
    },
    {
      name: 'items',
      type: 'ReactNode',
      description: 'Menu items slot: typically TopNavMegaMenuItem components, but accepts any ReactNode.',
      slotElements: [
        {
          __element: 'TopNavItem',
          props: {
            label: 'Item',
            href: '#',
          },
        },
      ],
    },
    {
      name: 'featured',
      type: 'ReactNode',
      description: 'Featured content slot: rendered in the right panel on desktop, below items in the mobile drawer.',
      slotElements: [
        {
          __element: 'Card',
          props: {
            padding: 4,
          },
          children: 'Featured content',
        },
      ],
    },
    {
      name: 'delay',
      type: 'number',
      description: 'Delay in milliseconds before showing the menu on hover.',
      default: '150',
    },
    {
      name: 'hideDelay',
      type: 'number',
      description: 'Delay in milliseconds before hiding the menu after the mouse leaves.',
      default: '250',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: 'Callback fired when the mega menu opens or closes. Useful for coordinating wrapper styles.',
    },
  ],
}
```
