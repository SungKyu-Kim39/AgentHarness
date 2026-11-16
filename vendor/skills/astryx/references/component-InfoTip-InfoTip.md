# Astryx component reference: InfoTip/InfoTip.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/InfoTip/InfoTip.doc.mjs. Original SHA-256: 24276681a98d1aadba5fe8edf4d0c1c47b666e278ecbbdc96b79d6b06e79e9d5.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'InfoTip',
  displayName: 'Info Tip',
  // Keeps the registry route InfoTip had as a canary-only Lab component.
  registry: {aliases: ['lab/info-tip']},
  category: 'Feedback & Status',
  keywords: [
    'info',
    'tooltip',
    'help',
    'hint',
    'affordance',
    'icon',
    'label',
    'field',
    'metric',
    'definition',
  ],
  props: [
    {
      name: 'content',
      type: 'ReactNode',
      description:
        "Content to display in the tooltip. Typically short, non-interactive text. Mirrors Tooltip's content prop.",
      required: true,
    },
    {
      name: 'label',
      type: 'string',
      description:
        'Accessible name for the trigger button. Defaults to the translated "More information".',
      default: "'More information'",
    },
    {
      name: 'size',
      type: "'xsm' | 'sm' | 'md' | 'lg'",
      description:
        'Size of the info icon (12px, 16px, 20px, 24px). Maps 1:1 to Icon sizes.',
      default: "'sm'",
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value, not an inline style object like style={{}}.',
    },
  ],
  usage: {
    anatomy,
    description:
      'An info icon that reveals help: a small "i" button. Hover and keyboard focus preview the help, and a click, tap, Enter, or Space pins it open until Escape, a second press, a press outside, or focus leaving. Use it next to labels, values, and metrics for permission notes, metric definitions, and field help. Its value over hand-composing Icon inside Tooltip is the pre-wired accessible trigger: a real button with an aria-label, Tab-reachable, tooltip on hover AND focus AND tap, and Escape dismissal. It follows the toggletip pattern: the button reports `aria-expanded="true"` while the help is pinned, and a screen reader hears the help once when it pins. Host `data-*` attributes reach the button; its name and disclosure attributes stay component-owned.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep tooltip content concise, plain, and non-interactive; use Popover or HoverCard for links and buttons.',
      },
      {
        guidance: true,
        description:
          'Override label when "More information" is too generic, e.g. "About this metric".',
      },
      {
        guidance: true,
        description:
          'Rely on InfoTip rather than a hand-rolled info button on touch: it pins its help on a press, so a tap, a click, Enter, or Space pins the tooltip even though the trigger is a button, and a tap outside dismisses it.',
      },
      {
        guidance: false,
        description:
          'Hand-compose Icon inside Tooltip for info affordances; the bare Icon is aria-hidden and unfocusable, so keyboard and screen-reader users never see it.',
      },
      {
        guidance: false,
        description:
          'Use InfoTip for essential information users must see to complete a task; put that text inline instead.',
      },
    ],
  },
}
```
