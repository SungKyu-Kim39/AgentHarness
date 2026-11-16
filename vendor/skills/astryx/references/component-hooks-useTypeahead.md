# Astryx component reference: hooks/useTypeahead.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useTypeahead.doc.mjs. Original SHA-256: b0ec94e529eebb5876fa5f4d7318844f32bf45ec9ff1093fa4d50ced39d85e8d.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useTypeahead',
  displayName: 'useTypeahead',
  keywords: [
    'typeahead',
    'type to focus',
    'first character',
    'keyboard',
    'search',
    'jump',
    'menu',
    'listbox',
    'select',
    'apg',
    'accessibility',
    'a11y',
  ],
  params: [
    {
      name: 'options',
      type: 'UseTypeaheadOptions',
      description: 'Configuration object.',
      required: true,
    },
    {
      name: 'options.getItemLabels',
      type: '() => ReadonlyArray<string | null | undefined>',
      description:
        "Returns the item labels in DOM order. A null or empty entry marks a non-matchable slot and keeps indices aligned with the caller's items.",
      required: true,
    },
    {
      name: 'options.onMatch',
      type: '(index: number) => void',
      description:
        "Called with the index of the matched item so the caller can focus or select it; typically useListFocus's focusItem.",
      required: true,
    },
    {
      name: 'options.getCurrentIndex',
      type: '() => number',
      description:
        'The index to search from, usually the focused item, so repeated presses of one letter cycle through matches. A negative value means nothing is current.',
      default: '() => -1',
    },
    {
      name: 'options.resetMs',
      type: 'number',
      description:
        'Milliseconds of inactivity after which the typed buffer resets.',
      default: '750',
    },
    {
      name: 'options.isDisabled',
      type: '(index: number) => boolean',
      description: 'Whether an index should be skipped, e.g. disabled items.',
    },
  ],
  returns: [
    {
      name: 'onKeyDown',
      type: '(e: React.KeyboardEvent | KeyboardEvent) => boolean',
      description:
        'Keydown handler. Returns true when it consumed a printable character, so the caller can stop its own key handling.',
    },
    {
      name: 'reset',
      type: '() => void',
      description:
        'Clears the pending buffer, e.g. when the collection closes.',
    },
  ],
  usage: {
    description:
      "Adds APG type-to-focus search to a collection: printable keystrokes are buffered (resetting after a pause), and the first item whose label starts with the buffer (ignoring case, accents, the stroked letters đ ł ø ħ ŧ ƀ and Turkish ı/İ, the same in every locale; a typed accent prefers the exact match) is reported through onMatch. Pressing the same letter repeatedly cycles through the matches rather than filtering deeper. It moves nothing itself; pair it with the collection's own focus management, most often useListFocus or useGridFocus.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Wire onMatch to the focus manager you already have (useListFocus.focusItem) instead of moving focus yourself.',
      },
      {
        guidance: true,
        description:
          'Let it see the key event first and fall through to arrow-key navigation only when it returns false.',
      },
      {
        guidance: true,
        description:
          'Pass getCurrentIndex so repeated presses of one letter walk through matches instead of sticking on the first.',
      },
      {
        guidance: false,
        description:
          'Use it on a text input; the field already receives the characters, and typeahead would fight the value.',
      },
    ],
  },
  relatedComponents: ['DropdownMenu', 'Selector', 'TreeList'],
  relatedHooks: ['useListFocus', 'useGridFocus', 'useTreeFocus'],
  importPath: '@astryxdesign/core/hooks',
  category: 'focus',
}
```
