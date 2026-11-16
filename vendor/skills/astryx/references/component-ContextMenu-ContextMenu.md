# Astryx component reference: ContextMenu/ContextMenu.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/ContextMenu/ContextMenu.doc.mjs. Original SHA-256: a39c3b9f7551b23e66dd2859dbe5255dda0b29579bc9c5ab72457a95051617ed.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'ContextMenu',
  displayName: 'Context Menu',
  group: 'ContextMenu',
  category: 'Action',
  isHiddenFromOverview: true,
  keywords: [
    'contextmenu',
    'right-click',
    'menu',
    'popover',
    'actions',
    'context',
  ],
  theming: {
    targets: [{className: 'astryx-context-menu'}],
    vars: [
      {
        name: '--_dropdown-menu-radius',
        description: 'Border radius of the menu popup',
        default: 'var(--radius-container)',
        private: true,
      },
      {
        name: '--_dropdown-menu-padding',
        description: 'Inner padding of the menu popup',
        default: 'var(--spacing-1)',
        private: true,
      },
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_dropdown-menu-radius']},
      {property: 'padding', vars: ['--_dropdown-menu-padding']},
    ],
  },
  description:
    'A context menu that appears on right-click at the cursor position. Wraps trigger content as children.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'The trigger area: right-click on this content to open the menu.',
      required: true,
    },
    {
      name: 'items',
      type: 'ContextMenuOption[]',
      description:
        'Data-driven menu entries. Pass exactly one of `items` or `menuContent`. Each entry is one of: an action item `{label, onClick?, icon?, isDisabled?, variant?, items?}` (nested `items` open a flyout in popover presentation and drill into a new view in bottom-sheet presentation; variant `"destructive"` renders it in the error color), a divider `{type: "divider"}`, or a section `{type: "section", title?, items: [...action items]}`.',
    },
    {
      name: 'menuContent',
      type: 'ReactNode',
      description:
        'Custom JSX menu content for compound mode. Pass exactly one of `menuContent` or `items`.',
    },
    {
      name: 'menuWidth',
      type: 'number | string',
      description: 'Custom menu width.',
      default: "'160px'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size of menu items: controls padding density.',
      default: "'md'",
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible name for the menu surface, announced when it opens.',
      default: "'Context menu'",
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: 'Callback fired when the menu opens or closes.',
    },
    {
      name: 'presentation',
      type: "'popover' | 'bottom-sheet' | 'adaptive'",
      description:
        'Presentation policy. `popover` opens at the pointer position, `bottom-sheet` always uses an action sheet, and `adaptive` uses the BottomSheet on a compact touch screen: a coarse primary pointer, and a viewport narrower than the theme `md` breakpoint (768px by default) or shorter than 500px.',
      default: "'popover'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'When true, right-click shows the native browser context menu instead.',
      default: 'false',
    },
    {
      name: 'triggerXstyle',
      type: 'StyleXStyles | StyleXStyles[]',
      description:
        'Styles applied to the trigger wrapper. Accepts `stylex.create()` values, not inline style objects.',
    },
    {
      name: 'triggerAs',
      type: "'div' | 'span'",
      description:
        "The element the trigger wrapper renders as. 'div' is a block; 'span' an inline wrapper, so a reference inside prose can own a context menu without breaking the text flow.",
      default: "'div'",
    },
  ],
  components: [{name: 'ContextMenuItem'}],
  usage: {
    anatomy,
    description:
      'A right-click context menu that appears at the cursor position. Use to provide contextual actions for specific elements or regions without cluttering the UI with visible buttons.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep menu items concise and action-oriented; users expect quick access to contextual actions.',
      },
      {
        guidance: true,
        description:
          'Use sections and dividers to group related actions when the menu has many items.',
      },
      {
        guidance: true,
        description:
          'Use `presentation="adaptive"` when right-click should remain cursor-positioned on desktop while long-press opens a reachable BottomSheet on compact touch devices.',
      },
      {
        guidance: true,
        description:
          'Ensure all context menu actions are also accessible via other UI elements for keyboard-only users.',
      },
      {
        guidance: true,
        description:
          'Keep a visible MoreMenu or equivalent trigger for important mobile actions; long-press must not be the only route.',
      },
      {
        guidance: false,
        description:
          'Use a ContextMenu as the only way to access important actions; not all users know to right-click.',
      },
      {
        guidance: false,
        description:
          'Place more than 10–12 items in a single menu without grouping them into sections.',
      },
    ],
  },
  playground: {
    defaults: {
      children: {
        __element: 'Card',
        props: {padding: 6},
        children: {
          __element: 'Text',
          props: {color: 'secondary'},
          children: 'Right-click this area',
        },
      },
      items: [
        {label: 'Edit'},
        {label: 'Duplicate'},
        {type: 'divider'},
        {label: 'Delete'},
      ],
    },
  },
}
```
