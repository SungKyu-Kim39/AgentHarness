# Astryx component reference: hooks/useInteractiveRole.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/hooks/useInteractiveRole.doc.mjs. Original SHA-256: 44681a15258cdc3a14abcd6fffbfdf2797a35acb7bfbc75028eb8bccedd55d2b.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useInteractiveRole',
  displayName: 'useInteractiveRole',
  keywords: [
    'role',
    'polymorphic',
    'link',
    'button',
    'inert',
    'href',
    'onClick',
    'element type',
    'as',
    'trigger',
    'semantics',
    'accessibility',
    'a11y',
  ],
  params: [
    {
      name: 'options',
      type: 'UseInteractiveRoleOptions',
      description: 'The interactivity inputs the component received.',
      required: true,
    },
    {
      name: 'options.href',
      type: 'string',
      description:
        'URL for navigation. Highest priority: with an href the component is a link.',
    },
    {
      name: 'options.onClick',
      type: '((...args: never[]) => unknown) | null',
      description:
        'Click handler. Resolves to a button, ahead of any context-provided role.',
    },
    {
      name: 'options.isDisabled',
      type: 'boolean',
      description:
        'When true, href is ignored for role resolution (a disabled link is an anti-pattern), so the role comes from onClick, then context, then inert.',
      default: 'false',
    },
  ],
  returns: [
    {
      name: 'role',
      type: "'link' | 'button' | 'inert'",
      description:
        'The element the component should render: an anchor, a button, or a non-interactive span/div.',
    },
  ],
  usage: {
    description:
      'Resolves what a polymorphic component should render as, in one place: href wins, then onClick, then an interactive trigger context supplied by a parent (Popover, DropdownMenu and friends), then inert. Use it in any component that is sometimes a link, sometimes a button, and sometimes plain content; Token, Thumbnail, Item and ClickableCard all do. Because context is part of the resolution, a component built on it becomes a valid trigger for new surfaces without changing.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Switch on the returned role to pick the element, and render an anchor only for "link" so keyboard and middle-click behavior come from the platform.',
      },
      {
        guidance: true,
        description:
          'Pass isDisabled through rather than dropping the href yourself; the hook already keeps disabled links out of the tab order.',
      },
      {
        guidance: false,
        description:
          'Add another ad-hoc href/onClick precedence check in a component; new trigger contexts are added here so every consumer inherits them.',
      },
    ],
  },
  relatedComponents: ['Token', 'Thumbnail', 'Item', 'ClickableCard'],
  relatedHooks: ['useClickableContainer'],
  importPath: '@astryxdesign/core/hooks',
  category: 'interaction',
}
```
