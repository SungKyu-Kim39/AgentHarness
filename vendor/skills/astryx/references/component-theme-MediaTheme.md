# Astryx component reference: theme/MediaTheme.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/theme/MediaTheme.doc.mjs. Original SHA-256: 0bccfb8ce2ad622d6de2c7372c5081926c5155a5f29c4c5071d7d3b73c5c33fb.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'MediaTheme',
  displayName: 'Media Theme',
  group: 'Utilities',
  category: 'Utility',
  isHiddenFromOverview: true,
  keywords: [
    'theme',
    'dark-mode',
    'light-mode',
    'media',
    'inverted',
    'overlay',
    'scrim',
    'toast',
    'tooltip',
  ],
  playground: {
    defaults: {
      mode: 'auto',
      children: {
        __element: 'Section',
        props: {
          variant: 'transparent',
          padding: 4,
          style: {
            maxWidth: 360,
            backgroundColor: 'var(--color-background-inverted)',
            borderRadius: 'var(--radius-container)',
          },
        },
        children: {
          __element: 'VStack',
          props: {gap: 2},
          children: [
            {
              __element: 'Text',
              props: {type: 'body', weight: 'bold'},
              children: 'Media overlay',
            },
            {
              __element: 'Text',
              props: {type: 'supporting', color: 'secondary'},
              children: 'Text and actions adapt to the dark media surface.',
            },
            {
              __element: 'Button',
              props: {label: 'Watch now', variant: 'secondary', size: 'sm'},
            },
          ],
        },
      },
    },
  },
  usage: {
    description:
      'Provides token overrides for content rendered on inverted surfaces: media overlays, scrims, toasts, and tooltips. The base behavior flips color-scheme so all light-dark() tokens resolve to the correct side. Only a small set of tokens need explicit overrides beyond that. Themes can further customize component appearance on media surfaces via onDark/onLight in defineTheme(), with both token overrides (e.g. "--color-accent": "#90CAF9") and component overrides (e.g. ghost buttons get a border on dark surfaces).',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use for any content placed over a dark background (image overlays, video scrims, dark cards) or other inverted surfaces like toasts and tooltips.',
      },
      {
        guidance: true,
        description:
          'Prefer mode="auto" when the surface color comes from a theme token. A token named "inverted" is not guaranteed to be inverted, and auto measures what was actually painted instead of trusting the name. It can even decide that a surface needs no media context at all.',
      },
      {
        guidance: true,
        description:
          'Pair with a background color: MediaTheme flips the token context but does not add a background. Set backgroundColor on the parent element.',
      },
      {
        guidance: true,
        description:
          'Themes can customize components on media surfaces via onDark.components and onLight.components in defineTheme(). For example, add a border to ghost buttons on dark surfaces.',
      },
      {
        guidance: false,
        description:
          'Use MediaTheme for app-level dark mode: use Theme with mode="dark" or mode="system" instead. MediaTheme is for local surface inversions, not page-wide color scheme.',
      },
    ],
  },
  props: [
    {
      name: 'mode',
      type: "'dark' | 'light' | 'auto' | 'off'",
      required: true,
      description:
        'Surface luminance context: dark for content over dark backgrounds (light text, white-tinted interactions), light for content over light backgrounds (dark text, black-tinted interactions), auto to decide from the painted surface (no media context when the ambient text already reads on the surface at 3:1, otherwise the side that reads better), and off to turn it off explicitly. The element renders either way, so a surface can switch contexts without remounting children.',
    },
    {
      name: 'fallback',
      type: "'dark' | 'light'",
      default: "'dark'",
      description:
        'Which side auto uses when the surface cannot be measured: during SSR, on the first client frame, and whenever the backdrop is not knowable from CSS, most often a background-image, whose pixels need sampling (useImageMode) rather than a computed style. Ignored unless mode is auto.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description:
        'Content to render with inverted token context. Components inherit the correct colors automatically.',
    },
  ],
}
```
