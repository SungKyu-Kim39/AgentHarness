# Astryx component reference: Selector/SelectorOption.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Selector/SelectorOption.doc.mjs. Original SHA-256: 18845e8689c89f11885f3a26478d219027aeac6c63f22fe31c6cbaac0c3184cd.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'SelectorOption',
  subComponentOf: 'Selector',
  displayName: 'Selector Option',
  isHiddenFromOverview: true,
  description:
    'Helper component for custom item rendering inside an Selector renderOption prop.',
  props: [
    {
      name: 'label',
      type: 'ReactNode',
      description: 'Primary label text for the item.',
      required: true,
    },
    {
      name: 'icon',
      type: 'IconType',
      description:
        'Icon displayed before the label. See `astryx docs icons` for valid semantic names.',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description: 'Secondary description text displayed below the label.',
    },
    {
      name: 'layout',
      type: "'stacked' | 'inline'",
      description:
        "How the label and description sit together. 'stacked' puts the description on its own line; 'inline' keeps both on one line so the row fits a fixed-height host. Inside a Selector trigger the trigger's padding sizes itself to whichever layout you pick, so both land on the 4px rhythm; an InputGroup pins the row height and forces 'inline'.",
      default: "'stacked'",
    },
    {
      name: 'endContent',
      type: 'ReactNode',
      description:
        'Additional content rendered after the label and description.',
    },
  ],
}
```
