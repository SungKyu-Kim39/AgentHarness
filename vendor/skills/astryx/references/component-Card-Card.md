# Astryx component reference: Card/Card.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Card/Card.doc.mjs. Original SHA-256: 96665072fa7afc90b634cd812cef70a4313f13e5b23f4c24690206691938161d.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Card',
  displayName: 'Card',
  group: 'Card',
  category: 'Container',
  keywords: ["card","surface","panel","container","elevated","shadow","box","paper","tile","well"],
  usage: {
    description:
      'Card is a bordered, elevated container for discrete, self-contained items: things you could reorder, remove, or interact with independently. Cards are NOT the default layout tool. Most content groups don\'t need a container at all; spacing and alignment create visual grouping naturally. Only reach for a Card when items need clear interaction boundaries or visual comparison in a grid.',
    bestPractices: [
      {guidance: true, description: 'Ask "could I reorder or remove this independently?" If yes, it\'s a card. If no, it\'s just a section of the page: use a heading + Stack or Section.'},
      {guidance: true, description: 'Use cards for discrete items: a single user profile, a single notification, a single metric, a product in a grid. Each card represents one "thing" with clear interaction boundaries.'},
      {guidance: true, description: 'Spacing and alignment alone create visual grouping. Not everything needs a container; try removing the card and see if the grouping is still clear from whitespace and typography.'},
      {guidance: true, description: 'Keep padding consistent across sibling cards so they align visually in a grid or list.'},
      {guidance: true, description: 'Pair a card with Layout when you need a structured header, scrollable content, and footer with actions.'},
      {guidance: true, description: 'Let cards share a row or grid on a phone: a card shrinks to fit its track and clips content that cannot wrap at its edge. Truncate long IDs, hashes, and URLs with Text maxLines={1} (the full value shows in a tooltip), and give wide content its own scroll region: Table scrolls by itself; put code or other wide content in a ScrollableArea.'},
      {guidance: false, description: 'Default to cards for visual grouping. A heading + Stack with proper spacing creates hierarchy without adding borders everywhere. Cards should be the exception, not the default.'},
      {guidance: false, description: 'Wrap page sections in cards. "General Settings", "Notification Preferences", form groups: these are page regions, use Section or heading + stack.'},
      {guidance: false, description: 'Create identical card grids (icon + heading + text, repeated). Vary the layout or question whether cards are needed at all.'},
      {guidance: false, description: 'Nest cards inside other cards; flatten the hierarchy or use spacing and dividers instead.'},
      {guidance: false, description: 'Use color variants for status; use Banner or Badge for that. Color cards are for categorization.'},
    ],
    anatomy: [
      {name: 'Container', required: true, description: 'The outer box with border, background, border-radius, and padding.'},
      {name: 'Content', required: true, description: 'Any children rendered inside the card. Often a stack of heading, text, and actions.'},
    ],
  },
  props: [
    {
      name: 'width',
      type: 'SizeValue',
      description: 'Width of the card (number = pixels, string = used as-is). In a flex row or grid track this is the preferred width: the card shrinks below it when the row is narrower. To hold the width in a flex row, wrap the card in StackItem (static by default) and let the row wrap or scroll. In Grid, set a consumer minWidth on the Card and size the track accordingly.',
    },
    {
      name: 'height',
      type: 'SizeValue',
      description: 'Height of the card (number = pixels, string = used as-is).',
    },
    {
      name: 'maxWidth',
      type: 'SizeValue',
      description: 'Maximum width of the card.',
    },
    {
      name: 'minHeight',
      type: 'SizeValue',
      description: 'Minimum height of the card.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content to render inside the card.',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        "Internal padding using the spacing scale. Omit it and the card takes the theme's card padding rather than a step, so passing a step is a decision to override the theme, not a way to restate the default.",
      default: "the theme's card padding (spacing step 4 with no theme)",
    },
    {
      name: 'variant',
      type: "'default' | 'transparent' | 'muted' | 'blue' | 'cyan' | 'gray' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'",
      description:
        'Background color variant. `default` uses the standard card background. `transparent` drops the background entirely. `muted` uses the muted background for de-emphasised cards. The non-semantic variants use the corresponding `--color-background-<name>` token.',
      default: "'default'",
    },
    {
      name: 'elevation',
      type: "'none' | 'low' | 'med' | 'high'",
      description:
        'Resting shadow depth. `none` is flat; `low`/`med`/`high` map to the shadow token scale. Raise a card only when it needs to float above surrounding content.',
      default: "'none'",
    },
  ],
  examples: [
    {
      label: 'Cards sharing a row on a phone, with long IDs',
      code: `
import {Card} from '@astryxdesign/core/Card';
import {Grid} from '@astryxdesign/core/Grid';
import {VStack} from '@astryxdesign/core/VStack';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';

const payouts = [
  {label: 'Payout', amount: '$1,240.00', id: 'po_1Q8ZK4X7M2N5P3R6T9V1W4YB'},
  {label: 'Refund', amount: '-$86.50', id: 're_3NfK9Lm2Qx7Vb4Tz8Rw1Hy6C'},
  {label: 'Adjustment', amount: '$12.00', id: 'adj_7Hq2Wm9Kx4Lz8Vn3Rb6Tf1PD'},
];

// Each card takes one grid track and shrinks with it, so three cards fit a
// 390px phone without widening the page. The ID cannot wrap, so it truncates
// with maxLines={1} (the full value shows in a tooltip) instead of running
// past the card edge.
function PayoutCards() {
  return (
    <Grid columns={3} gap={3}>
      {payouts.map(payout => (
        <Card key={payout.id}>
          <VStack gap={1}>
            <Heading level={3}>{payout.label}</Heading>
            <Text hasTabularNumbers>{payout.amount}</Text>
            <Text type="supporting" maxLines={1}>
              {payout.id}
            </Text>
          </VStack>
        </Card>
      ))}
    </Grid>
  );
}
`,
    },
  ],
  playground: {
    defaults: {
      children: {
        __element: 'VStack',
        props: {gap: 2},
        children: [
          {__element: 'Heading', props: {level: 3}, children: 'Card Title'},
          {__element: 'Text', props: {type: 'body'}, children: 'Card content goes here. This is a standard card with a heading and body text.'},
        ],
      },
    },
  },
  theming: {
    container: true,
    targets: [
      {className: 'astryx-card', visualProps: ['variant', 'elevation']},
    ],
    vars: [
      {name: '--_card-radius', description: 'Border radius of the card', default: 'var(--radius-container)', private: true},
      {name: '--_card-elevation', description: 'Resting shadow of the card, set from the elevation prop. Composed into the card box-shadow list alongside --_card-ring rather than written as boxShadow directly, so a ring and an elevation can coexist.', default: '0 0 transparent', private: true},
      {name: '--_card-ring', description: 'Inset ring drawn in the card box-shadow list. SelectableCard sets it to show selection without taking over the shadow.', default: '0 0 transparent', private: true},
    ],
    derived: [
      {property: 'borderRadius', vars: ['--_card-radius']},
      {property: 'padding', expand: 'container'},
    ],
  },
}
```
