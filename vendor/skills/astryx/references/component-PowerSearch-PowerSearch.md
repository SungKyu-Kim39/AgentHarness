# Astryx component reference: PowerSearch/PowerSearch.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/PowerSearch/PowerSearch.doc.mjs. Original SHA-256: 9ce737a2c845e4f98ec14ad0b586cef9b9cfd8c9cb19b747d77a32476e7d33ad.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'PowerSearch',
  displayName: 'Power Search',
  category: 'Form Controls',
  keywords: [
    'powersearch',
    'search',
    'searchbar',
    'filter',
    'filterbar',
    'faceted',
    'querybuilder',
    'structured',
    'omnibar',
  ],
  props: [
    {
      name: 'config',
      type: 'PowerSearchConfig',
      description:
        'Configuration defining available fields, operators, and their value types.',
      required: true,
    },
    {
      name: 'filters',
      type: 'ReadonlyArray<PowerSearchFilter>',
      description: 'Currently active filters.',
      required: true,
    },
    {
      name: 'onChange',
      type: "(filters: ReadonlyArray<PowerSearchFilter>, changeType: 'add' | 'edit' | 'remove', index: number) => void",
      description:
        "Called when filters change. changeType is 'add', 'edit', or 'remove'. index is the affected filter's position.",
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the search input.',
      default: "'Search'",
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Visually hides the label while keeping it accessible.',
      default: 'true',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Placeholder text shown when no filters are selected.',
      default: "'Search...'",
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Auto-focus the input on mount.',
      default: 'false',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description:
        'Show a clear-all button that removes every editable filter. Read-only filters stay.',
      default: 'true',
    },
    {
      name: 'isReadOnly',
      type: 'boolean',
      description: 'Prevent adding, editing, or removing filters.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Disables the entire component.',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the search is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the input focusable via aria-disabled (input stays blocked). Use this instead of wrapping a disabled PowerSearch in Tooltip. Disabled controls swallow the hover events an external Tooltip needs.',
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description: 'Validation status object with type and optional message.',
    },
    {
      name: 'startIcon',
      type: 'ReactNode | IconType',
      description:
        'Icon to display at the start of the input, before any filter tokens. Forwarded to the internal Tokenizer. Accepts a semantic icon name, an SVG icon component, or a ReactNode directly.',
      slotElements: [{__element: 'Icon', props: {icon: 'search', size: 'sm'}}],
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached'",
      description:
        'How the status message is placed relative to the input. attached overlaps directly below the input (bordered treatment); detached floats below as a separate element with spacing.',
      default: "'attached'",
    },
    {
      name: 'maxTokenLength',
      type: 'number',
      description: 'Max character length for filter value display in tokens.',
      default: '40',
    },
    {
      name: 'maxOperatorMenuItems',
      type: 'number',
      description:
        'Maximum suggestions shown in string and entity value typeaheads. Does not affect the main field search menu or enum value menus.',
      default: '10',
    },
    {
      name: 'maxSearchResults',
      type: 'number',
      description:
        'Max ranked results for a non-empty query. Does not affect a field value editor. Browsing with an empty query shows up to 1,000 fields.',
      default: '10',
    },
    {
      name: 'menuWidth',
      type: 'number',
      description:
        'Width in pixels for the main field/search menu. Does not affect field value editors.',
    },
    {
      name: 'popoverSaveButtonLabel',
      type: 'string',
      description: 'Label for the save button in the edit popover.',
      default: "'Apply'",
    },
    {
      name: 'timezoneID',
      type: 'string',
      description:
        'IANA zone a date-only date_absolute value, and each absolute part of a date_range, is read and written in: the day shows, edits and stores (as that midnight) in it; unset, a day is its UTC day. A date_absolute with isDateOnly: false shows and edits its date and time in it; unset, in the viewer\'s zone. E.g. "America/New_York". Date values are written in the InternationalizationProvider calendar, such as calendar="persian"; filter values stay Unix seconds.',
    },
    {
      name: 'handleRef',
      type: 'Ref<PowerSearchHandle>',
      description:
        'Imperative handle with focusTypeahead() and blurTypeahead() methods.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Content to display at the end of the input row. Useful for action buttons or other controls.',
      slotElements: [
        {__element: 'Icon', props: {icon: 'chevronDown', size: 'sm'}},
        {__element: 'Badge', props: {label: '3'}},
      ],
    },
    {
      name: 'resultCount',
      type: 'number | string',
      description:
        'Number of results matching the current filters. When a number, formatted as "N results". When a string, displayed as-is. Changes are announced to screen readers via a polite live region.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size of the search input and tokens.',
      default: "'md'",
    },
    {
      name: 'menuWidth',
      type: 'number',
      description:
        'Maximum width for the operator/value dropdown menu in pixels.',
    },
    {
      name: 'maxOperatorMenuItems',
      type: 'number',
      description:
        'Maximum number of items displayed in the operator dropdown.',
    },
    {
      name: 'tokenOverflowBehavior',
      type: "'none' | 'unfocusedInline' | 'unfocusedLayer'",
      description:
        'Controls how tokens overflow when the container is too narrow. Forwarded to Tokenizer.',
      default: "'none'",
    },
    {
      name: 'onFocus',
      type: '(e: React.FocusEvent) => void',
      description: 'Fires when focus enters the search input.',
    },
    {
      name: 'onBlur',
      type: '(e: React.FocusEvent) => void',
      description: 'Fires when focus leaves the search input.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization. Must be a stylex.create() value.',
    },
    {
      name: 'presentation',
      type: "'popover' | 'bottom-sheet' | 'adaptive'",
      description:
        'How the field presents filter editing. adaptive (the default) uses the bottom sheet on compact touch screens and the popover otherwise, resolved the same way Selector resolves it; the server render and the hydrating render are the popover. popover is the tokenizer field with its typeahead and the editor popover on every device. bottom-sheet makes the whole field, on every device, one trigger showing display-only filter tokens: it opens a Filters sheet listing the filters as rows that edit or remove a filter, with Add filter, Done, and Clear all (which asks first and keeps read-only filters); an Add filter sheet with the fields (or the content search with inline suggestions) opens above it, and a value step that stages operator → value and confirms from its footer opens above that. Dismissing a step reveals the one beneath. The flow edits a draft: adding, editing and removing filters and Clear all change the draft, and onChange is called when Done applies it, once per edit in order; dismissing the flow with a changed draft asks before discarding it. List values edit through the Tokenizer\'s own sheet. In the sheet presentation menuWidth and tokenOverflowBehavior have no surface to act on and warn in development. Pass presentation="popover" to keep the tokenizer field and the editor popover on every device.',
      default: "'adaptive'",
    },
  ],
  examples: [
    {
      label: 'Keep the popover on every device',
      code: `const [filters, setFilters] = useState([]);
<PowerSearch
  config={config}
  filters={filters}
  onChange={next => setFilters(next)}
  presentation="popover"
/>`,
    },
  ],
  // `config` and `filters` are custom values the docsite preview cannot
  // generate automatically. Keep this small, but include an initial token so
  // the Properties tab demonstrates a realistic controlled PowerSearch.
  playground: {
    defaults: {
      config: {
        name: 'IssueSearch',
        fields: [
          {
            key: 'status',
            label: 'Status',
            defaultOperator: 'is',
            operators: [
              {
                key: 'is',
                label: 'is',
                value: {
                  type: 'enum',
                  values: [
                    {value: 'open', label: 'Open'},
                    {value: 'closed', label: 'Closed'},
                  ],
                },
              },
            ],
          },
          {
            key: 'title',
            label: 'Title',
            defaultOperator: 'contains',
            operators: [
              {key: 'contains', label: 'contains', value: {type: 'string'}},
            ],
          },
        ],
      },
      filters: [
        {
          field: 'status',
          operator: 'is',
          value: {type: 'enum', value: 'open'},
        },
      ],
    },
  },
  usage: {
    description:
      'PowerSearch is a structured filter bar where each token represents a field, operator, and value. Use it for complex multi-dimensional filtering when users need to combine multiple search criteria. For simple single-field search, use a text input instead. Host `data-*` attributes, `data-testid` included, reach the primary control: the combobox input in the popover presentation and the trigger button in the sheet presentation. The `components.Token` and `components.Editor` defaults, `PowerSearchToken` and `PowerSearchFilterEditor`, pass them to the token and the editor root.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Define clear, descriptive field names and aliases so users can quickly find the filter they need.',
      },
      {
        guidance: true,
        description:
          'Provide a result count to give users feedback on how their filters affect the data set.',
      },
      {
        guidance: false,
        description:
          'Use PowerSearch for simple keyword searches; a standard text input is more appropriate for single-field lookups.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled PowerSearch in Tooltip to explain why it is disabled; disabled controls swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
      },
    ],
  },
  theming: {
    targets: [{className: 'astryx-power-search'}],
    vars: [
      {
        name: '--_power-search-sheet-hit-inset',
        description:
          "Outset of the invisible hit area of the touch sheet's icon-sized actions (the Filters header's Add filter and each row's remove button), applied to a ::after overlay. 0 on a fine pointer; negative on a coarse one, which grows the action to a 44px touch target without changing what is drawn.",
        default: '0px',
        private: true,
      },
      {
        name: '--_power-search-sheet-hit-content',
        description:
          'Whether the touch sheet\'s invisible hit overlay exists. `none` on a fine pointer, so no ::after is generated and hover still reaches the action; `""` on a coarse one, where the overlay provides the 44px touch target.',
        default: 'none',
        private: true,
      },
    ],
  },
}
```
