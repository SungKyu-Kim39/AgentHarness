# Astryx component reference: Table/useTableSelection.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Table/useTableSelection.doc.mjs. Original SHA-256: a9e187b30b920cd39c300767276607550b724fec59a62b87547db7b54489187c.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useTableSelection',
  subComponentOf: 'Table',
  displayName: 'useTableSelection',
  description:
    'Hook that returns a TablePlugin implementing row selection with checkboxes, select-all, and aria-selected. Uses React Context for independent checkbox re-renders.',
  props: [
    {
      name: 'getIsItemSelected',
      type: '(item: T) => boolean',
      description: 'Returns whether the given item is currently selected.',
      required: true,
    },
    {
      name: 'onSelectItem',
      type: '(event: {item: T; isSelected: boolean}) => void',
      description:
        'Called when a row checkbox is toggled. isSelected is the new desired state.',
      required: true,
    },
    {
      name: 'onSelectAll',
      type: '(event: {isAllSelected: boolean}) => void',
      description: 'Called when the select-all header checkbox is toggled.',
      required: true,
    },
    {
      name: 'getIsAllSelected',
      type: '() => boolean',
      description:
        'Returns whether all selectable items are currently selected.',
      required: true,
    },
    {
      name: 'getIsIndeterminate',
      type: '() => boolean',
      description:
        'Returns whether selection is partial (some but not all). Renders the select-all checkbox in indeterminate state.',
    },
    {
      name: 'getIsItemSelectable',
      type: '(item: T) => boolean',
      description:
        'Returns whether a row should show a checkbox. Non-selectable rows render nothing in the selection cell.',
      default: '() => true',
    },
    {
      name: 'getIsItemEnabled',
      type: '(item: T) => boolean',
      description:
        'Returns whether a row checkbox is interactive. Disabled rows show a disabled checkbox.',
      default: '() => true',
    },
    {
      name: 'getRowLabel',
      type: '(item: T) => string',
      description:
        'Derives a human-readable identity for a row; the row checkbox\'s hidden label becomes `Select ${getRowLabel(item)}` so screen readers announce which row each checkbox selects. Falls back to "Select row" when omitted.',
    },
    {
      name: 'hasRowHighlight',
      type: 'boolean',
      description:
        'Paints checked rows with the accent wash. Set false when the surrounding UI already uses row background to mean something else (a row open in a detail panel, say). The wash is an inline style, so it cannot be overridden from userland. Only the background is dropped: aria-selected is still set on checked rows either way.',
      default: 'true',
    },
  ],
  examples: [
    {
      label: 'Accessible per-row checkbox names',
      code: `
const selectionPlugin = useTableSelection({
  getIsItemSelected: item => selectedIds.has(item.id),
  onSelectItem: ({item, isSelected}) => toggle(item.id, isSelected),
  onSelectAll: ({isAllSelected}) => selectAll(isAllSelected),
  getIsAllSelected: () => selectedIds.size === users.length,
  // Screen readers announce "Select Alice", "Select Bob", ...
  // instead of an undifferentiated "Select row" for every checkbox.
  getRowLabel: item => item.name,
});

<Table
  data={users}
  columns={columns}
  idKey="id"
  plugins={{selection: selectionPlugin}}
/>;
`,
    },
    {
      label: 'Opt out of the checked-row wash',
      code: `
// This table already uses row background to mean "open in the detail
// panel". Turning the selection wash off keeps that meaning unambiguous;
// the checkbox and aria-selected still carry the selection.
const selectionPlugin = useTableSelection({
  getIsItemSelected: item => selectedIds.has(item.id),
  onSelectItem: ({item, isSelected}) => toggle(item.id, isSelected),
  onSelectAll: ({isAllSelected}) => selectAll(isAllSelected),
  getIsAllSelected: () => selectedIds.size === users.length,
  hasRowHighlight: false,
});
`,
    },
  ],
}
```
