# Astryx component reference: AvatarGroup/AvatarGroup.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/AvatarGroup/AvatarGroup.doc.mjs. Original SHA-256: 1eb9d9f177877ffae4f0c1c08ba335ea90c11936eb40e4a08d9eb696926fc131.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'AvatarGroup',
  displayName: 'Avatar Group',
  group: 'Avatar',
  category: 'Content',
  keywords: ['avatar', 'group', 'facepile', 'stack', 'overlap', 'participants', 'assignees', 'members', 'team'],
  usage: {
    description:
      'AvatarGroup displays multiple avatars in an overlapping row with an optional overflow indicator. Uses a compositional API: pass Avatar children directly so each avatar can carry its own props (status dots, click handlers, etc.).',
    bestPractices: [
      {guidance: true, description: 'Slice the list yourself and pass only the avatars you want visible; 3-5 is typical. The group renders exactly the children it is given and never slices for you.'},
      {guidance: true, description: 'Use AvatarGroupOverflow for custom overflow content like a popover trigger or "add member" button.'},
      {guidance: true, description: 'Pass status dots, click handlers, or tooltips directly on each Avatar child.'},
      {guidance: true, description: 'Wrap an Avatar child in HoverCard or Tooltip to show more on hover; the avatars still overlap. Set tooltip={false} on the wrapped Avatar so its built-in name tooltip does not compete.'},
      {guidance: true, description: 'Make avatars interactive with href or onClick to link to profiles. Interactive avatars share a single Tab stop; arrow keys move between them, and the group announces a keyboard hint to assistive tech. This follows the WAI-ARIA APG roving tabindex technique for managing focus in a composite: https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex'},
      {guidance: false, description: "Don't nest AvatarGroups; use a single group with all avatars."},
      {guidance: false, description: "Don't set size on the child avatars. The group's size wins over each child's own size prop, including when the group leaves size at its default, so a child's size is silently ignored inside a group."},
    ],
    anatomy: [
      {name: 'Avatar children', required: true, description: 'Avatar elements that form the overlapping row. Each can have its own props.'},
      {name: 'Overflow indicator', required: false, description: 'A "+N" circle at the end showing hidden count, or a custom AvatarGroupOverflow slot.'},
    ],
  },
  theming: {
    targets: [
      {className: 'astryx-avatar-group', visualProps: ['size', 'shape']},
      {className: 'astryx-avatar-group-overflow', visualProps: ['size', 'shape']},
    ],
  },
  description: 'Stacked avatar display with overlapping layout and optional overflow indicator. Children are Avatar elements.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'Avatar children, optionally followed by one AvatarGroupOverflow. Consumers handle slicing to the desired visible count.',
      required: true,
      slotElements: [
        {
          __element: 'Avatar',
          props: {
            name: 'User',
          },
        },
      ],
    },
    {
      name: 'size',
      type:
        "'xsm' | 'sm' | 'md' | 'lg' | 'xl' | 16 | 20 | 24 | 32 | 36 | 40 | 48 | 60 | 64 | 72 | 96 | 128 | 144 | 180",
      description:
        "Size applied to all avatars: named sizes are 'xsm' (20px), 'sm' (24px), 'md' (36px), 'lg' (48px), and 'xl' (128px); numeric sizes must be one of the pixel values listed in the type. The group's size always overrides each child Avatar's size, including when the group uses its default size.",
      default: "'md'",
    },
    {
      name: 'shape',
      type: "'circle' | 'rounded' | 'square'",
      description: "Shape applied to all avatars via context, overriding each avatar's own shape prop. Also applied to AvatarGroupOverflow's \"+N\" indicator.",
      default: "'circle'",
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLDivElement>',
      description: 'Ref forwarded to the root element.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: 'Test selector for automated testing frameworks.',
    },
  ],
  components: [
    {name: 'AvatarGroupOverflow'},
  ],
}
```
