# Astryx component reference: Table/Table.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Table/Table.doc.mjs. Original SHA-256: 6605d591545bb8c7caf319ece7618186966b2ca90fb97d2ec99760dd722b2db4.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Table',
  displayName: 'Table',
  group: 'Table',
  category: 'Table & List',
  keywords: [
    'table',
    'datatable',
    'datagrid',
    'spreadsheet',
    'sorting',
    'virtualized',
    'columns',
    'rows',
    'selection',
    'pinning',
  ],
  playground: {
    defaults: {
      data: [
        {name: 'Alice Chen', role: 'Engineer', status: 'Active'},
        {name: 'Bob Smith', role: 'Designer', status: 'Active'},
        {name: 'Carol Wu', role: 'PM', status: 'Away'},
      ],
      columns: [
        {key: 'name', header: 'Name'},
        {key: 'role', header: 'Role'},
        {key: 'status', header: 'Status'},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'astryx-table'},
      {className: 'astryx-table-scroll-wrapper'},
      {className: 'astryx-table-header'},
      {className: 'astryx-table-body'},
      {className: 'astryx-table-footer'},
      {className: 'astryx-table-row'},
      {className: 'astryx-table-cell', visualProps: ['density']},
      {className: 'astryx-table-header-cell', visualProps: ['density']},
    ],
    componentIcons: [
      {
        slot: 'table-sort-indicator',
        description:
          "The sort direction glyph beside a sortable column's label (`useTableSortable`).",
        fallback:
          '`arrowUp` ascending; `arrowDown` descending; `arrowsUpDown` unsorted',
        state: [
          {
            name: 'direction',
            type: "'ascending' | 'descending' | 'none'",
            description:
              "The column's sort direction; `none` while the column is not sorted.",
          },
        ],
        whenNull:
          'Hides the glyph. The Sort control keeps its label and its click and keyboard sorting; the column header keeps `aria-sort`.',
      },
      {
        slot: 'table-row-expand',
        description:
          "The glyph in a row's expansion toggle (`useTableRowExpansion`). The toggle turns the glyph a quarter turn while the row is expanded and mirrors it in right-to-left layouts, so map a glyph that points toward the inline end.",
        fallback: '`chevronRight`, turned while expanded',
        state: [
          {
            name: 'expanded',
            type: 'boolean',
            description: "True while the row's detail panel is open.",
          },
        ],
        whenNull:
          'Hides the glyph. The toggle keeps its size, its "Expand row" or "Collapse row" name, `aria-expanded`, and its click and keyboard toggling.',
      },
    ],
  },
  description:
    'Styled, data-driven table with density, dividers, hover highlight, striped rows, and named plugin support. T must extend Record<string, unknown>.',
  props: [
    {
      name: 'data',
      type: 'T[]',
      description:
        'Array of data items to render as rows. T must extend Record<string, unknown> (use `interface MyRow extends Record<string, unknown>` for custom types).',
    },
    {
      name: 'columns',
      type: 'TableColumn<T>[]',
      description:
        'Column definitions: each column has {key, header, width?, align?, renderCell?}. The `header` field sets the column heading text. If omitted, columns are auto-generated from data object keys. The `width` field is typed as `ColumnWidth` (not a number); use `proportional(n)` or `pixel(n)` helpers imported from `@astryxdesign/core/Table`. Omitting `width` keeps an equal flexible share with a compact 60px readability floor. To give one column a different floor, set `width: proportional(1, {minWidth: 80})`; its `minWidth` replaces the 60px floor for that column. Example: `width: pixel(120)` for 120px fixed, `width: proportional(1)` for a flexible column with a 120px default minimum.',
    },
    {
      name: 'idKey',
      type: '(keyof T & string) | ((item: T) => string | number)',
      description:
        'Canonical row identity: a property name projects valid strings and finite numbers to strings; a function retains string/number type. Optional legacy tables fall back to index. Virtualization requires explicit unique valid keys.',
    },
    {
      name: 'density',
      type: "'compact' | 'balanced' | 'spacious'",
      description: 'Row density controlling cell padding and font size.',
      default: "'balanced'",
    },
    {
      name: 'dividers',
      type: "'rows' | 'columns' | 'grid' | 'none'",
      description: 'Divider style rendered between cells.',
      default: "'rows'",
    },
    {
      name: 'isStriped',
      type: 'boolean',
      description: 'Applies a background wash to even-numbered rows.',
      default: 'false',
    },
    {
      name: 'hasHover',
      type: 'boolean',
      description:
        'Applies a hover highlight background to rows on pointer devices.',
      default: 'false',
    },
    {
      name: 'verticalAlign',
      type: "'middle' | 'top' | 'bottom'",
      description:
        'Vertical alignment for body row cells. Controls `vertical-align` on the `<td>` elements.',
      default: "'middle'",
    },
    {
      name: 'textOverflow',
      type: "'wrap' | 'truncate'",
      description:
        "How body cell text behaves when it exceeds the column width. 'wrap' lets text wrap and the row grow taller; 'truncate' clips with an ellipsis (default-rendered cells show a tooltip on hover when truncated). Header cells always truncate.",
      default: "'wrap'",
    },
    {
      name: 'virtualization',
      type: 'TableVirtualizationCapability | TableVirtualizationCapability[]',
      description:
        "Geometry-only capability from useTableRowsVirtualization or useTableColumnsVirtualization, or a list with at most one of each; any other list renders without windowing. useTableColumnsVirtualization({initialViewportWidth}) mounts only the unpinned columns near the viewport. useTableRowsVirtualization({rowHeight, initialViewportHeight}) takes sizes that are both positive finite CSS pixels; the Table scrolls inside the height its parent gives it, and initialViewportHeight only sizes the first window. Give the Table's parent a height, fixed or relative, or a flex child, so windowing can bound the rows; with no height every row renders. Pass complete flat data and an explicit idKey. Default text truncates; custom renderers, wrapping, structural plugins, incompatible offsets, invalid identity or unrepresentable geometry use full rendering. Logical row positions include the header.",
    },
    {
      name: 'plugins',
      type: 'Record<string, TablePlugin<T>>',
      description:
        'Named plugins that extend table behavior via the transform pipeline. Converted to an ordered array internally.',
    },
    {
      name: 'rowIndexStart',
      type: 'number',
      description:
        'ARIA row index (1-based) for the first rendered body row. The row ordinal is an accessibility concern independent of any visible index column, so setting this (or rowCount) makes the table emit aria-rowindex on body rows and aria-rowcount on the table. For a paginated/windowed view, pass the offset of the first visible row (e.g. (page - 1) * pageSize + 1) so aria-rowindex reflects position in the full dataset. Data-driven mode only.',
      default: '1',
    },
    {
      name: 'rowCount',
      type: 'number',
      description:
        'Total number of body rows across all pages/windows, used for aria-rowcount so assistive tech can announce "row X of Y" against the full dataset. When omitted but rowIndexStart is set (windowed view with an unknown total), aria-rowcount is set to -1 per the ARIA unknown-count convention. Data-driven mode only.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Children mode: compose the table yourself from TableHeader / TableBody / TableFooter, each holding TableRow and TableCell, instead of using data-driven rendering. The children are passed straight to the <table>, so the section is yours to supply. A TableRow placed directly in Table emits <table><tr>, which is invalid HTML and mismatches on hydration (the parser inserts an implied <tbody> for server-rendered markup; React does not on the client). Data-driven mode renders the sections for you.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
  ],
  components: [
    {name: 'TableHeader'},
    {name: 'TableBody'},
    {name: 'TableFooter'},
    {name: 'TableRow'},
    {name: 'TableCell'},
    {name: 'TableHeaderCell'},
    {name: 'useTableSelection'},
    {name: 'useTableSelectionState'},
    {name: 'TableSelectionToolbar'},
    {name: 'useTableSortable'},
    {name: 'useTableTreeData'},
    {name: 'useTableTreeState'},
    {name: 'useTablePagination'},
    {name: 'useTableColumnSettings'},
    {name: 'useTableFiltering'},
    {name: 'useTableFilterState'},
  ],
  usage: {
    description:
      'Table displays structured data in rows and columns with consistent dimensionality. It supports rich cell content, sorting, selection, pagination, and column management through a composable plugin system. Use Table for data sets with uniform structure; for simpler or inconsistent data, consider a list or card layout instead.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use density and divider variants to match the information density and scanning needs of your data.',
      },
      {
        guidance: true,
        description:
          'Compose rich cell content with Astryx components like Badge, StatusDot, and Avatar via renderCell.',
      },
      {
        guidance: true,
        description:
          'In children mode, put every row inside TableHeader, TableBody, or TableFooter. <table> cannot contain a <tr> directly: the HTML parser inserts an implied <tbody> for server-rendered markup and React does not on the client, so unwrapped rows mismatch on hydration.',
      },
      {
        guidance: true,
        description:
          'Omit width for equal flexible columns with a compact 60px readability floor. Give one column its own floor with proportional(1, {minWidth}), weight columns with proportional(n), and fix widths with pixel(); the Table scroll region activates when the combined floors no longer fit.',
      },
      {
        guidance: true,
        description:
          'Use the data-driven API from React Server Components: proportional(), pixel(), and column definitions without function props are server-safe. Columns using renderCell (or any function prop) need the table wrapped in a "use client" component, since functions cannot cross the server-client boundary.',
      },
      {
        guidance: false,
        description:
          'Use a table for data without consistent columns. Use a list or card layout for heterogeneous content.',
      },
      {
        guidance: false,
        description:
          'Enable every plugin at once. Add only the features your use case requires to keep the interface focused.',
      },
      {
        guidance: false,
        description:
          'Rely on the 60px omitted-width floor when a text-heavy column needs more room; set proportional(1, {minWidth}) on that column instead.',
      },
    ],
    anatomy,
  },
}
```
