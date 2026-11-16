# Astryx component reference: Tokenizer/Tokenizer.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Tokenizer/Tokenizer.doc.mjs. Original SHA-256: 8b601dcb24e61a835739c93747d9a8d56cc09d2aed7ffa267d5850b6198af987.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Tokenizer',
  displayName: 'Tokenizer',
  category: 'Form Controls',
  keywords: [
    'tokenizer',
    'multiselect',
    'multi-select',
    'chips',
    'tags',
    'combobox',
    'autocomplete',
    'taginput',
    'chipinput',
  ],
  playground: {
    // `value` is a required array of custom items the preview cannot
    // auto-generate; without a default the properties tab shows the
    // missing-props placeholder instead of the field. `searchSource` and
    // `onChange` are supplied by the preview's own fallbacks.
    defaults: {
      label: 'Tags',
      placeholder: 'Search...',
      value: [
        {id: '1', label: 'Design'},
        {id: '2', label: 'Engineering'},
      ],
    },
  },
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
      type: 'T[]',
      description: 'Array of currently selected items.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(items: T[], change: TokenizerChange<T>) => void',
      description:
        "Called when selection changes. The change argument includes the affected item and type ('add' | 'create' | 'remove' | 'reorder'). Additions and removals (including Backspace on an empty input) are announced to screen readers via a polite live region.",
      required: true,
    },
    {
      name: 'placeholder',
      type: 'string',
      description:
        'Input placeholder text. Only shown when no tokens are selected.',
    },
    {
      name: 'maxEntries',
      type: 'number',
      description:
        'Maximum number of selections allowed. Input is hidden when the limit is reached.',
    },
    {
      name: 'hasClear',
      type: 'boolean',
      description: 'Show a clear-all button for bulk removal of all tokens.',
      default: 'false',
    },
    {
      name: 'renderToken',
      type: '(item: T, onRemove: () => void) => ReactNode',
      description:
        'Custom render function for selected tokens. Default renders Token with label and onRemove.',
    },
    {
      name: 'renderItem',
      type: '(item: T) => ReactNode',
      description:
        'Custom render function for dropdown items. Default renders TypeaheadItem.',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Disables the input and all token interactions. The input keeps its tab stop: it is announced as disabled (aria-disabled), is read-only, and opens and picks nothing. With tokenOverflowBehavior="unfocusedLayer" and no disabledMessage, the input is natively disabled and out of the tab order.',
      default: 'false',
    },
    {
      name: 'htmlName',
      type: 'string',
      description:
        'The HTML name attribute for form submissions. Renders one hidden input per selected item id.',
    },
    {
      name: 'disabledMessage',
      type: 'string',
      description:
        'Explains why the tokenizer is disabled. With isDisabled, shows a tooltip on hover/keyboard focus and keeps the input focusable via aria-disabled (input stays blocked). Use this instead of wrapping a disabled Tokenizer in Tooltip, so the reason is attached to the field itself.',
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
      name: 'hasEntriesOnFocus',
      type: 'boolean',
      description:
        'Show bootstrap results on focus before typing. After a pick from that list, the input keeps focus and the list stays open with the next choice active, while another choice remains.',
      default: 'false',
    },
    {
      name: 'maxMenuItems',
      type: 'number',
      description:
        'Maximum number of search results to display. The hasCreate entry is offered on top of them, so a menu can show one more than this.',
      default: '10',
    },
    {
      name: 'menuWidth',
      type: 'number',
      description:
        'Fixed dropdown width in pixels. The menu never shrinks below its anchor width.',
    },
    {
      name: 'minQueryLength',
      type: 'number',
      description:
        'Minimum query length before the search source is queried. Below it no search runs, and the menu stays closed — unless hasCreate is set, in which case the "Create ..." entry is still offered, being derived from the typed text rather than fetched for it.',
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
      name: 'hasAutoFocus',
      type: 'boolean',
      description: 'Auto-focus the input on mount.',
      default: 'false',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description:
        "Input and token size. Inside an InputGroup the group's size applies instead.",
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
      name: 'hasCreate',
      type: 'boolean',
      description:
        "Allow users to create new tokens from free-text input. When true, a \"Create\" option appears in the dropdown for typed text that doesn't match existing results. The onChange change type is 'create' for these items.",
      default: 'false',
    },
    {
      name: 'onChangeQuery',
      type: '(query: string) => void',
      description: 'Callback fired when the search query text changes.',
    },
    {
      name: 'startIcon',
      type: 'ReactNode | IconType',
      description:
        'Icon to display at the start of the input, before any tokens. Accepts a semantic icon name, an SVG icon component, or a ReactNode directly.',
      slotElements: [{__element: 'Icon', props: {icon: 'search', size: 'sm'}}],
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Content to display at the end of the input row. Useful for buttons, result counts, or other controls.',
      slotElements: [
        {__element: 'Icon', props: {icon: 'chevronDown', size: 'sm'}},
        {__element: 'Badge', props: {label: '3'}},
      ],
    },
    {
      name: 'handleRef',
      type: 'React.Ref<TokenizerHandle>',
      description:
        'Imperative handle exposing focus(), blur(), open() and close(). open() and close() drive the inline menu; the sheet presentation ignores them.',
    },
    {
      name: 'menu',
      type: 'BaseTypeaheadMenu',
      description:
        "What the menu shows. role 'listbox' (default) is the result list; its optional render({listbox, query, isBusy, isEmptySearch, close}) places information such as a header or a hint around it, and anything a person acts on stays a result so the arrow keys reach it. role 'dialog' shows render({query, close}) in a dialog named by label that takes focus; Escape, an outside press or close() returns focus to where it was when the menu opened. Astryx owns the layer either way. Switching from listbox to dialog keeps the menu open: call handleRef.open() from onChange. The sheet presentation keeps its own sheet and ignores it.",
    },
    {
      name: 'onOpenChange',
      type: '(isOpen: boolean) => void',
      description:
        'Called when the inline menu opens or closes. It reports changes only; drive the menu with handleRef. Not called by the sheet presentation.',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        'Width of the field (number = pixels, string used as-is, e.g. "100%"). Sizes the whole field (label, control, and status) so they stay aligned.',
    },
    {
      name: 'tokenOverflowBehavior',
      type: "'none' | 'unfocusedInline' | 'unfocusedLayer'",
      description:
        'Controls how tokens overflow when the container is too narrow.',
      default: "'none'",
    },
    {
      name: 'onFocus',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: 'Fires when focus enters the tokenizer input.',
    },
    {
      name: 'onBlur',
      type: '(e: FocusEvent<HTMLInputElement>) => void',
      description: 'Fires when focus leaves the tokenizer input.',
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
    {
      name: 'presentation',
      type: "'popover' | 'bottom-sheet' | 'adaptive'",
      description:
        'How the field presents its choices. adaptive (the default) uses the bottom sheet on compact touch screens and the popover otherwise, resolved the same way Selector resolves it; the server render and the hydrating render are the popover. popover is the inline combobox with its anchored suggestion menu on every device. bottom-sheet replaces it on every device with a field showing the selected tokens, whose trigger opens one tall modal sheet: a search row on top, full-width checkbox rows that keep their place while the sheet is open, a Create row with hasCreate, and a footer pinned in every state with a confirmed Clear all and Save; the sheet edits a draft, so onChange fires once, when Save commits it, and a swipe, scrim or Escape close of a changed draft asks before discarding. In the sheet presentation the field box holds the trigger, the tokens and endContent, and keeps the box, theming target and focus ring of the inline field; the trigger is the control: ref, id, aria-* and data-* reach it, and ref receives the trigger button there, so type it Ref<HTMLInputElement | HTMLButtonElement>, which the component accepts (TokenizerProps keeps its released input ref type). endContent sits at the inline end of the field and renderToken renders its tokens, as in the inline field; their own controls act without opening the sheet. renderItem, hasClear (the sheet has its own Clear all), hasEntriesOnFocus, menuWidth, menu, onOpenChange, tokenOverflowBehavior (the field wraps its tokens) and hasAutoFocus have no surface in the sheet, and the field warns once in development when they are passed. Pass presentation="popover" to keep the inline field and those props on every device.',
      default: "'adaptive'",
    },
  ],
  theming: {
    targets: [
      {
        className: 'astryx-tokenizer',
        visualProps: ['size', 'status'],
        states: ['disabled'],
      },
    ],
  },
  usage: {
    description:
      'Tokenizer is a multi-select input that lets users search, select, and manage multiple items displayed as removable chips. Use it when users need to build a set of selections from a searchable data source, like adding team members, applying tags, or choosing filters.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Write a placeholder that tells users what they can search for, such as "Search people..." or "Add tags...", so the input is not a blank mystery.',
      },
      {
        guidance: true,
        description:
          'Set maxEntries when the number of selections should be bounded, like limiting a review to 5 approvers.',
      },
      {
        guidance: true,
        description:
          'Use hasCreate for free-form tagging where users need to enter values that do not exist in the search source.',
      },
      {
        guidance: true,
        description:
          'Show validation status with the status prop so users know immediately when a selection is missing or invalid.',
      },
      {
        guidance: true,
        description:
          'Use inside InputGroup only when the tokenizer needs a short prefix or suffix addon as part of one decorated input surface; the grouped row stays single-line, so keep selections few (maxEntries) or use tokenOverflowBehavior to summarize them.',
      },
      {
        guidance: false,
        description:
          "Don't use Tokenizer for single-item selection; use Typeahead instead. Tokenizer is for building sets of two or more items.",
      },
      {
        guidance: false,
        description:
          'Avoid applying custom colors to individual tokens inside a Tokenizer; use the default token style for visual consistency across the set.',
      },
      {
        guidance: false,
        description:
          "Don't hide the label; every Tokenizer needs a visible label so users understand what they are selecting. Use isLabelHidden only when surrounding context makes the purpose obvious.",
      },
      {
        guidance: false,
        description:
          'Wrap a disabled Tokenizer in Tooltip to explain why it is disabled; disabled controls swallow the hover events the wrapper needs. Use the disabledMessage prop instead.',
      },
    ],
    anatomy: [
      {
        name: 'Label',
        required: true,
        description:
          'The visible text above the input describing what the user is selecting. Also used as the accessible name.',
      },
      {
        name: 'Token chips',
        required: false,
        description:
          'Removable chips representing each selected item. Each chip shows a label and a remove button.',
      },
      {
        name: 'Search input',
        required: true,
        description:
          'The text input where users type to search the data source. Hides when maxEntries is reached.',
      },
      {
        name: 'Dropdown menu',
        required: false,
        description:
          'The search results list that appears below the input as the user types.',
      },
      {
        name: 'Spinner',
        required: false,
        description:
          'Loading indicator shown at the end of the field while a search is in flight.',
      },
      {
        name: 'End content',
        required: false,
        description:
          'A trailing slot after the input for action buttons, counts, or other controls.',
      },
      {
        name: 'Clear button',
        required: false,
        description:
          'A button that removes all selected tokens at once. Shown when hasClear is true and tokens are present.',
      },
    ],
  },
}
```
