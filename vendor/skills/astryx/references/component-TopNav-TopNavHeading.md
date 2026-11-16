# Astryx component reference: TopNav/TopNavHeading.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/TopNav/TopNavHeading.doc.mjs. Original SHA-256: 0cb1848baefb8cb690cca0374de5c3a2ab033e5c27bbe44d0ee51e05d731d24d.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'TopNavHeading',
  subComponentOf: 'TopNav',
  displayName: 'Top Nav Heading',
  isHiddenFromOverview: true,
  description: 'Product/suite/account heading for the TopNav heading slot. Supports smart interaction boundary logic: logo, heading text, superheading/subheading with independent links, and an optional menu popover with automatic chevron indicator.',
  playground: {
    defaults: {superheading: 'Acme Suite', heading: 'Acme Console'},
  },
  props: [
    {
      name: 'logo',
      type: 'ReactNode',
      description: 'Logo element to display before the heading text. Can be an image, NavIcon, or any ReactNode.',
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
      name: 'heading',
      type: 'string',
      description: 'Product/app name displayed as the primary heading text.',
    },
    {
      name: 'headingHref',
      type: 'string',
      description: 'Link for the heading text (e.g. product home). When no menu is present and this is the only href, the whole heading becomes one clickable link.',
    },
    {
      name: 'superheading',
      type: 'string',
      description: 'Text above the heading (e.g. suite name). Rendered in a smaller secondary style.',
    },
    {
      name: 'superheadingHref',
      type: 'string',
      description: 'Link for the superheading text (e.g. suite home). When provided alongside a menu, renders as an independent inline link.',
    },
    {
      name: 'subheading',
      type: 'string',
      description: 'Text below the heading (e.g. account context). Rendered in a smaller secondary style.',
    },
    {
      name: 'subheadingHref',
      type: 'string',
      description: 'Link for the subheading text. When provided alongside a menu, renders as an independent inline link.',
    },
    {
      name: 'headerEndContent',
      type: 'ReactNode',
      description: 'Content rendered at the trailing edge of the heading row (e.g. a badge or status indicator).',
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
      name: 'menu',
      type: 'ReactNode',
      description: 'Menu content shown in a popover dropdown. When provided, a chevron indicator appears automatically. Interaction boundary is determined by the presence of hrefs: no hrefs means the whole header is the trigger; with hrefs, links are independent and the chevron area is the trigger.',
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
      name: 'as',
      type: 'LinkComponentType',
      description: 'Custom component to render instead of <a>. Overrides the provider-level default set by LinkProvider. Must accept href, className, style, and children props.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization. Must be a stylex.create() value.',
    },
  ],
}
```
