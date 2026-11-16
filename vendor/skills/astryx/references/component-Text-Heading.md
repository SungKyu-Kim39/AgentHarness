# Astryx component reference: Text/Heading.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Text/Heading.doc.mjs. Original SHA-256: 7550391761894bab725c7d6ed3b5bdba2f403ef277bc19020eaf804d2f1d9a91.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Heading',
  playground: {
    defaults: {level: 1, children: 'Heading'},
  },
  subComponentOf: 'Text',
  displayName: 'Heading',
  description:
    'Semantic heading component that renders h1-h6 elements with themed styling, themed sizing via type scale tokens, and line-clamp truncation.',
  theming: {
    targets: [
      {
        className: 'astryx-heading',
        visualProps: ['level', 'color', 'type', 'weight'],
      },
    ],
  },
  props: [
    {
      name: 'level',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description:
        'Heading level. Determines the semantic HTML element (h1-h6) and the visual styling from the theme (unless `type` is set).',
      required: true,
    },
    {
      name: 'type',
      type: "'display-1' | 'display-2' | 'display-3'",
      description:
        'Display type variant. Overrides the visual styling from `level` with display-scale sizing (larger, lighter weight, tighter line-height). Themes may add custom visual types. The `level` still determines the HTML element for accessibility. Use for hero banners, marketing headlines, and data callouts.',
    },
    {
      name: 'weight',
      type: "'normal' | 'medium' | 'semibold' | 'bold'",
      description:
        'Explicit font-weight override. Wins over the selected visual type or heading-level default.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Heading content.',
      required: true,
    },
    {
      name: 'accessibilityLevel',
      type: '1 | 2 | 3 | 4 | 5 | 6',
      description:
        'Accessibility level override. When set and different from `level`, applies `aria-level` so the document outline differs from the visual style.',
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'disabled' | 'placeholder' | 'accent' | 'inherit'",
      description: 'Text color. Themes may add custom colors.',
      default: "'primary'",
    },
    {
      name: 'display',
      type: "'inline' | 'block'",
      description:
        "Display type. Silently overridden to 'block' when maxLines > 0 or hasCapsize is true.",
      default: "'block'",
    },
    {
      name: 'maxLines',
      type: 'number',
      description:
        'Maximum lines before truncation. 0 means no truncation. When set, shows a tooltip on hover if content is truncated.',
      default: '0',
    },
    {
      name: 'hasTruncateTooltip',
      type: "boolean | 'above' | 'below' | 'start' | 'end'",
      description:
        "Controls tooltip behavior for truncated text. true shows the tooltip at the default position, false disables it, or a placement string ('above' | 'below' | 'start' | 'end') sets a specific position.",
      default: 'true',
    },
    {
      name: 'wordBreak',
      type: "'break-word' | 'break-all'",
      description:
        "Word break behavior when truncating. Defaults to 'break-all' for single-line truncation, 'break-word' otherwise. Without truncation, a token longer than its line (a URL, an ID) wraps (`overflow-wrap: break-word`), so in ordinary flow text does not make the page scroll sideways. Inside a flex row, give the flex child `min-width: 0` so it can shrink. A container you style with `overflow-wrap: anywhere` does not reach this text; Astryx's own containers pass their wrap through.",
    },
    {
      name: 'textWrap',
      type: "'wrap' | 'nowrap' | 'balance' | 'pretty'",
      description: 'Text wrapping behavior.',
    },
    {
      name: 'justify',
      type: "'start' | 'center' | 'end'",
      description:
        'Text alignment (justification). Uses logical values (start/end) for i18n/RTL compatibility.',
      default: "'start'",
    },
    {
      name: 'hasCapsize',
      type: 'boolean',
      description:
        'Enable optical alignment using text-box-trim. Forces block display.',
      default: 'false',
    },
    {
      name: 'hasStrikethrough',
      type: 'boolean',
      description: 'Apply strikethrough text decoration.',
      default: 'false',
    },
    {
      name: 'id',
      type: 'string',
      description: 'HTML id attribute.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles applied to the heading element. Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'CSS class name applied to the heading element.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Inline styles applied to the heading element. When `maxLines` is above 1, its line clamp replaces any `WebkitLineClamp` in `style`.',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLHeadingElement>',
      description: 'Ref forwarded to the heading element.',
    },
  ],
}
```
