# Astryx component reference: Field/FieldLabel.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Field/FieldLabel.doc.mjs. Original SHA-256: 859c207d1bbac76ac4c8c049c402ec1fe6f22c5d7b1bd17697d2b74d0e878aeb.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'FieldLabel',
  subComponentOf: 'Field',
  displayName: 'Field Label',
  isHiddenFromOverview: true,
  description:
    'Standalone label group for one control or a caller-labelled group, with optional supporting text, optionality indicators, icon, and tooltip.',
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Label text, always rendered for accessibility.',
      required: true,
    },
    {
      name: 'inputID',
      type: 'string',
      description: 'ID of the input this label is for.',
      required: true,
    },
    {
      name: 'labelID',
      type: 'string',
      description:
        'ID applied to the label element itself. Use it with `aria-labelledby` when `isGroupLabel` is true.',
    },
    {
      name: 'isGroupLabel',
      type: 'boolean',
      description:
        'Render a span that can name a group instead of a native label for one control.',
      default: 'false',
    },
    {
      name: 'isLabelHidden',
      type: 'boolean',
      description:
        'Visually hide the label and description while keeping both available to assistive technology.',
      default: 'false',
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description:
        'Use disabled label presentation for the associated control.',
      default: 'false',
    },
    {
      name: 'isOptional',
      type: 'boolean',
      description:
        "Show the localized optional indicator unless it matches FormLayout's default optionality.",
      default: 'false',
    },
    {
      name: 'isRequired',
      type: 'boolean',
      description:
        "Show the localized required indicator unless it matches FormLayout's default optionality.",
      default: 'false',
    },
    {
      name: 'labelIcon',
      type: 'ReactNode | IconType',
      description:
        'Icon or rendered icon content before the label text. See `astryx docs icons` for semantic names.',
    },
    {
      name: 'labelTooltip',
      type: 'string',
      description:
        'Help text for an info button after the label, named "About {label}". Hover and keyboard focus preview it; a tap, click, Enter, or Space opens it and never focuses or toggles the control.',
    },
    {
      name: 'description',
      type: 'ReactNode',
      description:
        "Supporting content displayed below the label and kept separate from the control's accessible name.",
    },
    {
      name: 'descriptionID',
      type: 'string',
      description:
        'ID applied to the supporting description for caller-owned `aria-describedby` wiring.',
    },
    {
      name: 'ref',
      type: 'React.Ref<HTMLLabelElement>',
      description:
        'Ref forwarded to the label element. Group mode currently renders a span.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles applied to the label element after its base and state styles.',
    },
    {
      name: 'className',
      type: 'string',
      description: 'CSS class name appended to the label element.',
    },
    {
      name: 'style',
      type: 'React.CSSProperties',
      description:
        'Inline styles applied to the label element after StyleX inline styles.',
    },
  ],
}
```
