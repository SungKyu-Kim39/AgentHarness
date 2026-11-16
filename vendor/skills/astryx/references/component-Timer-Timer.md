# Astryx component reference: Timer/Timer.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Timer/Timer.doc.mjs. Original SHA-256: 28a76089ba5ada99b2775ecda5e02588071ca391964af5e840a1897c136c1a92.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Timer',
  displayName: 'Timer',
  category: 'Content',
  keywords: [
    'timer',
    'elapsed',
    'duration',
    'seconds',
    'minutes',
    'hours',
    'stopwatch',
    'waiting',
    'loading',
    'processing',
  ],
  props: [
    {
      name: 'startTime',
      type: 'number',
      description:
        "Unix time in milliseconds when the measured operation began. Omit it to start from this Timer's mount.",
    },
    {
      name: 'format',
      type: "'elapsed' | 'clock'",
      description:
        'Standard duration representation. Elapsed uses compact units and drops seconds after one hour; clock uses m:ss or h:mm:ss.',
      default: "'elapsed'",
    },
    {
      name: 'type',
      type: "'body' | 'large' | 'label' | 'supporting' | 'code' | 'display-1' | 'display-2' | 'display-3' | 'inherit'",
      description:
        'Semantic text type. Uses the same typography behavior as Timestamp.',
      default: "'supporting'",
    },
    {
      name: 'size',
      type: "'4xs' | '3xs' | '2xs' | 'xsm' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'",
      description: 'Explicit font size override. Overrides the size from type.',
    },
    {
      name: 'color',
      type: "'primary' | 'secondary' | 'disabled' | 'placeholder' | 'accent' | 'inherit'",
      description: 'Text color.',
      default: "'secondary'",
    },
    {
      name: 'weight',
      type: "'normal' | 'medium' | 'semibold' | 'bold'",
      description: 'Font weight override.',
    },
    {
      name: 'xstyle',
      type: 'StyleXStyles',
      description:
        'StyleX styles for the Text wrapper. Must be a stylex.create() value.',
    },
    {
      name: 'className',
      type: 'string',
      description:
        'CSS class name for the Text wrapper. Prefer xstyle for styling.',
    },
    {
      name: 'style',
      type: 'CSSProperties',
      description:
        'Inline styles for the Text wrapper. Prefer xstyle for styling.',
    },
  ],
  examples: [
    {
      label: 'Elapsed duration',
      code: '<Timer />',
    },
    {
      label: 'Stopwatch clock',
      code: '<Timer format="clock" />',
    },
    {
      label: 'Operation that started before mount',
      code: '<Timer startTime={operationStartedAt} />',
    },
    {
      label: 'Match surrounding text',
      code: `<Text>
  Processing for <Timer type="inherit" color="inherit" />
</Text>`,
    },
    {
      label: 'Prominent elapsed time',
      code: '<Timer type="body" size="lg" color="primary" weight="semibold" />',
    },
  ],
  theming: {
    targets: [{className: 'astryx-timer'}],
  },
  usage: {
    anatomy,
    description:
      'Displays a standardized elapsed duration for active work without scheduling a React render on every tick. Elapsed format updates by second below one hour and by minute after one hour; clock format remains second-precise.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use elapsed for compact duration text that may span seconds, minutes, or hours.',
      },
      {
        guidance: true,
        description:
          'Use clock for stopwatch-like surfaces where seconds remain meaningful after an hour.',
      },
      {
        guidance: true,
        description:
          'Pass startTime when the operation began before Timer mounted so the display reflects the complete wait.',
      },
      {
        guidance: false,
        description:
          'Do not use Timer for dates, time zones, or relative calendar language; use Timestamp instead.',
      },
      {
        guidance: false,
        description:
          'Do not add aria-live unless hearing an announcement every tick is appropriate for the specific task.',
      },
    ],
  },
}
```
