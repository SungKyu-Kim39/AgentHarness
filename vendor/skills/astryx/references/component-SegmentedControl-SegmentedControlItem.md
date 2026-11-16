# Astryx component reference: SegmentedControl/SegmentedControlItem.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/SegmentedControl/SegmentedControlItem.doc.mjs. Original SHA-256: 8bcf352c4616afa30ddb3689260d39bc637b0a08421a0cfc33c0abb8d7af551e.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'SegmentedControlItem',
  subComponentOf: 'SegmentedControl',
  displayName: 'Segmented Control Item',
  isHiddenFromOverview: true,
  description: 'Individual segment item rendering as a radio button within the segmented control.',
  // SegmentedControlItem requires SegmentedControl context; wrap it so the preview doesn't throw.
  playground: {
    defaults: {value: 'item-1', label: 'Item'},
    wrapper: {
      component: 'SegmentedControl',
      props: {value: 'item-1', label: 'Segmented control'},
    },
  },
  props: [
    {
      name: 'value',
      type: 'string',
      description: 'Unique value for this segment, matched against the parent value.',
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for this segment. Rendered as visible text unless isLabelHidden is true.',
      required: true,
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description: 'Whether the label is visually hidden. When true, only the icon is displayed and label is used as aria-label.',
      default: 'false',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Icon element displayed before the label.',
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
      name: 'isDisabled',
      type: 'boolean',
      description: "Whether this individual item is disabled. A disabled selected item keeps the control's Tab stop.",
      default: 'false',
    },
  ],
}
```
