# Astryx component reference: SideNav/SideNavSection.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/SideNav/SideNavSection.doc.mjs. Original SHA-256: ced37440092cc816052372603db902b483d6ddbcf8e84266c369eb14bf4b8a04.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'SideNavSection',
  subComponentOf: 'SideNav',
  displayName: 'Side Nav Section',
  isHiddenFromOverview: true,
  description: 'Section grouping with an optional title, subtitle, and end content.',
  playground: {
    defaults: {
      title: 'Workspace',
      children: [
        {__element: 'SideNavItem', props: {label: 'Dashboard', isSelected: true}},
        {__element: 'SideNavItem', props: {label: 'Projects'}},
        {__element: 'SideNavItem', props: {label: 'Settings'}},
      ],
    },
  },
  props: [
    {
      name: 'title',
      type: 'string',
      description: 'Section title.',
      required: true,
    },
    {
      name: 'subtitle',
      type: 'string',
      description: 'Section subtitle.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Section items.',
      slotElements: [
        {
          __element: 'SideNavItem',
          props: {
            label: 'Item',
          },
        },
      ],
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: 'Right-side content in the section header.',
      slotElements: [
        {
          __element: 'Icon',
          props: {
            icon: 'chevronDown',
            size: 'sm',
          },
        },
        {
          __element: 'Badge',
          props: {
            label: '3',
          },
        },
      ],
    },
    {
      name: 'isHeaderHidden',
      type: 'boolean',
      description: 'Visually hides the section header while keeping it accessible to screen readers.',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
  ],
}
```
