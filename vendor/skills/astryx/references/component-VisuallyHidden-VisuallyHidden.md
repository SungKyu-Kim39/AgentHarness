# Astryx component reference: VisuallyHidden/VisuallyHidden.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/VisuallyHidden/VisuallyHidden.doc.mjs. Original SHA-256: 9fdb77a73fc1be668aee69f9f5b65e862f3b081751aa521e6b68c3855d9a0308.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'VisuallyHidden',
  displayName: 'VisuallyHidden',
  category: 'Utility',
  keywords: ["visually hidden","sr-only","screen reader","accessibility","a11y","aria-live","hidden label","assistive technology"],
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content exposed to assistive technology while hidden from sight.',
    },
    {
      name: 'as',
      type: 'ElementType',
      description: 'HTML tag to render as. Use a block element for live regions.',
      default: "'span'",
    },
  ],
  usage: {
    description: 'Renders content in the accessibility tree while hiding it visually. Use for accessible names on icon-only controls, aria-live announcement regions, and supplementary screen-reader context. Deliberately has no styling props; the whole point is to stay invisible. `xstyle` is still accepted and ignored, only so code written against 0.7.2 keeps compiling; a planned minor removes it.',
    bestPractices: [
      { guidance: true, description: 'Use to give icon-only buttons and controls an accessible name that screen readers announce.' },
      { guidance: true, description: 'Render as a block element (as="div") with aria-live to announce dynamic updates like drag-and-drop or result counts.' },
      { guidance: false, description: 'Use it to hide content from everyone; it stays in the accessibility tree; use conditional rendering or `hidden` to remove content entirely.' },
      { guidance: false, description: 'Put interactive controls inside it; the content is not visible and cannot receive pointer input.' },
    ],
  },
}
```
