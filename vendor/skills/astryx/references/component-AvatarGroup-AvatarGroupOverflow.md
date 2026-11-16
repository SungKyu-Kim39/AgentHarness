# Astryx component reference: AvatarGroup/AvatarGroupOverflow.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/AvatarGroup/AvatarGroupOverflow.doc.mjs. Original SHA-256: f60cec2c7930f9bef2e15523ea4fe004ecde6d431d04af36c582f43ea09e84de.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'AvatarGroupOverflow',
  subComponentOf: 'AvatarGroup',
  displayName: 'Avatar Group Overflow',
  isHiddenFromOverview: true,
  description:
    'Overflow indicator for AvatarGroup. Shows a compact count for hidden avatars and can render custom count text or act as a button.',
  props: [
    {
      name: 'count',
      type: 'number',
      description:
        'The number of hidden avatars. Used for the default `+N` label and the accessible label.',
      required: true,
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Optional custom count text rendered inside the indicator. Omit to use the default `+N` label.',
    },
    {
      name: 'onClick',
      type: '() => void',
      description:
        'Callback fired when the overflow indicator is clicked. When provided, the indicator renders as a focusable button.',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLElement>',
      description: 'Ref forwarded to the overflow indicator element.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'stylex.create() value — not an inline style object.',
    },
  ],
  playground: {
    defaults: {
      count: 2,
      children: '+2',
    },
  },
  usage: {
    description:
      'AvatarGroupOverflow appears at the end of an AvatarGroup to summarize people who are not shown individually. Use it when a group is sliced to a small number of visible avatars but the hidden count still matters.',
    bestPractices: [
      {guidance: true, description: 'Pass the real hidden count to `count` so the accessible label matches the visible indicator.'},
      {guidance: true, description: 'Use short custom text such as `+12` or `99+`. The indicator is circular for short counts and grows into a pill for wider counts so the number always fits.'},
      {guidance: true, description: 'Provide `onClick` when the overflow opens a member list, popover, or detail view.'},
      {guidance: false, description: 'Do not pass custom text that disagrees with `count`; `count` continues to provide the accessible label.'},
      {guidance: false, description: 'Do not use long labels inside the indicator; place longer participant details next to the group instead.'},
    ],
    anatomy: [
      {name: 'Count label', required: true, description: 'The compact `+N` or custom count text displayed inside the circular indicator.'},
      {name: 'Button behavior', required: false, description: 'When `onClick` is provided, the indicator becomes an interactive button with focus and hover states.'},
    ],
  },
  examples: [
    {
      label: 'Default overflow count',
      code: `
<AvatarGroup size="lg">
  {users.slice(0, 3).map(user => (
    <Avatar key={user.id} src={user.src} name={user.name} />
  ))}
  <AvatarGroupOverflow count={users.length - 3} />
</AvatarGroup>
`,
    },
    {
      label: 'Custom count text',
      code: `
<AvatarGroup size="lg">
  {users.slice(0, 3).map(user => (
    <Avatar key={user.id} src={user.src} name={user.name} />
  ))}
  <AvatarGroupOverflow count={12}>12+</AvatarGroupOverflow>
</AvatarGroup>
`,
    },
  ],
}
```
