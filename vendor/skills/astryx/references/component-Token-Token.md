# Astryx component reference: Token/Token.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Token/Token.doc.mjs. Original SHA-256: bae5d24fd8bf827380d12304c1ef4d9601045811cc319be755f439114aa65de0.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Token',
  displayName: 'Token',
  category: 'Content',
  keywords: ["token","chip","tag","pill","label","removable","dismissible","filter chip","closable"],
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Text label displayed inside the token.',
      required: true,
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'The size of the token.',
      default: "'md'",
    },
    {
      name: 'color',
      type: "'default' | 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'cyan' | 'blue' | 'purple' | 'pink' | 'gray'",
      description: 'Color variant of the token.',
      default: "'default'",
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Optional icon rendered before the label.',
      slotElements: [{__element: 'Icon', props: {icon: 'check', size: 'sm'}}],
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Whether the token is disabled; reduces opacity and blocks interactions.',
      default: 'false',
    },
    {
      name: 'onRemove',
      type: '(e: React.MouseEvent) => void',
      description:
        'Callback fired when the remove button is clicked. When provided, an X button is rendered inside the token.',
    },
    {
      name: 'onClick',
      type: '(e: React.MouseEvent) => void',
      description:
        'Click handler. When provided, the token renders as a <span> container with an invisible <button> inside for accessibility.',
    },
    {
      name: 'href',
      type: 'string',
      description:
        'Link URL. When provided, the token renders as an <a> element. The destination follows the shared navigation rule described on the Link `href` prop.',
    },
    {
      name: 'description',
      type: 'string',
      description:
        'Accessible description applied via aria-description on the root element.',
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Content rendered after the label and before the remove button.',
      slotElements: [
        {__element: 'Icon', props: {icon: 'chevronDown', size: 'sm'}},
        {__element: 'Badge', props: {label: '3'}},
      ],
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Visually hides the label using a screen-reader-only clip technique; the label remains accessible.',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],  theming: {
    targets: [
      {className: 'astryx-token', visualProps: ['color', 'size'], states: ['disabled']},
    ],
  },
  usage: {
    description:
      'Token is a small, inline element for representing discrete pieces of associated data, like tags, categories, or selections. Use it to label content, show active filters, or represent removable items like selected recipients in a compose field.',
    bestPractices: [
      {guidance: true, description: 'Use color to distinguish categories (for example, green for "Active", red for "Blocked", blue for "In Review") so users can scan status at a glance.'},
      {guidance: true, description: 'Provide an onRemove callback when tokens represent user selections that can be undone, like filters or multi-select values.'},
      {guidance: true, description: 'Add a leading icon when it helps identify the token type faster, like a person icon for user tokens or a tag icon for labels.'},
      {guidance: true, description: 'Keep labels short: one to three words. Tokens truncate with ellipsis when the text overflows.'},
      {guidance: true, description: 'Labels keep their character order under right-to-left, so `@alice`, `C++` and `example.com` read as written; a right-to-left label still reads right to left.'},
      {guidance: false, description: 'Don\'t use tokens for primary actions or navigation; use Button or Link instead. Tokens are for displaying metadata, not triggering workflows.'},
      {guidance: false, description: 'Don\'t hide the label unless the icon alone is universally understood. A color dot without text is ambiguous.'},
      {guidance: false, description: 'Don\'t mix too many colors in one token group. Stick to two or three meaningful colors so the palette stays scannable.'},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: 'A leading icon that identifies the token type, like a user avatar or category symbol.'},
      {name: 'Label', required: true, description: 'The visible text. Also used as the accessible name when isLabelHidden is true.'},
      {name: 'End content', required: false, description: 'Trailing content after the label, like a count badge or status dot.'},
      {name: 'Remove button', required: false, description: 'An X button that appears when onRemove is provided, letting users dismiss the token.'},
    ],
  },
}
```
