# Astryx component reference: ClickableCard/ClickableCard.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/ClickableCard/ClickableCard.doc.mjs. Original SHA-256: 4024a0b5159277e1d5657c9a3b878d8ce44264bb8a417063d92d6c48d2dd683b.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'ClickableCard',
  displayName: 'Clickable Card',
  group: 'Card',
  category: 'Container',
  keywords: ['card', 'clickable', 'interactive', 'navigation', 'action', 'link'],
  usage: {
    description: 'An interactive card for navigation or action targets. Nested interactive elements work independently.',
    bestPractices: [
      {guidance: true, description: 'Use for cards that navigate to a detail page or trigger a single action.'},
      {guidance: true, description: 'Nest buttons or links freely inside; they handle their own events.'},
      {guidance: false, description: 'Use for toggling selection; use SelectableCard for that.'},
      {guidance: false, description: 'Use with a transparent variant and no padding only to borrow the press model for a surface that owns its own box. Compose the chrome-free recipe in the useClickableContainer docs instead: it adds no Card styles to the page.'},
    ],
    anatomy: [
      {name: 'Container', required: true, description: 'Interactive div with hover/focus/active states.'},
      {name: 'Content', required: true, description: 'Children, which may include nested interactive elements.'},
    ],
  },
  props: [
    {name: 'label', type: 'string', description: 'Accessibility label.', required: true},
    {name: 'onClick', type: '(event: MouseEvent) => void', description: 'Click handler: fires on card surface only.'},
    {name: 'href', type: 'string', description: 'Navigation URL. Plain, new-tab, Cmd/Ctrl-click, and middle-click activation all follow the shared navigation rule described on the Link `href` prop.'},
    {name: 'target', type: 'string', description: 'Link target.', default: "'_self'"},
    {name: 'isDisabled', type: 'boolean', description: 'Disables the card and removes a link destination; the card keeps its tab stop and is announced as disabled.', default: 'false'},
    {name: 'children', type: 'ReactNode', description: 'Card content.'},
    {name: 'padding', type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10', description: 'Inner padding.', default: '4'},
    {name: 'variant', type: "'default' | 'transparent' | 'muted' | 'blue' | 'cyan' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'", description: 'Background color variant.', default: "'default'"},
    {name: 'elevation', type: "'none' | 'low' | 'med' | 'high'", description: 'Resting shadow depth. Often raised to signal the whole card is clickable.', default: "'none'"},
    {name: 'width', type: 'SizeValue', description: 'Card width.'},
    {name: 'height', type: 'SizeValue', description: 'Card height.'},
    {name: 'maxWidth', type: 'SizeValue', description: 'Maximum card width.'},
    {name: 'xstyle', type: 'StyleXStyles', description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.'},
  ],
  theming: {
    container: true,
    targets: [{className: 'astryx-clickable-card', visualProps: ['variant']}],
    vars: [
      {name: '--_press-overlay', description: 'Colour of the ::after interaction overlay for the hover and mouse states: transparent at rest, the hover overlay token on hover (hover-capable pointers), the pressed overlay token while a mouse holds `:active`. A press the touch press controller paints (`data-astryx-press`) is the overlay\'s image instead, at the press\'s strength, and the colour yields to it. Set on the card element by its own interaction arms.', default: 'transparent', private: true},
    ],
  },
  playground: {
    defaults: {
      label: 'View product details',
      href: '#',
      padding: 4,
      children: {
        __element: 'XDSVStack',
        props: {gap: 1},
        children: [
          {__element: 'XDSHeading', props: {level: 3}, children: 'Wireless Headphones'},
          {__element: 'XDSText', props: {type: 'body'}, children: 'Noise-cancelling over-ear headphones with 30-hour battery life.'},
        ],
      },
    },
  },
}
```
