# Astryx component reference: SideNav/SideNavItem.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/SideNav/SideNavItem.doc.mjs. Original SHA-256: 61e01e85dbf0e17a05ce70ec517d6b951cccd5e4a40ef95d1b4ba98309d63c4a.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'SideNavItem',
  subComponentOf: 'SideNav',
  displayName: 'Side Nav Item',
  isHiddenFromOverview: true,
  description: 'Navigation item with icon, selected state, optional end content, and nesting support via children.',
  playground: {
    defaults: {label: 'Dashboard', icon: 'viewColumns', isSelected: true},
  },
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Item label.',
      required: true,
    },
    {
      name: 'as',
      type: 'LinkComponentType',
      description: 'Custom link component.',
    },
    {
      name: 'icon',
      type: 'IconType',
      description: 'Icon displayed in the outline (unselected) variant. See `astryx docs icons` for valid semantic names.',
    },
    {
      name: 'selectedIcon',
      type: 'IconType',
      description: 'Icon displayed when the item is selected (filled variant). See `astryx docs icons` for valid semantic names.',
    },
    {
      name: 'isSelected',
      type: 'boolean',
      description: 'Marks this item as the current page.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disabled state.',
      default: 'false',
    },
    {
      name: 'href',
      type: 'string',
      description: 'Navigation URL.',
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description: 'Click handler.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: 'Passive right-side content only (badges, counts). Interactive controls go in actions.',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'chevronDown',
            size: 'sm',
          },
        },
        {
          __element: 'Badge',
          props: {
            label: '3',
          },
        },
      ],
    },
    {
      name: 'actions',
      type: 'ReactNode',
      description:
        'Row-level secondary controls (icon buttons, menus) rendered as siblings of the primary element at the trailing edge of the row: after the expand/collapse toggle, before any nested children in DOM and focus order. Each control owns its accessible name and behavior. Controls inherit the row control size through SizeContext, so an unsized icon button matches the built-in expand/collapse toggle; an explicit size still wins. Hidden while the SideNav rail is collapsed. Use endContent for passive content (badges, counts); use actions for anything interactive.',
      slotElements: [
        {
          __element: 'Button',
          props: {label: 'Rename', variant: 'ghost', size: 'sm'},
        },
      ],
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Sub-items for nesting. Nested items span the full width of the nav list, like top-level items; their content is indented one step per nesting level.',
      slotElements: [
        {
          __element: 'SideNavItem',
          props: {
            label: 'Sub Item',
          },
        },
      ],
    },
    {
      name: 'collapsible',
      type: 'boolean | { defaultIsCollapsed?: boolean, isCollapsed?: boolean, onCollapsedChange?: (isCollapsed: boolean) => void }',
      description: 'Enables collapse behavior for items with children. Pass true for uncontrolled (starts expanded), or an object for controlled mode.',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size variant for the nav item row.',
      default: "'md'",
    },
  ],
}
```
