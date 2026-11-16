# Astryx component reference: Spinner/Spinner.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Spinner/Spinner.doc.mjs. Original SHA-256: 9ab824af4a4463eccb21d35f2b30c1bed3dc0d4ec0b843af8b4a38a71f5beee4.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Spinner',
  displayName: 'Spinner',
  category: 'Feedback & Status',
  keywords: [
    'spinner',
    'loader',
    'loading',
    'circular',
    'progress',
    'spin',
    'activity',
    'busy',
    'indeterminate',
    'circularprogress',
  ],
  props: [
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg' | 'xl'",
      description: 'Spinner size: ring diameter (10px, 14px, 18px, 28px).',
      default: "'md'",
    },
    {
      name: 'shade',
      type: "'default' | 'onMedia' | 'subtle' | 'inherit'",
      description: 'Color shade for light or dark backgrounds.',
      default: "'default'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      description:
        'Visible content below the spinner. A string label names the indicator through aria-labelledby.',
    },
    {
      name: 'aria-label',
      type: 'string',
      description:
        'Accessible name for screen readers. Defaults to label (if string) or a translated "Loading" from the i18n catalog.',
      default: "'Loading'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [{className: 'astryx-spinner', visualProps: ['size', 'shade']}],
    vars: [
      {
        name: '--spinner-diameter',
        description:
          "Diameter of the drawn ring. Set it on a size-variant target to retheme what each named size resolves to, e.g. spinner: { 'size:xl': { '--spinner-diameter': '2.5rem' } }. The rendered box is this plus the stroke width on each side, and follows automatically. Any length works: rem, em and calc() are resolved before the ring is drawn.",
        default: '10px (sm), 14px (md), 18px (lg), 28px (xl)',
      },
      {
        name: '--spinner-stroke-width',
        description:
          'Stroke width of both circles the ring is drawn from: the moving arc and the track behind it. Set it per size alongside the diameter. One stroke width drives both, so 0 is honoured as a zero-width stroke and paints nothing at all rather than falling back to the default; for an arc with no track behind it, set --spinner-track-color to transparent instead.',
        default: '2px (sm), 3px (md), 3px (lg), 4px (xl)',
      },
      {
        name: '--spinner-color',
        description:
          "Color of the moving arc. Defaults to the shade's token, so set it on a shade-variant target to retheme one shade (spinner: { 'shade:subtle': { '--spinner-color': 'var(--color-text-tertiary)' } }), or on the base target to retheme all four. Accepts any color notation, including var(), color-mix() and currentColor.",
        default:
          'var(--color-accent) (default), var(--color-text-secondary) (subtle), var(--color-on-dark) (onMedia), currentColor (inherit)',
      },
      {
        name: '--spinner-track-color',
        description:
          'Color of the track the arc travels on. Set it to `transparent` for an arc with no track. The onMedia and inherit shades draw the track at reduced alpha (30%) so it reads against an arbitrary backdrop; that fade applies to a themed color too.',
        default:
          'var(--color-track) (default, subtle), var(--color-on-dark) (onMedia), currentColor (inherit)',
      },
      {
        name: '--spinner-arc-fraction',
        description:
          "Fraction of the ring the moving arc covers, as a plain number (not a percentage or angle). Set it on a size-variant target the same way as --spinner-diameter, e.g. spinner: { 'size:xl': { '--spinner-arc-fraction': '0.75' } } for a 270deg sweep. Only takes effect once the stylesheet loads; a render with no CSS (SSR, no-JS) always draws the default 135deg arc.",
        default: '0.375 (135deg), same for every size',
      },
    ],
  },
  usage: {
    description:
      'An animated loading indicator for processes with unknown duration, such as data fetching or form submission. Supports visible labels, multiple sizes, and a dark background variant. For content with known dimensions, use Skeleton instead.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Provide a meaningful label to describe what is loading for screen reader users.',
      },
      {
        guidance: true,
        description:
          'Use the "onMedia" shade when placed on dark or accent-colored backgrounds.',
      },
      {
        guidance: false,
        description:
          'Use for content areas with known dimensions; use Skeleton to preserve layout instead.',
      },
      {
        guidance: false,
        description:
          'Stack multiple spinners in the same view; use one to represent the overall loading state.',
      },
    ],
  },
}
```
