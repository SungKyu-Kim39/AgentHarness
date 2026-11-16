# Astryx component reference: NavIcon/NavIcon.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/NavIcon/NavIcon.doc.mjs. Original SHA-256: 00c63ceebdcf37c8a59be162d05850690d5086a5f9a0e1257bbf9c89c297bcde.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'NavIcon',
  displayName: 'Nav Icon',
  group: 'Navigation',
  category: 'Navigation',
  isHiddenFromOverview: true,
  hidden: false,
  keywords: [
    'navicon',
    'iconbutton',
    'toolbar icon',
    'appbar icon',
    'nav button',
  ],
  props: [
    {
      name: 'icon',
      type: 'ReactNode',
      description:
        'The icon element to render inside the circular background. Should be an Icon or similar icon component.',
      required: true,
      slotElements: [{__element: 'Icon', props: {icon: 'check', size: 'sm'}}],
    },
  ],
  theming: {
    targets: [{className: 'astryx-nav-icon'}],
  },
  usage: {
    anatomy,
    description:
      'NavIcon is a circular icon container with an accent-colored background. Use it in navigation headers such as TopNavHeading and PageNavHeader to visually identify a section or application.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use in navigation headers to provide a recognizable visual anchor for the section.',
      },
      {
        guidance: true,
        description:
          'Pass an Icon or similarly sized icon component to ensure proper proportions.',
      },
      {
        guidance: false,
        description:
          'Use NavIcon for interactive purposes; it is a display-only container, not a button.',
      },
    ],
  },
}
```
