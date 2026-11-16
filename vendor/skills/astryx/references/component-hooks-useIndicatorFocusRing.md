# Astryx component reference: hooks/useIndicatorFocusRing.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useIndicatorFocusRing.doc.mjs. Original SHA-256: a5b0cff714e0633b10c8fed9cccec629f959401670c6e0e89bcd6019d92dbfc9.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useIndicatorFocusRing',
  displayName: 'useIndicatorFocusRing',
  keywords: [
    'focus ring',
    'focus',
    'focus-visible',
    'outline',
    'indicator',
    'checkbox',
    'radio',
    'visually hidden input',
    'keyboard',
    'accessibility',
    'a11y',
    'wcag',
  ],
  params: [
    {
      name: 'containerRef',
      type: 'RefObject<HTMLElement | null>',
      description:
        'Ref to an element wrapping only the indicator, so its single element child is unambiguously the thing to ring.',
      required: true,
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Skip the ring; a disabled control is not focusable.',
      default: 'false',
    },
  ],
  returns: [
    {
      name: 'focusProps',
      type: '{onFocus: (event: FocusEvent<HTMLElement>) => void; onBlur: () => void}',
      description: 'Spread onto the element that owns the focusable input.',
    },
  ],
  usage: {
    description:
      "Draws the standard focus ring on the indicator of a control whose real input is visually hidden; a checkbox or radio focuses an opacity-0 input, so the ring has to appear on the picture beside it. The ring is painted imperatively on the indicator's own element, which is the only element whose border-radius can shape it, and only on :focus-visible, so pointer clicks stay quiet. Owning it here means a theme-supplied indicator cannot ship a control with no visible focus (WCAG 2.4.7) by ignoring a prop.",
    bestPractices: [
      {
        guidance: true,
        description:
          "Wrap only the indicator in the ref'd element; a wrapper holding label text would ring the whole row.",
      },
      {
        guidance: true,
        description:
          'Spread focusProps on the element that contains the hidden input, not on the input itself.',
      },
      {
        guidance: false,
        description:
          'Ask a themeable indicator to draw its own focus ring; a replacement that ignores the prop leaves the control with no visible focus.',
      },
    ],
  },
  relatedComponents: ['CheckboxInput', 'RadioList', 'Selector'],
  relatedHooks: ['useFocusTrap'],
  importPath: '@astryxdesign/core/hooks',
  category: 'focus',
}
```
