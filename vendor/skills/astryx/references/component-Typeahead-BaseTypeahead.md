# Astryx component reference: Typeahead/BaseTypeahead.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Typeahead/BaseTypeahead.doc.mjs. Original SHA-256: 44c260d494d68835630c20c87707f5fe00337a3140f469e531b4957f86995bc9.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'BaseTypeahead',
  subComponentOf: 'Typeahead',
  displayName: 'Base Typeahead',
  isHiddenFromOverview: true,
  description:
    'Composable combobox engine providing a bare input, search, keyboard navigation, and a styled result dropdown. It renders no input wrapper, border, or selected-value token. Typeahead and Tokenizer compose it for standard fields.',
  usage: {
    anatomy,
    description:
      'Composable combobox engine providing a bare input, search, keyboard navigation, and a styled result dropdown. It renders no input wrapper, border, or selected-value token. Typeahead and Tokenizer compose it for standard fields.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use Typeahead or Tokenizer for standard fields; they wrap BaseTypeahead with input chrome and selected-value rendering it intentionally omits.',
      },
      {
        guidance: true,
        description:
          'Provide your own visible label or aria-label and custom input wrapper so the bare combobox has an accessible name, focus treatment, border, and layout.',
      },
      {
        guidance: true,
        description:
          'Pass anchorRef pointing to your wrapper so the dropdown positions against your custom input chrome, not just the bare input element.',
      },
      {
        guidance: false,
        description:
          'Expect input chrome or selected-value rendering. BaseTypeahead is an engine; the caller owns those visible parts.',
      },
      {
        guidance: false,
        description:
          'Use BaseTypeahead when Typeahead or Tokenizer would suffice; the extra wrapper and styling work is only justified for truly custom compositions.',
      },
      {
        guidance: false,
        description:
          'Treat Escape as cancellation of pending source work. It hides the current popup, but a late response can reopen it.',
      },
    ],
  },
  props: [
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
      description: 'Currently selected item.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(item: T | null) => void',
      description: 'Called when the selection changes.',
      required: true,
    },
    {
      name: 'renderItem',
      type: '(item: T) => ReactNode',
      description: 'Custom render function for dropdown items.',
    },
    {
      name: 'placeholder',
      type: 'string',
      description: 'Input placeholder text.',
      default: "'Search…'",
    },
    {
      name: 'hasEntriesOnFocus',
      type: 'boolean',
      description: 'Show bootstrap results on focus before typing.',
      default: 'false',
    },
    {
      name: 'maxMenuItems',
      type: 'number',
      description: 'Maximum dropdown items to display.',
      default: '10',
    },
    {
      name: 'menuWidth',
      type: 'number',
      description:
        'Requested dropdown width in pixels before viewport clamping.',
    },
    {
      name: 'minQueryLength',
      type: 'number',
      description:
        'Minimum query length before the search source is queried. Below it no search runs and the menu stays closed.',
      default: '1',
    },
    {
      name: 'emptySearchText',
      type: 'ReactNode',
      description:
        'Content shown when the query matched nothing. Takes a ReactNode, so the dead end can carry a link or a create row. Announced in a polite live region as the text it renders, read from the DOM; aria-hidden parts stay out of both, and content that renders no text announces nothing. null counts as not given, like undefined, and falls through to the default; pass an empty string to render nothing.',
      default: "'No results found'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether the input is disabled.',
      default: 'false',
    },
    {
      name: 'isFocusableDisabled',
      type: 'boolean',
      description:
        'Keep a disabled input focusable with aria-disabled and readOnly so a caller-owned disabled reason remains discoverable. It blocks text entry, opening the results and picking a result, also from results that were open before it applied; Escape or Tab still closes them.',
      default: 'false',
    },
    {
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Auto-focus the input on mount.',
      default: 'false',
    },
    {
      name: 'debounceMs',
      type: 'number',
      description:
        'Debounce delay in ms before triggering search. Set to 0 for synchronous sources, and for a source that shows local matches through `context.update` and delays its own server request.',
      default: '150',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Size used to scale dropdown option padding.',
      default: "'md'",
    },
    {
      name: 'anchorRef',
      type: 'RefObject<HTMLElement | null>',
      description:
        'Ref to the anchor element for dropdown positioning. If not provided, the input itself is used.',
    },
    {
      name: 'inputXStyle',
      type: 'StyleXStyles',
      description: 'Additional StyleX styles for the input element.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'Standard BaseProps StyleX styles applied to the input. Must be a stylex.create() value, not an inline style object.',
    },
    {
      name: 'inputTabIndex',
      type: 'number',
      description:
        'Legacy input-specific alias for native tabIndex. When provided, it takes precedence; otherwise native tabIndex is preserved.',
    },
    {
      name: 'onKeyDown',
      type: '(e: React.KeyboardEvent<HTMLInputElement>) => void',
      description:
        'Additional keydown handler called before internal keyboard navigation. Call e.preventDefault() to skip internal handling.',
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
      name: 'inputId',
      type: 'string',
      description:
        'Legacy input-specific alias for native id. When provided, it takes precedence; otherwise native id is preserved.',
    },
    {
      name: 'ariaDescribedBy',
      type: 'string',
      description:
        'Legacy input-specific alias for native aria-describedby. When provided, it takes precedence; otherwise the native attribute is preserved.',
    },
    {
      name: 'ariaLabelledBy',
      type: 'string',
      description:
        'Legacy input-specific alias for native aria-labelledby. When provided, it takes precedence; otherwise the native attribute is preserved.',
    },
  ],
}
```
