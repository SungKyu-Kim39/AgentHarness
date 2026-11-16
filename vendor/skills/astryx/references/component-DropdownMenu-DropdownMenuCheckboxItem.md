# Astryx component reference: DropdownMenu/DropdownMenuCheckboxItem.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/DropdownMenu/DropdownMenuCheckboxItem.doc.mjs. Original SHA-256: 5442593988be40d6041b28ea161ef545b18782c985af0b1b4313034c0f8d8fd9.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'DropdownMenuCheckboxItem',
  subComponentOf: 'DropdownMenu',
  displayName: 'Dropdown Menu Checkbox Item',
  isHiddenFromOverview: true,
  description:
    'A checkable menu item (role="menuitemcheckbox") that toggles an independent boolean. Use for on/off options inside a DropdownMenu; for a one-of-N choice use DropdownMenuRadioGroup.',
  usage: {
    anatomy,
    description:
      'An independently checkable option inside DropdownMenu. The row owns menuitemcheckbox semantics while the shared Indicator supplies decorative checkbox paint.',
  },
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      description: 'Primary label text identifying the item.',
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
      name: 'value',
      type: 'boolean',
      description:
        'Whether the item is checked. Controlled; pair with onChange.',
    },
    {
      name: 'onChange',
      type: '(checked: boolean) => void',
      description:
        'Callback fired with the next checked state when the item is toggled.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      default: 'false',
      description:
        'Whether the item is disabled. A disabled item stays in the accessibility tree as disabled (aria-disabled), and the arrow keys and typeahead reach it so keyboard users find it. The pointer highlight skips it, and activation is blocked.',
    },
    {
      name: 'hasCloseOnSelect',
      type: 'boolean',
      default: 'false',
      description:
        'Whether toggling the item closes the menu. Checkbox items default to staying open so several can be toggled in a single session.',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLElement>',
      description:
        'Ref forwarded to the row root, the element carrying role="menuitemcheckbox". Register the row with an element-keyed observer or overlay.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Content to render after the label and description, such as a keyboard shortcut hint or badge.',
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-dropdown-menu-item',
        visualProps: ['size'],
      },
    ],
  },
}
```
