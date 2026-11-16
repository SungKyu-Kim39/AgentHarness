# Astryx component reference: TopNav/TopNavMenu.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/TopNav/TopNavMenu.doc.mjs. Original SHA-256: 6fab5c942a779ff0e246c8f2a2716466242a2606cf352cf8227f05cd368380d8.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'TopNavMenu',
  subComponentOf: 'TopNav',
  displayName: 'Top Nav Menu',
  description: 'Navigation item that displays a hover-triggered popover menu with rich items containing an icon, title, and optional description.',
  playground: {
    defaults: {
      label: 'Products',
      items: [
        {title: 'Analytics', description: 'Usage metrics and trends', href: '#'},
        {title: 'Automation', description: 'Workflows and rules', href: '#'},
        {title: 'Billing', href: '#'},
      ],
    },
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
      type: 'TopNavMenuItemData[]',
      description: 'Menu items to display in the hover popover. Item href values follow the shared navigation rule described on Link; rejected destinations remain visible without navigation.',
      required: true,
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
      default: '200',
    },
  ],
}
```
