# Astryx component reference: Code/Code.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Code/Code.doc.mjs. Original SHA-256: 41ad17d1135448c3b1455d3f1bd4330f802c516d62c5ea5ae36cba93a8274385.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Code',
  displayName: 'Code',
  keywords: ['inlinecode', 'monospace'],
  group: 'Code',
  category: 'Content',
  description:
    'Inline code element with a monospace font and muted background. Use it for short code references within prose.',
  usage: {
    description:
      'Code marks short inline references such as function names, variables, file paths, and command-line flags. Use CodeBlock for standalone or multi-line snippets.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use Code for short technical terms inside prose, such as a function name, prop, file path, or command-line flag.',
      },
      {
        guidance: true,
        description:
          "Set size to 'inherit' when inline code should match the surrounding text size and line height.",
      },
      {
        guidance: false,
        description:
          'Use Code for multi-line or standalone snippets. Use CodeBlock instead so readers get appropriate block formatting and syntax support.',
      },
      {
        guidance: false,
        description:
          'Use Code as an interactive copy or navigation control. Pair it with the appropriate Button or Link when an action is required.',
      },
    ],
    anatomy: [
      {
        name: 'Container',
        required: true,
        description:
          'The semantic code element that contains the inline code content and paints the background, typography, padding, and radius.',
      },
    ],
  },
  playground: {
    defaults: {
      children: 'const count = 0',
    },
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'The inline code content.',
      required: true,
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'inherit'",
      description:
        "Text color. Use 'inherit' to take the surrounding text color.",
      default: "'primary'",
    },
    {
      name: 'size',
      type: "'inherit'",
      description:
        "Set to 'inherit' to take the surrounding font size and line height. Omit it to use the code type-scale size.",
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLElement>',
      description: 'Ref forwarded to the semantic code element.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization. Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'CSS class name for the root element. Prefer xstyle for styling.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        'Inline styles for the root element. Prefer xstyle for StyleX-optimized styling.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: 'Test selector for automated testing frameworks.',
    },
  ],
  theming: {
    targets: [{className: 'astryx-code', visualProps: ['color', 'size']}],
  },
}
```
