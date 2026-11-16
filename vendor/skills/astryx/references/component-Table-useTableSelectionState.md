# Astryx component reference: Table/useTableSelectionState.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Table/useTableSelectionState.doc.mjs. Original SHA-256: c2108179ddc655c02912d941a4a24a8bb5aa4128a0f32615cef6584a40833198.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useTableSelectionState',
  subComponentOf: 'Table',
  displayName: 'useTableSelectionState',
  description:
    'State management companion for useTableSelection. Returns selectionConfig for the behaviour plugin plus selectionState for selection-aware UI such as TableSelectionToolbar. Handles disabled/selectable row filtering for select-all automatically: disabled rows are frozen (preserved across select-all/deselect-all), non-selectable rows are excluded.',
  props: [
    {
      name: 'data',
      type: 'T[]',
      description: 'The full data array rendered in the table.',
      required: true,
    },
    {
      name: 'idKey',
      type: '(keyof T & string) | ((item: T) => string)',
      description:
        'Key extractor: property name or function returning a unique string ID.',
      required: true,
    },
    {
      name: 'selectedKeys',
      type: 'Set<string>',
      description: 'Controlled set of selected item IDs.',
      required: true,
    },
    {
      name: 'setSelectedKeys',
      type: 'Dispatch<SetStateAction<Set<string>>>',
      description: 'Setter for the controlled selected keys.',
      required: true,
    },
    {
      name: 'getIsItemSelectable',
      type: '(item: T) => boolean',
      description:
        'Should this row show a checkbox? Non-selectable rows are excluded from select-all.',
      default: '() => true',
    },
    {
      name: 'getIsItemEnabled',
      type: '(item: T) => boolean',
      description:
        'Is this row checkbox interactive? Disabled rows are frozen: select-all preserves their state.',
      default: '() => true',
    },
  ],
}
```
