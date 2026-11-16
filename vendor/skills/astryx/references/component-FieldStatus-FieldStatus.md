# Astryx component reference: FieldStatus/FieldStatus.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/FieldStatus/FieldStatus.doc.mjs. Original SHA-256: 85f1570bfe8d4e7875daea64a87f2ee6388fb00940b4d2d7dec15a4fbbcdba8f.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'FieldStatus',
  displayName: 'Field Status',
  group: 'Field',
  category: 'Form Controls',
  isHiddenFromOverview: true,
  description:
    'Status message component for form field validation feedback. Messages are announced to screen readers through persistent live regions (assertive for errors, polite otherwise), so conditional mounting is safe.',
  theming: {
    targets: [
      {className: 'astryx-field-status', visualProps: ['type', 'variant']},
      {className: 'astryx-field-status-icon', visualProps: ['type']},
    ],
  },
  props: [
    {
      name: 'type',
      type: "'error' | 'warning' | 'success'",
      description: 'Status type.',
      required: true,
    },
    {
      name: 'message',
      type: 'string',
      description: 'Status message text.',
      required: true,
    },
    {
      name: 'id',
      type: 'string',
      description: 'ID for aria-describedby association.',
    },
    {
      name: 'variant',
      type: "'attached' | 'detached'",
      description:
        'Visual variant: attached overlaps the input, detached floats below.',
      default: "'attached'",
    },
  ],
  usage: {
    description:
      'FieldStatus renders validation feedback for fields and field-like controls. Use it directly for custom controls that need the same error, warning, or success presentation as Field.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use attached status below bordered inputs when the message belongs to that input.',
      },
      {
        guidance: true,
        description:
          'Use detached status for controls like checkboxes, switches, and custom controls where overlap would be visually awkward.',
      },
      {
        guidance: false,
        description:
          'Use FieldStatus for general alerts or page-level notices; use Banner or Toast instead.',
      },
      {
        guidance: true,
        description:
          "A field's status is announced when it first appears and when its message or type changes, not again when a repeated submit fails with the same errors. On such a repeated submit, with the errors unchanged, announce it once from the form with useAnnounce, for example announce(`${errors.length} errors. ${errors[0]}`, 'assertive'), and move focus to the first invalid field. On a first failed submit the fields announce their own errors, so the form adds no announcement.",
      },
    ],
    anatomy,
  },
}
```
