# Astryx component reference: SideNav/SideNavHeading.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/SideNav/SideNavHeading.doc.mjs. Original SHA-256: f9e85f61583611d783e5436886b9a6c250aa32490f4cc8e9ff3fb29e1bd56381.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'SideNavHeading',
  subComponentOf: 'SideNav',
  displayName: 'Side Nav Heading',
  isHiddenFromOverview: true,
  description: 'Product/suite/account heading with smart interaction boundary logic for links and a menu popover.',
  playground: {
    defaults: {heading: 'Acme Console', subheading: 'Production'},
  },
  props: [
    {
      name: 'heading',
      type: 'string',
      description: 'Product/app name.',
      required: true,
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Product/app icon.',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'check',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'headingHref',
      type: 'string',
      description: 'Link for the heading.',
    },
    {
      name: 'superheading',
      type: 'string',
      description: 'Text above the heading.',
    },
    {
      name: 'superheadingHref',
      type: 'string',
      description: 'Link for the superheading.',
    },
    {
      name: 'subheading',
      type: 'string',
      description: 'Text below the heading.',
    },
    {
      name: 'subheadingHref',
      type: 'string',
      description: 'Link for the subheading.',
    },
    {
      name: 'menu',
      type: 'ReactNode',
      description: 'Menu content rendered inside a popover.',
      slotElements: [
        {
          __element: 'Button',
          props: {
            label: 'Action',
            variant: 'ghost',
            size: 'sm',
          },
        },
      ],
    },
    {
      name: 'headerEndContent',
      type: 'ReactNode',
      description: 'Content rendered at the trailing edge of the heading row, between text and chevron. Useful for badges, status indicators, or compact action buttons. Hidden when collapsed.',
      slotElements: [
        {
          __element: 'Button',
          props: {
            label: 'Action',
            variant: 'ghost',
            size: 'sm',
          },
        },
      ],
    },
  ],
}
```
