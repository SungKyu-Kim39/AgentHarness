# Astryx component reference: IconButton/IconButton.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/IconButton/IconButton.doc.mjs. Original SHA-256: 1d463e512ef29d3b0525ab226446489ac3d394c4a71eed58b8df1e41056f4e6e.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'IconButton',
  displayName: 'Icon Button',
  group: 'Button',
  category: 'Action',
  keywords: ['icon-button', 'icon', 'button', 'toolbar', 'action', 'compact'],

  props: [
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible label. Used as aria-label (not rendered as visible text).',
      required: true,
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'Icon element rendered inside the button. An Astryx Icon with no explicit size defaults to sm for sm/md buttons and md for lg buttons.',
      required: true,
      slotElements: [{__element: 'Icon', props: {icon: 'check'}}],
    },
    {
      name: 'variant',
      type: "\'primary\' | \'secondary\' | \'ghost\' | \'destructive\'",
      description: 'Visual style variant.',
      default: "\'secondary\'",
    },
    {
      name: 'size',
      type: "\'sm\' | \'md\' | \'lg\'",
      description: 'Size variant.',
      default: "\'md\'",
    },
    {
      name: 'elevation',
      type: "'none' | 'low' | 'med' | 'high'",
      description:
        'Resting shadow depth. The most common FAB shape is an icon-only button, so raise it with `low`/`med`/`high` for a floating action button. `none` is the default flat button.',
      default: "'none'",
    },
    {
      name: 'isLoading',
      type: 'boolean',
      description:
        'Shows a loading spinner and blocks re-activation while staying focusable (aria-busy + aria-disabled, not native disabled).',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Disables the button. Uses aria-disabled instead of native disabled so the button stays focusable.',
      default: 'false',
    },
    {
      name: 'tooltip',
      type: 'string',
      description:
        "Tooltip text shown on hover and keyboard focus. It also describes the button, unless it repeats the button's accessible name.",
    },
    {
      name: 'onClick',
      type: '(e: MouseEvent) => void',
      description: 'Standard click handler.',
    },
    {
      name: 'clickAction',
      type: '(e: MouseEvent) => void | Promise<void>',
      description: 'Async click handler with automatic loading state.',
    },
    {
      name: 'isInterruptible',
      type: 'boolean',
      description:
        'Keep the button clickable while a clickAction is pending: the spinner and aria-busy still show, but the button is not disabled and the action is not deduped, so a re-click lands and interrupts the in-flight action with a fresh one. Use it for interruptible actions, not fire-once actions (submit, save, pay).',
      default: 'false',
    },
    {
      name: 'width',
      type: 'SizeValue',
      description:
        'Width of the button. Numbers are treated as pixels, strings are used as-is. Without it the button keeps its icon-only aspect, square by default; with it the button takes that width.',
    },
    {
      name: 'type',
      type: "'button' | 'submit' | 'reset'",
      description: 'HTML button type attribute.',
      default: "'button'",
    },
    {
      name: 'name',
      type: 'string',
      description: 'HTML name attribute for form submission.',
    },
    {
      name: 'value',
      type: 'string | number | readonly string[]',
      description: 'HTML value attribute for form submission.',
    },
    {
      name: 'form',
      type: 'string',
      description: 'Associates the button with a form element by ID.',
    },
    {
      name: 'href',
      type: 'string',
      description:
        'When provided, renders the button as a link element (<a> or custom link component). A disabled IconButton still renders a <button>.',
    },
    {
      name: 'as',
      type: 'ComponentType',
      description:
        'Custom link component to use when href is provided (e.g. Next.js Link).',
    },
    {
      name: 'target',
      type: 'string',
      description:
        'HTML target attribute when rendered as a link (e.g. "_blank").',
    },
    {
      name: 'rel',
      type: 'string',
      description:
        'HTML rel attribute when rendered as a link (e.g. "noopener noreferrer").',
    },
  ],

  usage: {
    description:
      'A button that shows only an icon with no visible text. Use IconButton in toolbars, table rows, and compact UI where space is tight and the icon is universally understood.',
    accessibility: [
      {
        name: 'Essential icon or spinner arc',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        states: ['Rest', 'Hover', 'Pointer down', 'Loading'],
        description:
          'IconButton has no visible label. Its icon must have at least 3:1 contrast with the button background in Rest, Hover, and Pointer down. The moving spinner arc must also meet 3:1 while loading.',
      },
      {
        name: 'Visible control boundary',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1 if needed',
        states: ['Rest'],
        description:
          'The button edge needs 3:1 contrast only when users need it to see the control.',
      },
      {
        name: 'Keyboard focus indicator',
        category: 'Color contrast',
        criterion: '1.4.11 Non-text Contrast',
        requirement: '3:1',
        states: ['Focus visible'],
        description:
          'The focus outline must have at least 3:1 contrast with the area around the button. Check the red outline on destructive buttons too.',
      },
      {
        name: 'Disabled appearance',
        category: 'Color contrast',
        criterion: '1.4.3 and 1.4.11 exceptions',
        requirement: 'Not required',
        states: ['Disabled'],
        description:
          'Disabled controls do not need to meet these contrast ratios.',
      },
    ],
    bestPractices: [
      {
        guidance: true,
        description:
          'Make the aria-label specific: a trash icon labeled "Delete conversation" is clearer than just "Delete" for screen readers.',
      },
      {
        guidance: true,
        description:
          'Add a tooltip: even a gear icon can mean Settings, Preferences, or Configure.',
      },
      {
        guidance: true,
        description:
          'Use ghost in toolbars and dense areas to reduce visual clutter.',
      },
      {
        guidance: false,
        description:
          "Use IconButton if the action isn't obvious from the icon alone; use Button with text.",
      },
      {
        guidance: false,
        description:
          'Skip the tooltip; label only reaches screen readers, sighted users need the hover hint.',
      },
    ],
  },
}
```
