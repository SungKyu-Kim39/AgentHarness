# Astryx component reference: TopNav/TopNav.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/TopNav/TopNav.doc.mjs. Original SHA-256: 6bc4e3a84a3c778c4e128572bf362190e6ec888f4845f7e7207261d85ee7e715.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'TopNav',
  displayName: 'Top Nav',
  group: 'Navigation',
  category: 'Navigation',
  keywords: ["topnav","navbar","appbar","header","toolbar","navigation","menubar","topbar"],
  playground: {
    defaults: {
      label: 'Navigation',
      heading: {__element: 'TopNavHeading', props: {heading: 'My App'}},
      children: [
        {__element: 'TopNavItem', props: {label: 'Home', href: '#', isSelected: true}},
        {__element: 'TopNavItem', props: {label: 'Projects', href: '#'}},
      ],
    },
  },
  theming: {
    targets: [
      {className: 'astryx-top-nav', states: ['mode']},
      {className: 'astryx-top-nav-item', states: ['mode', 'selected']},
      {className: 'astryx-top-nav-heading'},
      {className: 'astryx-top-nav-mega-menu', states: ['mode']},
      {className: 'astryx-top-nav-mega-menu-item', states: ['mode']},
      {className: 'astryx-top-nav-mega-menu-featured-card'},
      {className: 'astryx-top-nav-menu'},
    ],
  },
  description: 'Main navigation bar container with slot-based layout. Children are accepted as an alias for startContent.',
  props: [
    {
      name: 'heading',
      type: 'ReactNode',
      description: 'Heading slot content (logo, brand): positioned at the left edge of the nav bar.',
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
            weight: 'bold',
          },
          children: 'Heading',
        },
      ],
    },
    {
      name: 'startContent',
      type: 'ReactNode',
      description: 'Start content slot for navigation items or breadcrumbs: positioned after the heading, left-aligned.',
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
      name: 'children',
      type: 'ReactNode',
      description: 'Alias for startContent. Prefer startContent when composing with heading, centerContent, or endContent; children keeps the common React nav-item pattern from silently dropping items.',
      slotElements: [
        {
          __element: 'TopNavItem',
          props: {
            label: 'Home',
            href: '#',
          },
        },
      ],
    },
    {
      name: 'centerContent',
      type: 'ReactNode',
      description: 'Center content slot (tabs, search bar, primary navigation): when provided, switches the layout to three regions that keep it at the middle of the bar while they fit one row; the bar wraps when they do not.',
      slotElements: [
        {
          __element: 'Text',
          props: {
            type: 'body',
            weight: 'bold',
          },
          children: 'Center',
        },
      ],
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description: 'End content slot for search, icons, or user profile: positioned at the right edge.',
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
      name: 'label',
      type: 'string',
      description: 'Accessible label for the navigation landmark, applied as aria-label on the <nav> element.',
      default: "'Top navigation'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}.',
    },
  ],
  components: [
    {name: 'TopNavHeading'},
    {name: 'TopNavItem'},
    {name: 'TopNavMenu'},
    {name: 'TopNavMegaMenu'},
    {name: 'TopNavMegaMenuItem'},
    {name: 'TopNavMegaMenuFeaturedCard'},
  ],
  usage: {
    description:
      'TopNav is a horizontal navigation bar for product-level navigation in application headers. Use TopNav for 5 or fewer always-visible navigation items, or minimal navigation paired with search and controls. For complex navigation hierarchies, use a sidebar; to filter content, use tabs or filter buttons instead.',
    bestPractices: [
      {guidance: true, description: 'Include a product logo and name in the heading slot to clearly identify the application.'},
      {guidance: true, description: 'Limit primary navigation items to 5 or fewer for quick scanning and minimal cognitive load.'},
      {guidance: false, description: 'Avoid using TopNav to filter page content; use Tabs or filter controls instead.'},
      {guidance: false, description: 'Avoid deeply nested navigation hierarchies; keep menus to one level of depth.'},
    ],
    anatomy: [
      {name: 'Product icon and name', required: true, description: 'Identifies the product in the navigation bar.'},
      {name: 'Navigation items', required: true, description: 'Primary links for product-level destinations.'},
      {name: 'More menu', required: false, description: 'Overflow menu for additional navigation items.'},
      {name: 'Flex area', required: false, description: 'Flexible region for search, primary action buttons, or other controls.'},
    ],
  },
}
```
