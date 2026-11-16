# Astryx component reference: StatusDot/StatusDot.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/StatusDot/StatusDot.doc.mjs. Original SHA-256: 24c6740c1662d2d77b41d8eac5d862f832a0c546ee5bb2afabd95cb12da7e9c6.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'StatusDot',
  playground: {
    defaults: {label: 'Online'},
  },
  displayName: 'Status Dot',
  category: 'Feedback & Status',
  keywords: [
    'statusdot',
    'dot',
    'indicator',
    'status',
    'signal',
    'presence',
    'availability',
    'online',
    'pip',
  ],
  props: [
    {
      name: 'variant',
      type: "'success' | 'warning' | 'error' | 'accent' | 'neutral'",
      description: 'Semantic color variant.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label surfaced via aria-label.',
      required: true,
    },
    {
      name: 'isPulsing',
      type: 'boolean',
      description:
        'Enables a pulse animation; respects prefers-reduced-motion: reduce.',
      default: 'false',
    },
    {
      name: 'tooltip',
      type: 'string',
      description: 'Tooltip text shown on hover to explain the status meaning.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        "Optional icon rendered centered inside the dot, painted in currentColor (the variant's ink). Gives the status a non-color mark, so use a different icon per status. Booleans and empty strings are ignored, so `cond && <Icon />` is safe. Same contract as AvatarStatusDot.",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [{className: 'astryx-status-dot', visualProps: ['variant']}],
  },
  usage: {
    anatomy,
    description:
      'A small colored dot that communicates status like online/offline presence or severity levels. Supports five semantic variants and an optional pulse animation. Always pair with a visible text label, as color alone should not carry meaning.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use StatusDot as a binary present/absent signal; avoid encoding many distinct states in a single dot, since color and size alone cannot reliably distinguish them.',
      },
      {
        guidance: true,
        description:
          'Always pair with a visible text label so status is not conveyed by color alone.',
      },
      {
        guidance: true,
        description:
          'Provide a descriptive `label` prop for screen reader accessibility.',
      },
      {
        guidance: true,
        description:
          'Pair the dot with an icon that carries the status as a distinct shape when it must stand on its own without adjacent text, so meaning survives without color.',
      },
      {
        guidance: true,
        description:
          "If you can't add a label or an icon, make sure the status is conveyed elsewhere accessibly (e.g. adjacent text, a table column, or a live region).",
      },
      {
        guidance: false,
        description:
          'Rely on color alone to communicate status; StatusDot is not fully accessible in isolation, so the builder must make the status distinguishable in context via a label, an icon, or an accessible alternative.',
      },
      {
        guidance: false,
        description:
          'Use the pulse animation for purely decorative purposes; reserve it for states that require immediate attention.',
      },
    ],
  },
}
```
