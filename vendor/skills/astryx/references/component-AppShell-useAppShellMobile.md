# Astryx component reference: AppShell/useAppShellMobile.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/AppShell/useAppShellMobile.doc.mjs. Original SHA-256: f2fb5fd4abf548ca52cb0d4485ed602450d753a141298871a4a970f2f1c6c39d.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useAppShellMobile',
  displayName: 'useAppShellMobile',
  group: 'AppShell',
  category: 'layout',
  keywords: [
    'appshell',
    'mobile nav',
    'mobile drawer',
    'hamburger',
    'navigation toggle',
    'responsive navigation',
    'drawer state',
  ],
  params: [
    // useAppShellMobile takes no arguments; it reads AppShell context.
  ],
  returns: [
    {
      name: 'isMobile',
      type: 'boolean',
      description:
        'Whether the current viewport is below the AppShell mobile navigation breakpoint. Use this to synchronize AppShell-adjacent mobile UI with the same breakpoint as mobile nav.',
    },
    {
      name: 'isMobileNavOpen',
      type: 'boolean',
      description:
        'Whether the AppShell-managed mobile navigation drawer is open.',
    },
    {
      name: 'mobileNavId',
      type: 'string | undefined',
      description:
        'DOM id of the mobile navigation drawer, set by AppShell. Point aria-controls of a custom toggle at this so screen-reader users know which element the toggle expands. Undefined outside an AppShell that manages the drawer.',
    },
    {
      name: 'toggleMobileNav',
      type: '() => void',
      description:
        'Toggle the AppShell-managed mobile navigation drawer. No-ops when mobile nav is disabled.',
    },
    {
      name: 'openMobileNav',
      type: '() => void',
      description:
        'Open the AppShell-managed mobile navigation drawer. No-ops when mobile nav is disabled.',
    },
    {
      name: 'closeMobileNav',
      type: '() => void',
      description: 'Close the AppShell-managed mobile navigation drawer.',
    },
    {
      name: 'isMobileNavEnabled',
      type: 'boolean',
      description:
        'Whether AppShell mobile navigation is enabled and managed by AppShell. False when mobileNav is false, there is no nav content, or a fully custom mobileNav ReactNode owns the drawer.',
    },
    {
      name: 'hasAutoToggle',
      type: 'boolean',
      description:
        'Whether AppShell auto-toggle behavior is enabled. False when mobileNav hasToggle is set to false; combine with isMobile and isMobileNavEnabled before rendering custom toggles.',
    },
  ],
  usage: {
    description:
      'Hook for reading and controlling AppShell mobile navigation state from descendants of AppShell. Use it for custom mobile nav triggers, closing the drawer after route changes, or coordinating AppShell-adjacent mobile experiences with the same breakpoint used by mobile nav.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use inside the AppShell tree when building custom mobile navigation controls, route-aware nav items, or UI that should update at the same breakpoint as AppShell mobile nav.',
      },
      {
        guidance: true,
        description:
          'Prefer MobileNavToggle for the standard hamburger trigger: use this hook when you need custom placement, styling, or extra behavior.',
      },
      {
        guidance: true,
        description:
          'Call closeMobileNav after a custom mobile nav item changes route so the drawer dismisses cleanly.',
      },
      {
        guidance: false,
        description:
          'Use as a general responsive primitive when the UI is not inside AppShell or does not need to align with AppShell mobile nav: use useMediaQuery instead.',
      },
      {
        guidance: false,
        description:
          'Assume it throws outside AppShell. The hook returns safe defaults and no-op callbacks when no provider is present.',
      },
    ],
  },
  relatedComponents: [
    'AppShell',
    'MobileNav',
    'MobileNavToggle',
    'TopNav',
    'SideNav',
  ],
  relatedHooks: ['useMediaQuery'],
  importPath: '@astryxdesign/core/AppShell',
}
```
