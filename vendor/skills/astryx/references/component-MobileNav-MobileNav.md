# Astryx component reference: MobileNav/MobileNav.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/MobileNav/MobileNav.doc.mjs. Original SHA-256: 662f9f5e41504f23653a90de66572ed1d56ed38afcc0e6840686e7b90e89b3c8.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'MobileNav',
  displayName: 'Mobile Nav',
  group: 'Navigation',
  category: 'Navigation',
  isHiddenFromOverview: true,
  keywords: [
    'mobilenav',
    'drawer',
    'sidebar',
    'navigation',
    'hamburger',
    'menu',
    'offcanvas',
    'slideout',
    'navdrawer',
    'toggle',
  ],
  components: [
    {
      name: 'MobileNav',
      displayName: 'Mobile Nav',
      description:
        'A slide-out drawer for mobile navigation. Accepts SideNav children.',
      // The drawer opens via showModal() and renders nothing while closed —
      // overlay mode gives the Properties preview an open trigger instead of
      // an empty stage (#2706). Declared on this entry (not the directory
      // doc) so MobileNavToggle does not inherit it.
      playground: {
        overlay: true,
        defaults: {
          isOpen: false,
          header: 'Navigation',
          children: {
            __element: 'SideNavSection',
            props: {title: 'Main'},
            children: [
              {
                __element: 'SideNavItem',
                props: {label: 'Dashboard', isSelected: true},
              },
              {__element: 'SideNavItem', props: {label: 'Projects'}},
              {__element: 'SideNavItem', props: {label: 'Settings'}},
            ],
          },
        },
      },
      props: [
        {
          name: 'isOpen',
          type: 'boolean',
          description:
            'Whether the drawer is open. Inside AppShell, this is managed automatically via context. Outside AppShell, provide this prop to control the drawer yourself.',
        },
        {
          name: 'onOpenChange',
          type: '(isOpen: boolean) => void',
          description:
            'Called when the drawer visibility changes (backdrop click, Escape key, or close button). Inside AppShell, this is managed automatically via context. On a phone or tablet (a coarse primary pointer), the drawer takes no tap or drag while it slides in; keys and assistive technology still act. After a close, focus returns to the element that opened it once its dialog closes.',
        },
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Drawer content: typically SideNavSection/SideNavItem, or any ReactNode.',
          required: true,
        },
        {
          name: 'header',
          type: 'ReactNode',
          description:
            'Header content for the drawer. Rendered next to the close button. Pass a string for a simple text heading, or a ReactNode for custom content (logo, search bar, etc.).',
        },
        {
          name: 'width',
          type: 'number',
          description:
            'Drawer width in pixels. Capped at 85vw to prevent overflow on small screens.',
          default: '320',
        },
        {
          name: 'side',
          type: "'start' | 'end' | 'auto'",
          description:
            'Which side the drawer slides from. Start is left in LTR, right in RTL. Auto picks a side based on the trigger position.',
          default: "'auto'",
        },
      ],
    },
    {
      name: 'MobileNavToggle',
      displayName: 'Mobile Nav Toggle',
      description:
        'Hamburger button that opens/closes the mobile nav drawer. Reads open state from AppShell context automatically: does NOT accept isOpen or onOpenChange props. Renders nothing above the mobile breakpoint. Host attributes and DOM handlers (id, data-*, aria-*) reach the button; its aria-expanded and aria-controls stay component-owned, and a caller onClick runs after the toggle.',
      // The toggle renders null unless AppShell mobile context reports an
      // enabled mobile viewport — the default context outside AppShell never
      // does, so the Properties preview was an empty stage. appShellMobile
      // has the preview simulate that context instead (#4983).
      playground: {
        appShellMobile: true,
      },
      props: [
        {
          name: 'children',
          type: 'ReactNode',
          description:
            'Custom content to render instead of the default hamburger icon.',
        },
        {
          name: 'label',
          type: 'string',
          description: 'Accessible label for the toggle button.',
          default: "'Open navigation'",
        },
      ],
    },
  ],
  theming: {
    targets: [{className: 'astryx-mobile-nav', visualProps: ['side']}],
  },
  usage: {
    anatomy,
    description:
      'A slide-out drawer for mobile navigation. MobileNav is the mobile counterpart to SideNav and accepts the same children. Use it on narrow viewports where a persistent sidebar is not practical. Inside AppShell, use MobileNavToggle as the trigger; it reads state from context automatically.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Share the same nav items between MobileNav and SideNav by extracting them into a variable.',
      },
      {
        guidance: true,
        description:
          "Provide a header when the drawer's purpose is not obvious from its content.",
      },
      {
        guidance: true,
        description:
          'Inside AppShell, use MobileNavToggle to open the drawer; it reads state from context. Do not pass isOpen/onOpenChange to the toggle.',
      },
      {
        guidance: false,
        description:
          'Use MobileNav on desktop: use a persistent SideNav instead.',
      },
    ],
  },
}
```
