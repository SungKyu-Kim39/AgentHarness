# Astryx component reference: MoreMenu/MoreMenu.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/MoreMenu/MoreMenu.doc.mjs. Original SHA-256: 684abfd0827550d0e4660a399ad711518b949c9c536daf23b650e8c85e3134c8.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'MoreMenu',
  displayName: 'More Menu',
  category: 'Action',
  keywords: ["moremenu","overflow","kebab","dotmenu","threedot","ellipsis","dropdown","contextmenu","actionmenu"],
  props: [
    {
      name: 'items',
      type: 'DropdownMenuOption[]',
      description:
        'Menu items: data array of actions, dividers, and sections. Same type as DropdownMenu items prop.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label for the trigger button (aria-label) and tooltip text.',
      default: "'More options'",
    },
    {
      name: 'variant',
      type: 'ButtonVariant',
      description: 'Visual style variant of the trigger button.',
      default: "'ghost'",
    },
    {
      name: 'size',
      type: 'ButtonSize',
      description: 'Size of the trigger button.',
      default: "'md'",
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'Override the default three-dot icon. Accepts any ReactNode.',
      slotElements: [{__element: 'Icon', props: {icon: 'check', size: 'sm'}}],
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the menu trigger is disabled.',
      default: 'false',
    },
    {
      name: 'placement',
      type: "'above' | 'below' | 'start' | 'end'",
      description:
        "Position of the menu relative to the trigger. Logical: start/end resolve against the menu's own inherited direction (RTL mirrors).",
      default: "'below'",
    },
    {
      name: 'alignment',
      type: "'start' | 'center' | 'end'",
      description:
        "Alignment along the placement axis. Use 'end' to align the menu with the trigger's trailing edge, which is usually what an overflow menu wants.",
      default: "'start'",
    },
    {
      name: 'presentation',
      type: "'popover' | 'bottom-sheet' | 'adaptive'",
      description: 'Presentation policy forwarded to DropdownMenu. `adaptive` keeps the anchored popover on pointer-based layouts and uses a BottomSheet on a compact touch screen: a coarse primary pointer, and a viewport narrower than the theme `md` breakpoint (768px by default) or shorter than 500px. Omitted, the menu is the anchored popover, and under a finger or a pen, on every device, its trigger opens as it is pressed (inside a scroll view, after the 150 ms content-touch delay), and the opening finger picks after moving 10 px. Pass \'popover\' to keep the pointer behavior on every device, a 500 ms hold included.',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: 'Callback fired when the menu opens or closes.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],
  playground: {
    defaults: {
      items: [
        {label: 'Edit', value: 'edit'},
        {label: 'Duplicate', value: 'duplicate'},
        {label: 'Delete', value: 'delete'},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'astryx-more-menu'},
    ],
  },
  usage: {
    anatomy,
    description:
      'MoreMenu is a three-dot button that opens a list of actions. Use it for secondary actions that don\'t need to be always visible, like in table rows, card headers, or toolbars. Host `data-*` attributes reach the trigger button; its accessible name, `id`, and menu disclosure attributes stay component-owned.',
    bestPractices: [
      { guidance: true, description: 'Use for overflow or secondary actions; keep primary actions visible outside the menu.' },
      { guidance: true, description: 'Use dividers or sections to group related actions when the menu has many items.' },
      { guidance: true, description: 'Use `presentation="adaptive"` when the visible overflow trigger should open a thumb-reachable BottomSheet on compact touch devices.' },
      { guidance: false, description: 'Hide primary actions inside a MoreMenu; they should be directly visible.' },
    ],
  },
}
```
