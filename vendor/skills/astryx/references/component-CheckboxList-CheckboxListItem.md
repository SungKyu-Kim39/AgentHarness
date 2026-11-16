# Astryx component reference: CheckboxList/CheckboxListItem.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/CheckboxList/CheckboxListItem.doc.mjs. Original SHA-256: 25d26d6e08eea70ad1f9d9a876ed4628aeb94c602c6f2c486b1c86d3775bf09d.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'CheckboxListItem',
  subComponentOf: 'CheckboxList',
  displayName: 'Checkbox List Item',
  isHiddenFromOverview: true,
  description:
    'Individual checkbox item with label, description, and end content slot. Works in collection mode (inside a CheckboxList with a value array) or standalone mode (inside List, or inside a CheckboxList without value, such as a select-all item). On a touch screen (a coarse primary pointer), a toggleable row is one press target: a touch on the label, the description or the box itself shows the pressed state on the row and its checkbox together. Where the primary pointer is fine, the box keeps its own press.',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      description:
        'Primary text label for the item. Rich labels may contain links or buttons, which keep their own behavior without toggling the item. A ReactNode label names the checkbox from its visible text; pass aria-label only when that text is absent, or include all visible label words in the override.',
      required: true,
    },
    {
      name: 'aria-label',
      type: 'string',
      description:
        'Plain-text accessible name for the checkbox, replacing the one derived from label. Applied to the checkbox control. Use it when a rich label has no visible text; otherwise the value must retain every visible label word.',
    },
    {
      name: 'value',
      type: 'string',
      description:
        'Identity key. Required when the parent CheckboxList has a value array; the item throws without it there.',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description:
        "Secondary content below the label. String or ReactNode. Exposed as the checkbox's accessible description through aria-describedby, so assistive technology can tell it is the explanation for that choice.",
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: 'Content rendered after the label area.',
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
      name: 'align',
      type: "'center' | 'start' | 'first-line'",
      description:
        'Vertical alignment of the start and end content against the label, passed through to Item unchanged. `first-line` keeps a small mark (a checkbox) level with the first line of a wrapped label. See Item.align.',
      default: "'center'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether this individual item is disabled.',
      default: 'false',
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Whether this item is loading. Shows a spinner inside the checkbox and blocks interaction on this item. In collection mode, the toggled item also shows this automatically while the parent changeAction is pending.',
      default: 'false',
    },
    {
      name: 'isChecked',
      type: "boolean | 'indeterminate'",
      description:
        'Direct checked state in standalone mode: inside List, or inside a CheckboxList without value (for example, a select-all item). Ignored when the parent CheckboxList has a value array.',
    },
    {
      name: 'onCheck',
      type: '(checked: boolean) => void',
      description:
        "Direct check handler in standalone mode: inside List, or inside a CheckboxList without value. Ignored when the parent CheckboxList has a value array; that list's onChange receives the change.",
    },
  ],
  examples: [
    {
      label: 'Rich label with an overriding aria-label',
      code: `<CheckboxListItem
  label={<span>Pro plan <Badge label="Recommended" /></span>}
  aria-label="Pro plan Recommended option"
  value="pro"
/>`,
    },
  ],
}
```
