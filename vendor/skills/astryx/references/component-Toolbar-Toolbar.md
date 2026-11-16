# Astryx component reference: Toolbar/Toolbar.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Toolbar/Toolbar.doc.mjs. Original SHA-256: a4a7068e9866999d6fe6d3a5d15ba9e5cc69870d677c87f86caa214bcbfa7a41.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Toolbar',
  displayName: 'Toolbar',
  category: 'Action',
  keywords: ['toolbar', 'nav', 'bar', 'actions', 'buttonbar', 'header', 'footer', 'action-bar', 'control-bar'],
  playground: {
    defaults: {
      label: 'Table actions',
      size: 'sm',
      dividers: ['bottom'],
      startContent: {
        __element: 'TabList',
        props: {value: 'overview'},
        children: [
          {__element: 'Tab', props: {label: 'Overview', value: 'overview'}},
          {__element: 'Tab', props: {label: 'Activity', value: 'activity'}},
        ],
      },
      endContent: [
        {__element: 'Selector', props: {label: 'Status', isLabelHidden: true, placeholder: 'Status', size: 'sm', options: ['Open', 'In progress', 'Done']}},
        {__element: 'Button', props: {label: 'New item', variant: 'primary', size: 'sm'}},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'astryx-toolbar', states: ['size']},
    ],
  },
  components: [
    {
      name: 'Toolbar',
      displayName: 'Toolbar',
      description:
        'General-purpose toolbar container with three content slots and roving tabindex.',
      props: [
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the toolbar, applied as aria-label.',
          required: true,
        },
        {
          name: 'startContent',
          type: 'ReactNode',
          description: 'Content aligned to the start (left in LTR).',
          slotElements: [
            {__element: 'Text', props: {type: 'body', weight: 'bold'}, children: 'Title'},
            {__element: 'Button', props: {label: 'Back', variant: 'ghost', size: 'sm'}},
            {__element: 'IconButton', props: {label: 'Filter', icon: {__element: 'Icon', props: {icon: 'check', size: 'sm'}}, variant: 'ghost', size: 'sm'}},
            {
              __element: 'TabList',
              props: {value: 'overview'},
              children: [
                {__element: 'Tab', props: {label: 'Overview', value: 'overview'}},
                {__element: 'Tab', props: {label: 'Activity', value: 'activity'}},
              ],
            },
            {
              __element: 'SegmentedControl',
              props: {label: 'View', value: 'list'},
              children: [
                {__element: 'SegmentedControlItem', props: {label: 'List', value: 'list'}},
                {__element: 'SegmentedControlItem', props: {label: 'Grid', value: 'grid'}},
              ],
            },
            {__element: 'Selector', props: {label: 'Status', isLabelHidden: true, placeholder: 'Status', size: 'sm', options: ['Open', 'In progress', 'Done']}},
          ],
        },
        {
          name: 'centerContent',
          type: 'ReactNode',
          description:
            'Centered content. Switches to the three-lane layout: centered while each side lane fits in half of the width it leaves, and the row wraps when the lanes do not fit.',
          slotElements: [
            {__element: 'Text', props: {type: 'body', weight: 'bold'}, children: 'Center'},
            {
              __element: 'SegmentedControl',
              props: {label: 'View', value: 'list'},
              children: [
                {__element: 'SegmentedControlItem', props: {label: 'List', value: 'list'}},
                {__element: 'SegmentedControlItem', props: {label: 'Grid', value: 'grid'}},
              ],
            },
            {
              __element: 'TabList',
              props: {value: 'overview'},
              children: [
                {__element: 'Tab', props: {label: 'Overview', value: 'overview'}},
                {__element: 'Tab', props: {label: 'Activity', value: 'activity'}},
              ],
            },
          ],
        },
        {
          name: 'endContent',
          type: 'ReactNode',
          description: 'Content aligned to the end (right in LTR).',
          slotElements: [
            {__element: 'Button', props: {label: 'Save', variant: 'primary', size: 'sm'}},
            {__element: 'IconButton', props: {label: 'More', icon: {__element: 'Icon', props: {icon: 'chevronDown', size: 'sm'}}, variant: 'ghost', size: 'sm'}},
            {__element: 'Selector', props: {label: 'Sort', isLabelHidden: true, placeholder: 'Sort by', size: 'sm', options: ['Newest', 'Oldest', 'A–Z']}},
            {__element: 'Badge', props: {label: '3'}},
          ],
        },
        {
          name: 'size',
          type: "'sm' | 'md' | 'lg'",
          description:
            'Size of the toolbar. Controls minimum height and coordinates with Button, TextInput, TabList, and Selector; children inherit this size as their default via SizeContext.',
          default: "'md'",
        },
        {
          name: 'gap',
          type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
          description: 'Gap between items within each slot.',
          default: '1',
        },
        {
          name: 'orientation',
          type: "'horizontal' | 'vertical'",
          description:
            'Orientation for keyboard navigation. Controls arrow key direction.',
          default: "'horizontal'",
        },
        {
          name: 'variant',
          type: 'SectionVariant',
          description: 'Visual variant passed to Section.',
          default: "'transparent'",
        },
        {
          name: 'dividers',
          type: "Array<'top' | 'bottom' | 'start' | 'end'>",
          description: 'Borders/dividers rendered around the toolbar.',
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],    },
  ],
  usage: {
    anatomy,
    description:
      'Toolbar is a horizontal bar with left, center, and right areas. Use it for contextual actions within a content area (above a table, inside a card, or in a panel), not as a page-level header. Set the size once on the toolbar and all buttons, inputs, and tabs inside it match automatically.',
    bestPractices: [
      {guidance: true, description: 'Put secondary actions like "Back" on the left, and primary actions like "Save" on the right.'},
      {guidance: true, description: 'Make temporary toolbars like bulk selection visually distinct so users can tell they\'re contextual, for example with a background color or border.'},
      {guidance: true, description: 'Visually separate the toolbar from the content below it, with a divider, a background variant, or both.'},
      {guidance: true, description: 'Use Toolbar as a card header when the header has interactive actions like filter or add; it gives you slot layout, keyboard navigation, and size cascading. If the header is just a title with no actions, a LayoutHeader or Section is enough.'},
      {guidance: false, description: 'Put too many actions in one toolbar; move less common items into a MoreMenu.'},
      {guidance: false, description: 'Set size on individual child buttons; set it once on the toolbar and it cascades automatically.'},
      {guidance: false, description: 'Use Toolbar for app-wide navigation like main menu links or sign out; use TopNav or LayoutHeader for that.'},
    ],
  },
}
```
