# Astryx component reference: Layout/Layout.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Layout/Layout.doc.mjs. Original SHA-256: 9369b3b98afb3c317e5a577f038b83e9a6bfdf126167a80eae959a0476b2d188.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Layout',
  displayName: 'Layout',
  group: 'Layout',
  category: 'Layout',
  keywords: ["layout","container","content","flex","box","wrapper","page","regions"],
  playground: {
    defaults: {
      header: {__element: 'LayoutHeader', props: {}, children: {__element: 'Heading', props: {level: 3}, children: 'Page Title'}},
      content: {__element: 'LayoutContent', props: {}, children: {__element: 'Text', props: {type: 'body', color: 'secondary'}, children: 'Main content area. This is the scrollable center section of the layout.'}},
      footer: {__element: 'LayoutFooter', props: {}, children: {__element: 'Text', props: {type: 'supporting', color: 'secondary'}, children: 'Footer: status bar or actions'}},
    },
  },
  theming: {
    targets: [
      {className: 'astryx-layout', visualProps: ['height']},
      {className: 'astryx-layout-content'},
      {className: 'astryx-layout-footer'},
      {className: 'astryx-layout-header'},
      {className: 'astryx-layout-panel'},
    ],
  },
  description: 'General five-slot layout primitive for arranging header, start, content, end, and footer regions.',
  props: [
    {
      name: 'content',
      type: 'ReactNode',
      description:
        'Content slot (center). Accepts any ReactNode; use LayoutContent when a content region is needed. Children passed to `<Layout>` render here too: `<Layout>{main}</Layout>` is shorthand for `<Layout content={main} />`.',
      slotElements: [
        {
          __element: 'LayoutContent',
          props: {},
          children: 'Content',
        },
      ],
    },
    {
      name: 'header',
      type: 'ReactNode',
      description:
        'Header slot. Accepts any ReactNode; use LayoutHeader when a header region is needed.',
      slotElements: [
        {
          __element: 'LayoutHeader',
          props: {},
          children: 'Header',
        },
      ],
    },
    {
      name: 'footer',
      type: 'ReactNode',
      description:
        'Footer slot. Accepts any ReactNode; use LayoutFooter when a footer region is needed.',
      slotElements: [
        {
          __element: 'LayoutFooter',
          props: {},
          children: 'Footer',
        },
      ],
    },
    {
      name: 'start',
      type: 'ReactNode',
      description:
        'Logical-start slot (left in LTR). Accepts any ReactNode; use LayoutPanel when a panel region is needed.',
      slotElements: [
        {
          __element: 'LayoutPanel',
          props: {},
          children: 'Panel',
        },
      ],
    },
    {
      name: 'end',
      type: 'ReactNode',
      description:
        'Logical-end slot (right in LTR). Accepts any ReactNode; use LayoutPanel when a panel region is needed.',
      slotElements: [
        {
          __element: 'LayoutPanel',
          props: {},
          children: 'Panel',
        },
      ],
    },
    {
      name: 'height',
      type: "'fill' | 'auto'",
      description:
        "Height behavior: fill the container's height or grow with content. Fill needs a container with a set height, such as AppShell's content area; under an app root with no height, the layout grows with its content.",
      default: "'fill'",
    },
    {
      name: 'contentWidth',
      type: 'SizeValue',
      description:
        'Maximum width of the aligned content within each slot (header, content, footer, panels), centered when narrower than the available space. Without panels, LayoutContent spans the available width so its scrollbar stays at the outer edge while its children align internally to contentWidth. With exactly one panel, the panel stays aligned to the contentWidth frame while LayoutContent extends to the opposite open edge. With both panels, contentWidth includes the complete middle composition. Percentage widths—including percentage-bearing calc(), min(), max(), and clamp() values—and intrinsic widths, plus bare var(...) values, retain the constrained composition; use calc(var(...)) for a variable guaranteed to resolve to a length. Dividers stay full-bleed. Numbers are treated as pixels, strings are used as-is (e.g. `60ch`). Common page widths: 640 for forms, settings, and text-focused pages; 960 for content pages and wider layouts.',
    },
    {
      name: 'padding',
      type: '0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10',
      description:
        "Padding at the layout's outer edges using the spacing scale. Applies to this Layout's own header, footer, panels, and content. A nested Layout does not inherit it: without `padding`, its regions use the enclosing Card, Section, or Dialog padding, or the default inset (spacing 4). That keeps a page Layout inside AppShell inset even though AppShell's own regions are full bleed.",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Shorthand for the content slot: `<Layout>{main}</Layout>` is the same as `<Layout content={main} />`. When both are given, `content` wins.',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: 'Ref forwarded to the root layout element.',
    },
    {
      name: 'defaultHasDividers',
      type: 'boolean',
      description:
        "Default divider visibility for LayoutHeader and LayoutFooter children. Headers and footers that don't pass `hasDivider` use this value; when unset, nested layouts inherit from their parent context.",
    },
  ],
  components: [
    {name: 'LayoutHeader'},
    {name: 'LayoutContent'},
    {name: 'LayoutFooter'},
    {name: 'LayoutPanel'},
    {name: 'Card'},
    {name: 'Section'},
  ],
  usage: {
    description:
      'Layout is a general five-slot primitive for arranging header, start, content, end, and footer regions within a page or bounded container. AppShell owns the page shell and app-wide navigation behavior; use HStack or VStack for simple directional stacking.',
    bestPractices: [
      { guidance: true, description: 'Use Layout when content needs named header, start, content, end, or footer regions.' },
      { guidance: true, description: 'Use HStack and VStack for simple directional stacking within a content area.' },
      { guidance: true, description: 'Hide a region by passing `false`, `null`, or `undefined` to its slot, for example `isOpen && <LayoutPanel />`. The slot counts as empty, so the neighbouring regions move out to the layout edge.' },
      { guidance: true, description: 'Give a region a landmark role and label on the region component when it is a page landmark, for example `<LayoutPanel role="navigation" label="Sections">`. Layout adds no role or name.' },
      { guidance: false, description: 'Use Layout for simple stacking layouts; use HStack or VStack instead.' },
      { guidance: false, description: 'Use Layout as the page shell or for app-wide navigation; use AppShell for that responsibility.' },
    ],
    anatomy,
  },
  examples: [
    {
      label: 'Page with a details panel inside AppShell',
      code: `
function OrdersPage() {
  return (
    <AppShell
      sideNav={
        <SideNav>
          <SideNavItem label="Orders" isSelected />
          <SideNavItem label="Customers" />
          <SideNavItem label="Settings" />
        </SideNav>
      }>
      {/* No padding props needed: the page Layout's regions keep their
          default inset inside AppShell's full-bleed content area. */}
      <Layout
        header={
          <LayoutHeader hasDivider>
            <Heading level={1}>Orders</Heading>
          </LayoutHeader>
        }
        end={
          <LayoutPanel
            hasDivider
            width={320}
            role="complementary"
            label="Order details">
            <VStack gap={2}>
              <Heading level={2}>Order #1042</Heading>
              <Text type="body" color="secondary">
                Shipped · 3 items · $184.00
              </Text>
            </VStack>
          </LayoutPanel>
        }
        content={
          <LayoutContent>
            <Text type="body">
              Select an order to see its shipping and payment details.
            </Text>
          </LayoutContent>
        }
      />
    </AppShell>
  );
}
`,
    },
  ],
}
```
