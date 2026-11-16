# Astryx component reference: Blockquote/Blockquote.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Blockquote/Blockquote.doc.mjs. Original SHA-256: b81c88eb3719f6349d71697f4814130bc424cfae4c2f960cfb6e3b6ac0c57bab.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Blockquote',
  displayName: 'Blockquote',
  category: 'Content',
  keywords: ["blockquote","quote","citation","pullquote","quotation","cite","excerpt"],
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content of the blockquote.',
      required: true,
    },
    {
      name: 'cite',
      type: 'ReactNode',
      description: 'Optional attribution for the quote. Rendered in a <cite> element after the quoted content.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],
  playground: {
    defaults: {
      children:
        'Design is not just what it looks like and feels like. Design is how it works.',
      cite: 'Steve Jobs',
    },
  },
  theming: {
    targets: [
      {className: 'astryx-blockquote', visualProps: []},
    ],
  },
  usage: {
    description: 'A quotation block with a rule on its inline-start edge and secondary text color. Use to highlight quoted content, testimonials, or excerpts. The rule and padding are logical, so they move to the right edge in right-to-left locales.',
    anatomy: [
      {name: 'Rule', required: true, description: 'The border on the inline-start edge, drawn with --color-border-emphasized.'},
      {name: 'Quotation', required: true, description: 'The quoted content, passed as children. Renders inside the <blockquote> element.'},
      {name: 'Attribution', required: false, description: 'The source, passed as cite. Renders as a <cite> element below the quotation.'},
    ],
    bestPractices: [
      { guidance: true, description: 'Use for quoted text, testimonials, or highlighted excerpts from external sources.' },
      { guidance: true, description: 'Provide a cite prop when the source of the quote is known.' },
      { guidance: true, description: 'Pass the source through cite rather than typing it into children, so it renders as a semantic <cite> element that assistive technology can distinguish from the quotation.' },
      { guidance: false, description: 'Use for callout boxes or informational notes; use Banner for those.' },
      { guidance: false, description: 'Wrap the attribution in your own <footer>. A <footer> inside a <blockquote> becomes a contentinfo document landmark, and a page with several quotes then reports several page footers.' },
    ],
  },
}
```
