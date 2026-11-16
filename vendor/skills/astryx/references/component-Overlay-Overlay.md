# Astryx component reference: Overlay/Overlay.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Overlay/Overlay.doc.mjs. Original SHA-256: 48faf7d6af9a522508310973fd478e3aae28235c0e25cf4b56831c73c9f4b37d.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Overlay',
  displayName: 'Overlay',
  group: 'Overlay',
  category: 'Overlay',

  keywords: ['overlay', 'scrim', 'media', 'hover', 'focus', 'image', 'card'],

  usage: {
    description:
      'Overlay layers action or supporting content over media, cards, video, or other bounded surfaces with an optional scrim and reveal behavior. Host attributes and DOM handlers (id, data-*, aria-*) reach the root element.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use overlays for short, contextual actions or labels that belong directly to the underlying media or surface.',
      },
      {
        guidance: true,
        description:
          'Keep overlay content compact so it remains legible over the scrim and does not obscure important visual information.',
      },
      {
        guidance: false,
        description:
          'Do not use Overlay for floating content anchored outside the surface. Use Popover, Tooltip, or Dialog for those patterns.',
      },
    ],
    anatomy: [
      {
        name: 'Base content',
        required: false,
        description: 'The media, card, or bounded surface that the overlay sits on top of.',
      },
      {
        name: 'Scrim',
        required: false,
        description: 'Optional dark or light overlay background that improves content contrast.',
      },
      {
        name: 'Overlay content',
        required: true,
        description: 'Actions, labels, or supporting content rendered above the base surface.',
      },
    ],
  },

  playground: {
    defaults: {
      content: {
        __element: 'Button',
        props: {label: 'Quick view', variant: 'secondary', size: 'sm'},
      },
      children: [
        {
          __element: 'AspectRatio',
          props: {
            ratio: 1.7777777777777777,
            style: {
              width: 320,
              borderRadius: 12,
              overflow: 'clip',
            },
          },
          children: {
            __element: 'div',
            props: {
              style: {
                width: '100%',
                height: '100%',
                background:
                  'linear-gradient(135deg, #172554 0%, #2563eb 55%, #67e8f9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 600,
              },
            },
            children: 'Media preview',
          },
        },
      ],
    },
  },

  props: [
    {
      name: 'content',
      type: 'ReactNode',
      description: 'Content rendered inside the overlay scrim.',
      required: true,
      slotElements: [
        {
          __element: 'Button',
          props: {label: 'Quick view', variant: 'secondary', size: 'sm'},
        },
        {
          __element: 'Text',
          props: {type: 'body', weight: 'bold'},
          children: 'Overlay content',
        },
      ],
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Base content such as an image, video, card, or media surface that the overlay sits on top of.',
      slotElements: [
        {
          __element: 'AspectRatio',
          props: {ratio: 1.7777777777777777, style: {width: 320}},
          children: {
            __element: 'div',
            props: {
              style: {
                width: '100%',
                height: '100%',
                background:
                  'linear-gradient(135deg, #172554 0%, #2563eb 55%, #67e8f9 100%)',
              },
            },
          },
        },
      ],
    },
    {
      name: 'showOn',
      type: "'hover' | 'always' | 'focus' | 'hover-or-focus'",
      description:
        'Visibility trigger. Hover mode also reveals on focus for keyboard accessibility; hover-or-focus is an alias for hover.',
      default: "'always'",
    },
    {
      name: 'isOpen',
      type: 'boolean',
      description: 'Controlled visibility override. When set, this takes precedence over showOn and touch toggle behavior.',
    },
    {
      name: 'scrim',
      type: "'dark' | 'light' | false",
      description: 'Scrim background mode. Set to false to render overlay content without a scrim background.',
      default: "'dark'",
    },
    {
      name: 'position',
      type: "'fill' | 'bottom' | 'top'",
      description: 'Where the scrim appears within the base surface.',
      default: "'fill'",
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end'",
      description: 'Alignment of the overlay content within the scrim.',
      default: "'end'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'CSS class name(s) appended to the root element. Prefer xstyle for styling when possible.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description: 'Inline styles applied to the root element. Prefer xstyle for design-system styling.',
    },
    {
      name: 'ref',
      type: 'Ref<HTMLDivElement>',
      description: 'Ref forwarded to the overlay root element.',
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-overlay'},
      {className: 'astryx-overlay-scrim', visualProps: ['position']},
    ],
  },
}
```
