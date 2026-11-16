# Astryx component reference: ProgressBar/ProgressBar.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/ProgressBar/ProgressBar.doc.mjs. Original SHA-256: 79edb094552a107958f08779304962c8b6e1e6b971a601e52d9393bb8ddb9972.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'ProgressBar',
  playground: {
    defaults: {label: 'Uploading files', value: 60},
  },
  displayName: 'Progress Bar',
  category: 'Feedback & Status',
  keywords: [
    'progressbar',
    'progress',
    'loader',
    'loading',
    'linear',
    'determinate',
    'indeterminate',
    'meter',
    'linearprogress',
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'accessible label',
      required: true,
    },
    {
      name: 'value',
      type: 'number',
      description: 'Current value (ignored when indeterminate).',
      default: '0',
    },
    {
      name: 'max',
      type: 'number',
      description: 'Maximum value.',
      default: '100',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Visually hide the label (remains accessible).',
      default: 'false',
    },
    {
      name: 'hasValueLabel',
      type: 'boolean',
      description: 'Show formatted value text (ignored when indeterminate).',
      default: 'false',
    },
    {
      name: 'formatValueLabel',
      type: '(value: number, max: number) => string',
      description:
        'Custom value label formatter; defaults to a percentage string.',
    },
    {
      name: 'variant',
      type: "'accent' | 'success' | 'warning' | 'error' | 'neutral'",
      description: 'Semantic color variant.',
      default: "'accent'",
    },
    {
      name: 'isIndeterminate',
      type: 'boolean',
      description:
        'Animated loading indicator for unknown progress. Under reduced motion it pulses in place instead of sliding.',
      default: 'false',
    },
    {
      name: 'marks',
      type: 'ReadonlyArray<{value: number; label: string}>',
      description:
        "Fixed target marks drawn on the track at values in the same 0..max scale as value (e.g. a goal line). They stay visible whether progress is below or past them, and take their color from what they sit on: a mark inside the filled area uses the fill variant's on-color (on-accent, on-warning, on-error, and so on), a mark still out on the bare track uses the primary text color (the secondary one on a disabled bar, which dims everything it draws). Each mark requires a label: it is the mark's accessible name and the text revealed via a tooltip on hover/focus. Ignored when indeterminate.",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Visually disabled state: grays out the fill and text. Use for canceled or inactive operations.',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-progress-bar', visualProps: ['variant']},
      {className: 'astryx-progress-bar-fill', visualProps: ['variant']},
      {className: 'astryx-progress-bar-track'},
      {
        className: 'astryx-progress-bar-mark',
        visualProps: ['variant', 'placement'],
      },
    ],
    vars: [
      {
        name: '--_progressbar-mark-width',
        description: 'Target mark tick width',
        default: '2px',
        private: true,
      },
      {
        name: '--_progressbar-mark-height',
        description: 'Target mark tick height',
        default: '8px',
        private: true,
      },
    ],
    derived: [
      {property: 'width', vars: ['--_progressbar-mark-width'], replaces: true},
      {
        property: 'height',
        vars: ['--_progressbar-mark-height'],
        replaces: true,
      },
    ],
  },
  usage: {
    anatomy,
    description:
      "A horizontal bar showing the completion progress of a task. Use it for operations where the duration is known, or as an animated indicator when progress can't be calculated. Supports semantic color variants, value labels, and custom formatting. Under a finger a new value animates as on iOS: linearly, in proportion to how far it moves (a full track takes one second at the theme's default tempo), and the fill keeps a minimum visible length above zero.",
    bestPractices: [
      {
        guidance: true,
        description:
          "Use a determinate bar when the total amount of work is known, and indeterminate when it's not.",
      },
      {
        guidance: true,
        description:
          'Choose a color variant that matches the context: accent for general progress, success for completion, warning or error for alerts.',
      },
      {
        guidance: true,
        description:
          "Always provide a label, even if hidden; screen readers need it to announce what's loading.",
      },
      {
        guidance: false,
        description:
          'Place icons or labels inside the bar; compose them alongside it using layout components.',
      },
      {
        guidance: false,
        description:
          "Use a progress bar for instant actions; it's meant for operations that take noticeable time.",
      },
      {
        guidance: false,
        description:
          'Use multiple progress bars stacked together for the same operation; use one bar with a value label instead.',
      },
    ],
  },
}
```
