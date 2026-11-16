# Astryx component reference: DropdownMenu/DropdownMenuRadioItem.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/DropdownMenu/DropdownMenuRadioItem.doc.mjs. Original SHA-256: f05d02dc22dd91e141c4d8359f38c317b21852a8114a92a4b7453d66f39ce0a9.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'DropdownMenuRadioItem',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Radio Item',
  isHiddenFromOverview: true,
  description:
    'A single option in a DropdownMenuRadioGroup (role="menuitemradio"). Must be used inside a DropdownMenuRadioGroup.',
  playground: {
    defaults: {
      value: 'option-1',
      label: 'Option 1',
    },
    wrapper: {
      component: 'DropdownMenuRadioGroup',
      props: {
        value: 'option-1',
        label: 'Radio group',
      },
    },
  },
  props: [
    {
      name: 'value',
      type: 'string',
      required: true,
      description:
        "The value this item represents within its group. The group's value matches against this to determine the checked state.",
    },
    {
      name: 'label',
      type: 'ReactNode',
      required: true,
      description: 'Primary label text identifying the option.',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: 'Secondary description text displayed below the label.',
    },
    {
      name: 'icon',
      type: 'IconType',
      description:
        'Icon to display before the label. See `astryx docs icons` for valid semantic names.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      default: 'false',
      description:
        'Whether this individual radio item is disabled. A disabled item stays in the accessibility tree as disabled (aria-disabled), and the arrow keys and typeahead reach it so keyboard users find it. The pointer highlight skips it, and selection is blocked.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Content to render after the label and description, such as a badge or metadata.',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLElement>',
      description:
        'Ref forwarded to the row root, the element carrying role="menuitemradio". Register the row with an element-keyed observer or overlay.',
    },
  ],
}
```
