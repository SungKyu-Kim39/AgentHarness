# Astryx component reference: FormLayout/FormLayout.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/FormLayout/FormLayout.doc.mjs. Original SHA-256: ef055a8659f6fffb98449d765b0dbd759df7f74f31db7515bf922a945b7088c2.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'FormLayout',
  displayName: 'Form Layout',
  group: 'Layout',
  category: 'Layout',
  keywords: [
    'formlayout',
    'form',
    'fieldset',
    'formgroup',
    'formcontainer',
    'fields',
    'vertical',
    'horizontal',
  ],
  props: [
    {
      name: 'direction',
      type: "'vertical' | 'horizontal' | 'horizontal-labels'",
      description:
        'Controls field arrangement. Vertical stacks top-to-bottom, horizontal uses one fractional grid track per field in logical inline order, and horizontal-labels uses CSS Grid with labels beside inputs on the inline-start side (collapsing to vertical when the viewport is <=480px).',
      default: "'vertical'",
    },
    {
      name: 'defaultOptionality',
      type: "'optional' | 'required'",
      description:
        'The state the form treats as its default, so only the exception shows an optional/required indicator. With "optional", only fields marked isRequired show an indicator; with "required", only fields marked isOptional do. A field that restates the default shows nothing. Under "required" the unmarked fields also expose aria-required so screen readers match the visual default; aria-required only, never the native required attribute. CheckboxInput, Switch and CheckboxList are the exception: an unchecked box, an off switch or an empty group is an answer, so they take no required state from the default. A CheckboxInput or Switch is required only through its own isRequired. Leave unset for today\'s per-field behavior.',
    },
    {
      name: 'defaultEntryErrorBehavior',
      type: "'complete' | 'blur-or-enter'",
      description:
        "When DateInput, DateTimeInput, TimeInput, and NumberInput fields in the layout show their own entry errors: a date, time, or number the field rejects. It sets when the error shows, not when validation runs, so it is not React Aria's validationBehavior (native versus ARIA validation), and it never changes a caller status. 'complete' shows each error at the field's own moment. 'blur-or-enter' holds the message, aria-invalid, the invalid styling, the announcement, and the onEntryErrorChange report until Enter or blur; an edit that makes the entry valid or empty still clears the error at once. NumberInput shows its errors only at Enter or blur under both values. A field's own entryErrorBehavior wins. A nested FormLayout replaces the default for its fields, and unset there means 'complete'. Content in a layer, such as a Dialog opened from the form, starts without it. Leave unset for 'complete'.",
    },
    {
      name: 'children',
      type: 'ReactNode',
      description:
        'Form fields to arrange. Accepts Astryx inputs (TextInput, Selector, etc.) and Field-wrapped custom controls.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],
  theming: {
    targets: [{className: 'astryx-form-layout', visualProps: ['direction']}],
  },
  usage: {
    description:
      'A layout container that arranges form fields with consistent spacing and direction. FormLayout handles where fields go, not state or submission. Wrap it in a native <form> for that; <form> has no Astryx replacement, so it stays a plain element. Supports vertical (default), horizontal, and horizontal-labels directions, and can be nested to mix them.',
    bestPractices: [
      {
        guidance: true,
        description:
          "Stack fields vertically for most forms. It's the easiest to scan top to bottom.",
      },
      {
        guidance: true,
        description:
          'Nest a horizontal FormLayout inside a vertical one when fields naturally pair up, like First Name + Last Name or City + State + ZIP.',
      },
      {
        guidance: true,
        description:
          'Use horizontal-labels for settings pages where labels sit beside their inputs.',
      },
      {
        guidance: false,
        description:
          "Use FormLayout for form state or submission. It's just layout. Wrap it in a native <form> for that.",
      },
      {
        guidance: false,
        description:
          'Put unrelated fields side by side in a horizontal layout. Save it for fields that belong together.',
      },
      {
        guidance: false,
        description:
          'Nest horizontal-labels inside another FormLayout. It uses CSS Grid and needs to be the outermost container.',
      },
    ],
    anatomy: [
      {
        name: 'Layout container',
        required: true,
        description:
          'Owns field arrangement, spacing, direction, and form-level optionality.',
      },
      {
        name: 'Form title',
        required: false,
        description: 'Heading that describes the purpose of the form.',
      },
      {
        name: 'Fields',
        required: true,
        description: 'Input components with labels for collecting user data.',
      },
      {
        name: 'Footer',
        required: false,
        description: 'Contains confirmation buttons such as Submit or Cancel.',
      },
    ],
  },
}
```
