# Astryx component reference: DropdownMenu/DropdownMenuDivider.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/DropdownMenu/DropdownMenuDivider.doc.mjs. Original SHA-256: 6b9b04a310a0f290b6915e3f8a73092a4b4bc7c6cda7b92c92c501011e0ea9c6.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'DropdownMenuDivider',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Divider',
  isHiddenFromOverview: true,
  description:
    'A horizontal rule separating groups of rows in a compound menu. Renders role="separator", so it is never a stop in the arrow-key order. The data-driven equivalent is the `{type: "divider"}` entry in `items`; both modes render this component, so they look and theme identically. Host attributes and DOM handlers (id, data-*, aria-*) reach the separator; its role and orientation stay component-owned.',
  props: [
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles applied after the menu spacing. Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [{className: 'astryx-dropdown-menu-divider'}],
  },
}
```
