# Astryx component reference: Table/useTableColumnSettings.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Table/useTableColumnSettings.doc.mjs. Original SHA-256: fec9b049d338f2851954866c67ae521edc746fa53bde3fb9881c07e76ceb18ac.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useTableColumnSettings',
  subComponentOf: 'Table',
  displayName: 'useTableColumnSettings',
  description: 'Headless column visibility and ordering management for Table. Provides filtered columns, toggle helpers, and pre-built MultiSelector options for a column picker UI.',
  props: [
    {
      name: 'columns',
      type: 'ColumnSettingsOption[]',
      description: 'All available columns with metadata for the settings UI. Each entry has key, label, optional isAlwaysVisible and group.',
      required: true,
    },
    {
      name: 'activeColumnKeys',
      type: 'string[]',
      description: 'Currently active column keys, in display order. Only columns with keys in this array are shown.',
      required: true,
    },
    {
      name: 'onChangeActiveColumnKeys',
      type: '(keys: string[]) => void',
      description: 'Called when active columns change (toggle, reorder).',
      required: true,
    },
    {
      name: 'defaultColumnKeys',
      type: 'string[]',
      description: 'Default column set for "Reset to default". When omitted, reset shows all columns.',
    },
  ],
}
```
