# Astryx component reference: InputGroup/InputGroupText.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/InputGroup/InputGroupText.doc.mjs. Original SHA-256: 571750b69836f8838e4f9ad30705f9f5d43c5ed311b6975a7285d40e750a82d6.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'InputGroupText',
  subComponentOf: 'InputGroup',
  displayName: 'Input Group Text',
  isHiddenFromOverview: true,
  description:
    'A prefix or suffix text element rendered inside InputGroup. Displays text or icons.',
  usage: {
    description:
      "Use InputGroupText inside InputGroup for a short fixed prefix or suffix, such as a currency symbol, a protocol, or a unit, or for a decorative icon. It is plain text, not a control, and it is not part of the input's accessible name.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep the text short, such as $, https://, or kg. It stays on one line and does not shrink.',
      },
      {
        guidance: true,
        description:
          'Plain text keeps its character order under right-to-left, so https:// and .com read as written. When rich content mixes directions, mark the direction on your own content, for example with `dir` or `<bdi>`.',
      },
      {
        guidance: true,
        description:
          'Put what a screen reader user needs in the input\'s own label, such as "Amount in USD" beside a $ prefix. The addon is read as plain text in reading order.',
      },
      {
        guidance: false,
        description:
          'Put buttons, links, or other controls inside InputGroupText. Use a Button addon for an action.',
      },
      {
        guidance: false,
        description:
          'Use InputGroupText outside InputGroup. Its borders and corners join an InputGroup row.',
      },
    ],
    anatomy: [
      {
        name: 'Text cell',
        required: true,
        description:
          'A non-interactive cell that holds text or an icon and joins the borders of its neighbours in the row.',
      },
    ],
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Text or icon content.',
      required: true,
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'CSS class name(s).',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description: 'Inline styles.',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: 'Ref forwarded to the text cell element.',
    },
  ],
}
```
