# Astryx component reference: RadioList/RadioListItem.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/RadioList/RadioListItem.doc.mjs. Original SHA-256: 68a74220f45fe3072a44055c94e13796b1f7d1d205f69eca71eb3d7f4b06472b.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'RadioListItem',
  subComponentOf: 'RadioList',
  displayName: 'Radio List Item',
  isHiddenFromOverview: true,
  description:
    'Individual radio item with label, description, and content slots. Under a coarse pointer an enabled option’s target grows toward 44 px through an invisible hit area. It never shrinks below the row and stops at half the gap to a closer neighbour; the row keeps its size. That hit area is the row’s `::after`, so decorate a row with a child.',
  // RadioListItem requires RadioList context; wrap it so the preview doesn't throw.
  playground: {
    defaults: {value: 'option-1', label: 'Option'},
    wrapper: {
      component: 'RadioList',
      props: {value: 'option-1', label: 'Radio list'},
    },
  },
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      description:
        'Primary label for the radio item. Rich labels may contain links or buttons, which keep their own behavior without selecting the item. The label text names the radio; use aria-label only when that text is absent, or retain every visible label word in the override.',
      required: true,
    },
    {
      name: 'aria-label',
      type: 'string',
      description:
        'Plain-text accessible name for the radio, applied to the control rather than the row. It overrides the name derived from the label. Use it when a rich label has no visible text; otherwise retain every visible label word.',
    },
    {
      name: 'value',
      type: 'string',
      description: 'Value of this radio item.',
      required: true,
    },
    {
      name: 'description',
      type: 'ReactNode',
      description:
        'Secondary content displayed below the label. Links and buttons keep their own click behaviour — the row only delegates clicks from its non-interactive surface to the radio.',
    },
    {
      name: 'align',
      type: "'center' | 'start' | 'first-line'",
      description:
        'Vertical alignment of the start and end content against the label, passed through to Item unchanged. `first-line` keeps a small mark (a radio) level with the first line of a wrapped label. See Item.align.',
      default: "'center'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether this individual radio item is disabled.',
      default: 'false',
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description: 'Content to render before the radio circle.',
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
      name: 'endContent',
      type: 'ReactNode',
      description: 'Content to render after the label.',
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
  ],
}
```
