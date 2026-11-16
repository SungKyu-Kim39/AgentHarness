# Astryx component reference: TabList/TabMenu.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/TabList/TabMenu.doc.mjs. Original SHA-256: 09bdc7e7c76d2e68b327f132a6175218e6bb38a8f08ac364064f69660e2ee654.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'TabMenu',
  subComponentOf: 'TabList',
  displayName: 'Tab Menu',
  isHiddenFromOverview: true,
  description: "Overflow menu trigger that opens a dropdown of additional tab options, showing the selected option's label as the trigger text. Host attributes and DOM event handlers (id, aria-*, data-*, drag and drop) reach the trigger button, not the popup or its options. The button keeps its role, tab stop, and menu disclosure attributes.",
  // TabMenu requires TabList context; wrap it so the preview doesn't throw.
  // The wrapper value matches none of the options, so the trigger shows its
  // own label (the idle overflow state).
  playground: {
    defaults: {
      label: 'More',
      options: [
        {value: 'settings', label: 'Settings'},
        {value: 'integrations', label: 'Integrations'},
        {value: 'billing', label: 'Billing'},
      ],
    },
    wrapper: {component: 'TabList', props: {value: 'overview'}},
  },
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Label for the trigger button (shown when no option is selected) and the dropdown heading divider.',
      required: true,
    },
    {
      name: 'options',
      type: 'TabMenuOption[]',
      description: 'Array of menu options rendered in the dropdown.',
      required: true,
    },
  ],
}
```
