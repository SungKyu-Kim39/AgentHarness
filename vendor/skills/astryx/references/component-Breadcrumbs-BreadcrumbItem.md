# Astryx component reference: Breadcrumbs/BreadcrumbItem.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Breadcrumbs/BreadcrumbItem.doc.mjs. Original SHA-256: cbbbf19ddaaf947891c74f9e8807b2a6972080f66d92cf15e9846a3d9045e026.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'BreadcrumbItem',
  subComponentOf: 'Breadcrumbs',
  displayName: 'Breadcrumb Item',
  isHiddenFromOverview: true,
  description: 'Individual breadcrumb item that renders as a link when href is provided, or as plain text for the current page.',
  usage: {
    description:
      'BreadcrumbItem represents one destination, action, current location, or sibling-menu trigger inside a Breadcrumbs trail.',
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Label content for the breadcrumb item.',
      required: true,
    },
    {
      name: 'href',
      type: 'string',
      description: 'URL the breadcrumb links to; omit for non-navigable items.',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description: 'Click handler for the breadcrumb item.',
    },
    {
      name: 'isCurrent',
      type: 'boolean',
      description:
        'Marks this item as the current page, applying aria-current="page". When omitted, the last item is auto-detected if no item is explicitly current; pass false to opt out.',
    },
    {
      name: 'startIcon',
      type: 'ReactNode',
      description: 'Icon rendered before the item label.',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'menu',
      type: 'DropdownMenuOption[] | ReactNode',
      description:
        'Menu opened when the item is activated, using the same item API as DropdownMenu/MoreMenu/ContextMenu (a DropdownMenuOption[] array or composed DropdownMenuItem children). Renders a link-styled menu trigger with a chevron and aria-haspopup="menu". Takes precedence over href/onClick.',
    },
    {
      name: 'menuSize',
      type: "'sm' | 'md' | 'lg'",
      description:
        "Size passed to the menu items. Defaults from the breadcrumb variant ('supporting' → 'sm', otherwise 'md').",
    },
    {
      name: 'as',
      type: 'LinkComponentType',
      description: 'Custom link component to render instead of <a>. Overrides the provider-level default from LinkProvider. Only applies to non-current items.',
    },
  ],
}
```
