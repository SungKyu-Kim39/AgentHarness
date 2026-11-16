# Astryx component reference: Table/useTableRowExpansion.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Table/useTableRowExpansion.doc.mjs. Original SHA-256: ec4314683b4f36edf4af0410993534110623669344c2577334ec46ea376b2ee0.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useTableRowExpansion',
  subComponentOf: 'Table',
  displayName: 'useTableRowExpansion',
  description:
    'Hook that returns a TablePlugin which expands a full-width detail panel below a row, rendered by the consumer via renderExpanded(item). Adds a leading chevron column and a right-click "Expand/Collapse row" action; the consumer owns the expandedKeys set. The panel spans the row but starts its content at the first column, past the chevron, so detail lines up with the labels above it; the inset follows the table density. Use it for master-detail rows (order details, forms, charts, nested tables). For hierarchical data where child rows reuse the parent columns, use useTableTreeData + useTableTreeState instead.',
  props: [
    {
      name: 'expandedKeys',
      type: 'Set<string>',
      description: 'Set of currently-expanded row keys. Consumer-owned.',
      required: true,
    },
    {
      name: 'onToggle',
      type: '(key: string) => void',
      description:
        'Called with a row key when its expansion is toggled (chevron click or context-menu action).',
      required: true,
    },
    {
      name: 'getRowKey',
      type: '(item: T) => string',
      description: 'Derive a stable unique key from a row item.',
      required: true,
    },
    {
      name: 'getRowLabel',
      type: '(item: T) => string',
      description:
        'Derive a human-readable row identity for the chevron accessible name. Astryx combines it with localized expand/collapse wording. Omit it, or return blank text, to keep the generic "Expand row" and "Collapse row" labels.',
    },
    {
      name: 'renderExpanded',
      type: '(item: T) => ReactNode',
      description:
        'Render the detail content shown in a full-width panel below the row when it is expanded. Receives the row item.',
      required: true,
    },
    {
      name: 'getIsItemExpandable',
      type: '(item: T) => boolean',
      description:
        'Control which rows are expandable. Non-expandable rows show no chevron, no context-menu action, and never render a panel. Defaults to all rows expandable.',
    },
    {
      name: 'panelVariant',
      type: "'muted' | 'transparent'",
      description:
        "Background behind the detail panel. 'transparent' (default) paints nothing: the panel is the row's continuation and takes whatever surface the table sits on, so a Card shows through and a striped table's zebra reads on unchanged. 'muted' washes it, marking it as commentary rather than another row of data — reach for it in a bare table with no card, dividers or striping, where nothing else makes that distinction. The wash is a low-alpha near-black, so it is close to invisible over a dark card: 'muted' is largely a light-theme effect.",
      default: "'transparent'",
    },
    {
      name: 'hasRowClickExpansion',
      type: 'boolean',
      description:
        'Toggle a row by clicking anywhere on it, not only on its chevron. A pointer-only convenience layered over the chevron, which stays the accessible control for keyboard and assistive tech. Clicks on interactive cell content (buttons, links, form controls) or on a text selection do not toggle, and non-expandable rows stay inert.',
      default: 'false',
    },
    {
      name: 'animatedLayout',
      type: 'AnimatedLayout',
      description:
        "A handle from useAnimatedLayout. With it, opening or closing a panel glides the rows after it (and the content after the table) to their new places instead of jumping, the opening panel plays in on the same motion, and each row's divider moves with it. Under Reduce Motion the rows fade in place on a touch screen and change at once with a mouse; in a table with column lines (dividers columns or grid, which do not move yet) they change at once. Without it, rows jump.",
    },
  ],
  examples: [
    {
      label: 'Master-detail order rows',
      code: `const [expandedKeys, setExpandedKeys] = useState(new Set());
const expansion = useTableRowExpansion({
  expandedKeys,
  onToggle: key =>
    setExpandedKeys(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    }),
  getRowKey: item => item.id,
  getRowLabel: item => item.name,
  renderExpanded: item => <OrderDetails order={item} />,
});

<Table data={orders} columns={columns} idKey="id" plugins={{expansion}} />;`,
    },
    {
      label: 'Migrating from tree rows to the tree plugin',
      code: `// useTableRowExpansion is now for DETAIL PANELS, not tree rows. If you used
// it to render nested child rows that reuse the parent columns, move to
// useTableTreeData + useTableTreeState.

// BEFORE (tree rows via useTableRowExpansion + useTableRowExpansionState):
const {data, expansionConfig} = useTableRowExpansionState({
  baseData: tree,
  getChildren: item => item.children ?? [],
  getRowKey: item => item.id,
  expandedKeys,
  setExpandedKeys,
});
const expansion = useTableRowExpansion(expansionConfig);
<Table data={data} columns={columns} idKey="id" plugins={{expansion}} />;

// AFTER (tree rows via the tree plugin):
const {visibleData, treeConfig} = useTableTreeState({
  data: tree,                   // nested data
  idKey: 'id',                  // or a function: idKey={item => item.id}
  childrenKey: 'children',      // replaces getChildren
  defaultExpandedIds: ['root'], // or controlled: expandedIds + onExpandedIdsChange
});
const tree = useTableTreeData({
  ...treeConfig,
  hasExpandAllControl: true,    // was isAllExpanded + onToggleExpandAll
  hasRowClickExpansion: true,   // same prop name
});
<Table data={visibleData} columns={columns} idKey="id" plugins={{tree}} />;`,
    },
  ],
}
```
