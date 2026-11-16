# Astryx component reference: Typeahead/Typeahead.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Typeahead/Typeahead.doc.mjs. Original SHA-256: 99aa85f0a64323d0289a330bf6fc8fd27ac4c570e5875ca36e8d8ecefe00ef7c.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Typeahead',
  displayName: 'Typeahead',
  group: 'Typeahead',
  category: 'Form Controls',
  keywords: [
    'typeahead',
    'autocomplete',
    'combobox',
    'searchbox',
    'autosuggest',
    'select',
    'dropdown',
    'lookup',
    'searchable',
    'suggestion',
    'picker',
  ],
  description:
    'Styled typeahead with label, description, validation, and all field features. Wraps BaseTypeahead with Field for the primary use case.',
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the input.',
      required: true,
    },
    {
      name: 'searchSource',
      type: 'SearchSource<T>',
      description:
        'Data source providing search and bootstrap methods. `search(query, context)` may call `context.update(items)` to show matches it already has before it returns; the value it returns is the final list, and every list after the first for a query keeps the shown rows first and adds new rows after them.',
      required: true,
    },
    {
      name: 'value',
      type: 'T | null',
      description: 'Currently selected item, or null if nothing is selected.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(item: T | null) => void',
      description: 'Called when the selection changes.',
      required: true,
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Input placeholder text.',
    },
    {
      name: 'hasEntriesOnFocus',
      type: 'boolean',
      description: 'Show bootstrap results on focus before typing.',
      default: 'false',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: 'Show clear button to deselect the current value.',
      default: 'true',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Disables the input. The field keeps its tab stop: it is announced as disabled (aria-disabled), is read-only, and opens and picks nothing.',
      default: 'false',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the input is disabled. With isDisabled, shows a tooltip on hover/keyboard focus, and the reason describes the field (activation stays blocked). Use this instead of wrapping a disabled Typeahead in Tooltip, so the reason is attached to the field itself.',
    },
    {
      name: 'maxMenuItems',
      type: 'number',
      description: 'Maximum number of dropdown items to display.',
      default: '10',
    },
    {
      name: 'minQueryLength',
      type: 'number',
      description:
        'Minimum query length before the search source is queried. Below it no search runs and the menu stays closed.',
      default: '1',
    },
    {
      name: 'status',
      type: "{type: 'warning' | 'error' | 'success', message?: string}",
      description:
        'Validation status object with type and message for error/warning/success states.',
    },
    {
      name: 'statusVariant',
      type: "'attached' | 'detached' | 'tooltip'",
      description:
        'How the status message is placed relative to the input. attached overlaps directly below the input (bordered treatment); detached floats below as a separate element with spacing; tooltip reveals the message in an info-tip button.',
      default: "'attached'",
    },
    {
      name: 'renderItem',
      type: '(item: T) => ReactNode',
      description:
        'Custom render function for dropdown items. Default renders TypeaheadItem.',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Visually hides the label while keeping it accessible.',
      default: 'false',
    },
    {
      name: 'description',
      type: 'string',
      description: 'Helper text displayed below the label.',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description: 'Marks the field as required.',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description: 'Shows an optional indicator on the label.',
      default: 'false',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description: 'Tooltip text shown on the label.',
    },
    {
      name: 'emptySearchText',
      type: 'ReactNode',
      description:
        'Content shown when the query matched nothing. Takes a ReactNode, so the dead end can carry a link or a create row. Announced in a polite live region as the text it renders, read from the DOM; aria-hidden parts stay out of both, and content that renders no text announces nothing. null counts as not given, like undefined, and falls through to the default; pass an empty string to render nothing.',
      default: "'No results found'",
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Auto-focus the input on mount.',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Input and token size.',
      default: "'md'",
    },
    {
      name: 'debounceMs',
      type: 'number',
      description:
        'Debounce delay in ms before triggering search. Set to 0 for synchronous sources, and for a source that shows local matches through `context.update` and delays its own server request.',
      default: '150',
    },
    {
      name: 'onChangeQuery',
      type: '(query: string) => void',
      description: 'Callback fired when the search query text changes.',
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description: 'Callback when the dropdown opens or closes.',
    },
    {
      name: 'menu',
      type: 'BaseTypeaheadMenu',
      description:
        "What the menu shows. role 'listbox' (default) is the result list; its optional render({listbox, query, isBusy, isEmptySearch, close}) places information such as a header or a hint around it, and anything a person acts on stays a result so the arrow keys reach it. role 'dialog' shows render({query, close}) in a dialog named by label that takes focus; Escape, an outside press or close() returns focus to where it was when the menu opened. Astryx owns the layer either way. Switching from listbox to dialog keeps the menu open: call handleRef.open() from onChange.",
    },
    {
      name: 'handleRef',
      type: 'React.Ref<BaseTypeaheadHandle>',
      description:
        'Imperative handle: open() opens the menu (a dialog at once; a listbox shows or loads its results) and close() closes it. There is no controlled open state; onOpenChange reports changes.',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        'Width of the field (number = pixels, string used as-is, e.g. "100%"). Sizes the whole field (label, control, and status) so they stay aligned.',
    },
    {
      name: 'startIcon',
      type: 'IconType | ReactNode',
      description: 'SVG icon component displayed at the start of the input.',
    },
    {
      name: 'containerXstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for the field container (label, control, and status together). No effect inside InputGroup (style the InputGroup instead) or in a `horizontal-labels` FormLayout. Root `xstyle`, `className`, and `style` are not accepted.',
    },
    {
      name: 'containerClassName',
      type: 'string',
      description:
        'Class name for the field container. Same targeting as `containerXstyle`.',
    },
    {
      name: 'containerStyle',
      type: 'CSSProperties',
      description:
        'Inline styles for the field container. Same targeting as `containerXstyle`.',
    },
    {
      name: 'controlXstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for the visual control box: the element that paints the border and background and holds icons and end controls. Never the native input.',
    },
    {
      name: 'controlClassName',
      type: 'string',
      description: 'Class name for the visual control box.',
    },
    {
      name: 'controlStyle',
      type: 'CSSProperties',
      description: 'Inline styles for the visual control box.',
    },
  ],
  components: [{name: 'BaseTypeahead'}, {name: 'TypeaheadItem'}],
  theming: {
    targets: [
      {className: 'astryx-typeahead', visualProps: ['status', 'size']},
      {className: 'astryx-typeahead-dropdown'},
      {className: 'astryx-typeahead-empty-state'},
      {className: 'astryx-typeahead-item'},
    ],
  },
  usage: {
    anatomy,
    description:
      'A searchable input for selecting a single item from a large or dynamic dataset. Results appear as the user types, with support for async data sources, debounced search, and custom item rendering. Use it when the option list is too large for a Selector dropdown.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Provide descriptive placeholder text that hints at what users can search for.',
      },
      {
        guidance: true,
        description:
          'Show suggestions on focus when users benefit from seeing popular or recent options before typing.',
      },
      {
        guidance: true,
        description:
          'Add a search delay for remote data sources to avoid excessive network requests.',
      },
      {
        guidance: true,
        description:
          'For a remote source, show the matches the page already has at once: call `context.update(local)` in `search`, pass `debounceMs={0}`, delay the server request in the source, and return the server answer with the shown rows first.',
      },
      {
        guidance: true,
        description:
          'Use inside InputGroup when the typeahead needs a single-line prefix or suffix addon.',
      },
      {
        guidance: false,
        description:
          'Use for short, static option lists; use Selector for better discoverability.',
      },
      {
        guidance: false,
        description: 'Use for multi-selection; use Tokenizer instead.',
      },
      {
        guidance: false,
        description:
          'Place multiple Typeaheads adjacent to each other without clear labels differentiating them.',
      },
      {
        guidance: false,
        description:
          'Wrap a disabled Typeahead in Tooltip to explain why it is disabled; disabled triggers swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
      },
    ],
  },
}
```
