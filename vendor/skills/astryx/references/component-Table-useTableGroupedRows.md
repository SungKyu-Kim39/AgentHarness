# Astryx component reference: Table/useTableGroupedRows.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Table/useTableGroupedRows.doc.mjs. Original SHA-256: 0223625618f0c6fbf5347ee6ad78ece53bbe92f6957657b565caa6e78f016e8e.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useTableGroupedRows',
  subComponentOf: 'Table',
  displayName: 'useTableGroupedRows',
  description:
    'Hook that groups a flat data array into collapsible section rows. Each distinct groupBy value becomes a full-width section-header row with a chevron toggle, the group label, and a member count; collapsing hides that group\'s data rows while keeping the header visible. The disclosure state lives on the chevron button, not the native table row. Mirrors useTableTreeState: the consumer owns the collapsedGroups set and the hook returns {data, plugin, idKey}: pass them to Table as data, plugins, and idKey respectively. Grouping runs on the rows you hand it, so with pagination the order is filter, sort, slice, then group: sort by the group key first and the user\'s keys second, so a section\'s rows stay contiguous and each page appends to the bottom of the table instead of splicing rows in above the reader. A page that ends on a row count still cuts mid-section, and the heading then counts what has loaded rather than what exists: "6" quietly becoming "10". Where the full result set is in hand, carry the cut forward to the end of the section it lands in: every rendered section is then whole and its count is a total.',
  props: [
    {
      name: 'data',
      type: 'T[]',
      description: 'The flat data to group.',
      required: true,
    },
    {
      name: 'groupBy',
      type: '(item: T) => string',
      description:
        'Derive the group key for a row. Rows with the same key share a section.',
      required: true,
    },
    {
      name: 'collapsedGroups',
      type: 'Set<string>',
      description: 'Set of currently-collapsed group keys.',
      required: true,
    },
    {
      name: 'onToggleGroup',
      type: '(groupKey: string) => void',
      description: 'Called with a group key when its header is toggled.',
      required: true,
    },
    {
      name: 'renderGroupHeader',
      type: '(groupKey: string, count: number, collapsed: boolean) => ReactNode',
      description:
        "Custom renderer for a group header's content (right of the chevron). Defaults to `<groupKey> (<count>)`.",
    },
    {
      name: 'getRowKey',
      type: '(item: T) => string',
      description:
        'Stable key for a real row. Falls back to a positional key when omitted.',
    },
    {
      name: 'groupOrder',
      type: 'string[]',
      description:
        'Explicit group ordering; groups not listed keep first-seen order after these.',
    },
  ],
}
```
