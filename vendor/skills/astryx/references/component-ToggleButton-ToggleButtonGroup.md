# Astryx component reference: ToggleButton/ToggleButtonGroup.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/ToggleButton/ToggleButtonGroup.doc.mjs. Original SHA-256: 9255219ea607fe5fc1c570d85a062799140cdd369df81f8ecff323296fa11b48.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'ToggleButtonGroup',
  subComponentOf: 'ToggleButton',
  displayName: 'Toggle Button Group',
  keywords: [
    'togglegroup',
    'buttontogglegroup',
  ],
  description: 'Groups toggle buttons for exclusive (single) or multi-select behavior. Uses discriminated union on type for type-safe value/onChange. Under the touch presentation a press tracks like a menu: press a toggle and slide across the others, and the highlight follows. Only the toggle you lift on toggles, and lifting outside the group toggles nothing. With a finger, each toggle\'s target grows toward 44 px, up to half the gap to a neighbour, without the toggles growing.',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      description: 'ToggleButton children. Give each member a value; the group owns its pressed state and ignores its isPressed, onPressedChange, and pressedChangeAction props. Member activation calls the group’s onChange without starting a member Action transition.',
      required: true,
      slotElements: [
        {
          __element: 'ToggleButton',
          props: {
            label: 'Option',
            value: 'option',
          },
        },
      ],
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label for the group (aria-label).',
      required: true,
    },
    {
      name: 'type',
      type: "'single' | 'multiple'",
      description: 'Selection mode. Single allows one active button, multiple allows many.',
      default: "'single'",
    },
    {
      name: 'value',
      type: 'string | null | string[]',
      description: 'Currently selected value(s). Type depends on selection mode.',
      required: true,
    },
    {
      name: 'onChange',
      type: '(value: string | null | string[]) => void',
      description: 'Called when selection changes.',
      required: true,
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      description: 'Layout direction of the button group.',
      default: "'horizontal'",
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      description: 'Default size for buttons in the group. Individual buttons can override.',
      default: "'md'",
    },
    {
      name: 'isDisabled',
      type: 'boolean',
      description: 'Whether all buttons in the group are disabled.',
      default: 'false',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description: 'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value.',
    },
    {
      name: 'data-testid',
      type: 'string',
      description: 'Test selector for automated testing frameworks.',
    },
  ],
}
```
