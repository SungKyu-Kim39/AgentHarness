# Astryx component reference: Chat/ChatComposerDrawer.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Chat/ChatComposerDrawer.doc.mjs. Original SHA-256: 164a94b429c5823e5e9b84e1135a418978ec293be1515283003190ba6c7b5770.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'ChatComposerDrawer',
  subComponentOf: 'Chat',
  displayName: 'Chat Composer Drawer',
  isHiddenFromOverview: true,
  description: "Collapsible drawer panel that sits above the chat input inside ChatComposer. Pass it to the composer's `drawer` slot to show attachments, context chips, or any supplementary content. When `count` is provided the drawer gains a collapse toggle: collapsed state shows the default Badge and label or caller-provided `collapsedSummary`, while expanded state shows all children.",
  usage: {
    description:
      'Use ChatComposerDrawer in the ChatComposer drawer slot for supplementary content such as attachments, context chips, or previews. Provide count only when people should be able to collapse that content.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Give label a concrete plural noun such as "Attachments" so the expand and collapse actions have a useful accessible name.',
      },
      {
        guidance: true,
        description:
          'Use controlled isCollapsed with onCollapsedChange when another part of the page owns drawer state; otherwise use defaultIsCollapsed.',
      },
      {
        guidance: false,
        description:
          'Put primary composer actions in the drawer; use ChatComposer footer or send-action slots so those controls remain available when the drawer is collapsed.',
      },
    ],
    anatomy: [
      {
        name: 'Root surface',
        required: true,
        description: 'The drawer surface that composes above the ChatComposer body.',
      },
      {
        name: 'Disclosure toggle',
        required: false,
        description: 'The keyboard- and pointer-operable collapse control rendered when count is provided.',
      },
      {
        name: 'Collapsed summary',
        required: false,
        description: 'The default count Badge and label, or caller-provided visual content, presented while the drawer is collapsed.',
      },
      {
        name: 'Content area',
        required: true,
        description: 'The caller-provided supplementary content; collapsed descendants are unavailable to keyboard and assistive technology.',
      },
    ],
  },
  theming: {
    targets: [
      {
        className: 'astryx-chat-composer-drawer',
        visualProps: ['collapsed'],
      },
    ],
  },
  playground: {
    wrapper: {component: 'Stack', props: {width: 480}},
    defaults: {
      count: 3,
      label: 'Attachments',
      children: [
        {__element: 'Token', props: {label: 'design-spec.pdf'}},
        {__element: 'Token', props: {label: 'api-schema.json'}},
        {__element: 'Token', props: {label: 'screenshot.png'}},
      ],
    },
  },
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Content to render inside the drawer: tokens, chips, previews, or any React elements.',
      required: true,
    },
    {
      name: 'count',
      type: 'number',
      description: 'Total item count shown in the collapsed badge. When provided, the drawer gains a collapse/expand toggle.',
    },
    {
      name: 'label',
      type: 'string',
      description: 'Label shown next to the count in the default collapsed summary and used to name the expand/collapse action.',
      default: "'Items'",
    },
    {
      name: 'collapsedSummary',
      type: 'ReactNode',
      description: 'Visual content for the complete Collapsed summary anatomy part. When count enables collapse, this replaces the default neutral Badge and label while the component retains disclosure behavior and accessible naming.',
    },
    {
      name: 'isCollapsed',
      type: 'boolean',
      description: 'Controlled collapsed state. Use with `onCollapsedChange` for external control.',
    },
    {
      name: 'defaultIsCollapsed',
      type: 'boolean',
      description: 'Initial collapsed state for uncontrolled usage.',
      default: 'false',
    },
    {
      name: 'onCollapsedChange',
      type: '(isCollapsed: boolean) => void',
      description: 'Callback fired when the user toggles the drawer.',
    },
  ],
}
```
