# Astryx component reference: DropdownMenu/DropdownMenuRadioGroup.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/DropdownMenu/DropdownMenuRadioGroup.doc.mjs. Original SHA-256: 8eb7c9344d6186af28e0863c71e7e729d21380a1a8787d3b20737adc28bf9f41.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'DropdownMenuRadioGroup',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Radio Group',
  isHiddenFromOverview: true,
  description:
    'A controlled, named single-select group of DropdownMenuRadioItem children (role="group" of menuitemradio). Owns value propagation, close policy, root composition, and the menu inter-item gap; the parent DropdownMenu owns keyboard navigation.',
  usage: {
    description:
      'Use DropdownMenuRadioGroup inside compound-mode DropdownMenu when several commands represent one mutually exclusive choice. Keep value in caller state, provide a concise accessible label, and render each choice as DropdownMenuRadioItem.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep value controlled and update it from onChange so checked state follows caller data.',
      },
      {
        guidance: true,
        description:
          'Provide a concise label even when aria-labelledby points to visible text; label remains required and supplies the aria-label fallback.',
      },
      {
        guidance: true,
        description:
          'Set hasCloseOnSelect=false only when the menu must stay open to show another selection or an in-place result.',
      },
      {
        guidance: false,
        description:
          'Place buttons, links, checkboxes, or arbitrary menu rows inside the radio group.',
      },
      {
        guidance: false,
        description:
          'Add a second key handler or roving-focus model; DropdownMenu owns keyboard navigation.',
      },
    ],
    anatomy: [
      {
        name: 'Group',
        required: true,
        description:
          'The role="group" root that owns the accessible name, controlled-selection context, close policy, root inputs, and inter-item gap.',
      },
      {
        name: 'Radio items',
        required: true,
        description:
          'DropdownMenuRadioItem children; each child owns its menuitemradio role, checked state, content, and indicator paint.',
      },
    ],
  },
  playground: {
    wrapper: {
      component: 'DropdownMenu',
      // Open on first load so the radio choices are visible without a click;
      // the preview bridges `onOpenChange` back so selecting still closes the
      // menu and the trigger reopens it.
      props: {
        button: {label: 'Sort'},
        presentation: 'popover',
        isMenuOpen: true,
      },
    },
    defaults: {
      value: 'newest',
      label: 'Sort by',
      children: [
        {
          __element: 'DropdownMenuRadioItem',
          props: {value: 'newest', label: 'Newest'},
        },
        {
          __element: 'DropdownMenuRadioItem',
          props: {value: 'oldest', label: 'Oldest'},
        },
      ],
    },
  },
  props: [
    {
      name: 'value',
      type: 'string | undefined',
      description:
        'The currently selected value in the group. Pass undefined when nothing is selected yet.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string) => void',
      description: 'Callback fired when the selected value changes.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible name for the group, applied as aria-label so screen readers announce the radios as a named set, e.g. "Sort by". Required even when aria-labelledby (via base props) points to visible text; that visible reference becomes the computed name while label remains the fallback.',
      required: true,
    },
    {
      name: 'hasCloseOnSelect',
      type: 'boolean',
      default: 'true',
      description:
        'Whether selecting a value closes the menu. Radio items default to closing on selection (a single-choice commit).',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: 'Ref forwarded to the role="group" root.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'The DropdownMenuRadioItems that make up the group.',
      required: true,
    },
  ],
}
```
