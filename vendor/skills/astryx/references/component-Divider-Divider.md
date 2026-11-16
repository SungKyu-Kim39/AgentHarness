# Astryx component reference: Divider/Divider.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Divider/Divider.doc.mjs. Original SHA-256: 4a84d7de32aa602fc875fedbb8bd6634f4559e616101d832598003e048f11ff0.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Divider',
  displayName: 'Divider',
  category: 'Layout',
  keywords: ["divider","separator","hr","rule","line","border","spacer","horizontal rule"],
  props: [
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      description: 'Orientation of the divider.',
      default: "'horizontal'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      description:
        'Optional label centered on the divider. Numeric zero is preserved; null, booleans, and empty strings render no label.',
    },
    {
      name: 'variant',
      type: "'subtle' | 'strong'",
      description: 'Visual weight of the divider line.',
      default: "'subtle'",
    },
    {
      name: 'isFullBleed',
      type: 'boolean',
      description:
        'Extend the divider to container edges with negative margins.',
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
      {className: 'astryx-divider', visualProps: ['orientation', 'variant']},
    ],
  },
  usage: {
    anatomy,
    description: 'A visual separator that divides content into distinct sections. Use to create clear boundaries between groups of related content, or to demarcate interactive regions within a layout.',
    bestPractices: [
      { guidance: true, description: 'Use subtle dividers between related content sections and strong dividers for high-contrast boundaries.' },
      { guidance: true, description: 'Add a label to the divider when sections need a visible category heading.' },
      { guidance: false, description: 'Overuse dividers; rely on spacing and layout to separate content when possible.' },
    ],
  },
}
```
