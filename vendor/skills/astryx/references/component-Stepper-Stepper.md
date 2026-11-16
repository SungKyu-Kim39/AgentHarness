# Astryx component reference: Stepper/Stepper.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Stepper/Stepper.doc.mjs. Original SHA-256: 7280e077248df2c47ff2f5313e27cce188c23b90297ca4ca82e87b8c9c5730f2.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Stepper',
  displayName: 'Stepper',
  category: 'Navigation',
  group: 'Stepper',
  keywords: [
    'stepper',
    'steps',
    'wizard',
    'workflow',
    'progress',
    'multi-step',
    'form wizard',
    'onboarding',
  ],
  usage: {
    description:
      'Steppers display progress through a sequence of logical and numbered steps. Use them for multi-step workflows like forms, onboarding flows, or checkout processes where users need to see their position and the steps ahead. Rendered as an ordered list (not a navigation landmark).',
    bestPractices: [
      {
        guidance: true,
        description:
          'Keep step labels short and descriptive: "Payment" not "Enter your payment information".',
      },
      {
        guidance: true,
        description:
          'Use the vertical orientation when steps carry longer descriptions. A horizontal stepper handles narrow containers itself: once the frame gives each step less than horizontalOptions.minimumStepWidth (112px by default) it drops the labels for a segmented track and uses the configured collapsedVariant beneath it.',
      },
      {
        guidance: true,
        description:
          "Set horizontalOptions.collapsedVariant to 'withLabel' when the page already supplies Back/Continue, or to 'hiddenLabel' when surrounding UI owns both the current-step heading and navigation and only a bare progress track is needed.",
      },
      {
        guidance: true,
        description:
          'Provide onStepClick for non-linear workflows where users may need to revisit earlier steps.',
      },
      {
        guidance: true,
        description:
          'Use status only to apply a semantic color (accent/success/warning/error); pass a custom icon for richer indicators.',
      },
      {
        guidance: false,
        description:
          'Use a stepper for fewer than 3 steps; a simple heading or progress bar works better.',
      },
      {
        guidance: false,
        description:
          'Use more than 7 steps; consider grouping related steps or using a different pattern.',
      },
    ],
    anatomy: [
      {
        name: 'Stepper',
        required: true,
        description:
          'The ordered list holding the steps. Owns the orientation and the indicator placement the whole flow is laid out on.',
      },
      {
        name: 'Frame',
        required: true,
        description:
          'The layout frame that groups the ordered steps with the optional compact summary shown at narrow widths.',
      },
      {
        name: 'Compact summary',
        required: false,
        description:
          'The optional row a horizontal Stepper adds directly beneath the track once it is too narrow to label every step. horizontalOptions.collapsedVariant chooses a label with Previous/Next controls, the label alone, or no row for a bare progress track. The on-track layout keeps its indicators on the rail instead of repeating the active indicator beside the label. Every step keeps its name in the accessible sequence at any width.',
      },
      {
        name: 'Step',
        required: true,
        description:
          'One step in the flow, and the element carrying its status. Wraps the indicator, label, description, and the track segments belonging to it.',
      },
      {
        name: 'Progress bar',
        required: true,
        description:
          'A 4px segmented bar per step. Filled for completed and active steps. Advancing one step grows the fill along the track it just covered, so the movement reads as progress rather than a bar changing color. Every other change applies at once: going back, jumping forward by more than one step, mounting mid-flow, and any change at all under prefers-reduced-motion. Where a span is drawn by more than one segment (the on-track layouts split it between two steps, three when a content slot sits between them), the segments run in track order at one constant speed, so the fill reads as a single line growing rather than pieces lighting in turn.',
      },
      {
        name: 'Connector',
        required: false,
        description:
          'The track drawn between indicators in the on-track layouts. Each connector paints an unfilled line and, over it, the accent fill covering the progress made. How many pieces a connector is drawn from is an implementation detail of the layout, not a themeable part; use --step-connector-gap to hold the track off the indicator.',
      },
      {
        name: 'Indicator',
        required: false,
        description:
          'A numbered badge, a check, or any custom icon. Controlled via the indicator prop.',
      },
      {
        name: 'Label',
        required: true,
        description: 'Text identifying the step.',
      },
      {
        name: 'Description',
        required: false,
        description: 'Supporting text below the label with additional context.',
      },
    ],
  },
  theming: {
    targets: [
      {
        className: 'astryx-stepper',
        visualProps: ['orientation', 'indicatorPosition'],
      },
      {className: 'astryx-stepper-frame'},
      {className: 'astryx-stepper-summary'},
      {className: 'astryx-step', visualProps: ['progress', 'status']},
      {
        className: 'astryx-step-indicator',
        visualProps: ['progress', 'status', 'disabled'],
      },
      {
        className: 'astryx-step-label',
        visualProps: ['progress', 'status', 'disabled'],
      },
      {
        className: 'astryx-step-description',
        visualProps: ['progress', 'status'],
      },
      {className: 'astryx-step-bar'},
      {className: 'astryx-step-connector'},
    ],
    vars: [
      {
        name: '--step-connector-gap',
        description:
          'Gap a connector leaves where it meets the indicator, spent on the side facing it. Applies to the on-track layouts, whose connector is drawn as one segment either side of the node; 0 leaves the track running unbroken through it.',
        default: '0px',
      },
    ],
  },
  components: [
    {
      name: 'Stepper',
      displayName: 'Stepper',
      description:
        'Container component that manages step state and renders steps in horizontal or vertical orientation as an ordered list.',
      props: [
        {
          name: 'activeStep',
          type: 'number',
          description:
            'Zero-based index of the currently active step. Steps before this index are marked as completed.',
          required: true,
        },
        {
          name: 'children',
          type: 'ReactNode',
          description: 'Step elements to render in the stepper.',
          required: true,
        },
        {
          name: 'orientation',
          type: "'horizontal' | 'vertical'",
          description: 'Layout direction of the stepper.',
          default: "'horizontal'",
        },
        {
          name: 'onStepClick',
          type: '(index: number) => void',
          description:
            'Called when a step is clicked or a compact summary control is used. Enables non-linear navigation. Every step becomes a button until a horizontal Stepper collapses: enabled steps activate, and disabled steps stay focusable and are announced as unavailable but do not activate. When collapsed, navigation moves to summary controls that skip disabled steps.',
        },
        {
          name: 'label',
          type: 'string',
          description:
            'Accessible label describing the set of steps (applied to the ordered list). Defaults to a localized "Progress".',
          default: "'Progress' (localized)",
        },
        {
          name: 'density',
          type: "'compact' | 'balanced' | 'spacious'",
          description: 'Controls the padding of all steps.',
          default: "'balanced'",
        },
        {
          name: 'indicatorPosition',
          type: "'separated' | 'on-track'",
          description:
            'Position of step indicators relative to the connector track.',
          default: "'separated'",
        },
        {
          name: 'horizontalOptions',
          type: "{ minimumStepWidth: number; collapsedVariant: 'withLabelAndControls' | 'withLabel' | 'hiddenLabel' }",
          description:
            'Options for horizontal collapse. minimumStepWidth is the per-step threshold in pixels. collapsedVariant selects a label with controls, the label alone, or a bare progress track with no compact row. Controls appear only for withLabelAndControls when onStepClick is set, and every step keeps its accessible name.',
          default:
            "{ minimumStepWidth: 112, collapsedVariant: 'withLabelAndControls' }",
        },
        {
          name: 'xstyle',
          type: 'StyleXStyles',
          description:
            'StyleX styles for layout customization. Must be a stylex.create() value.',
        },
      ],
    },
    {
      // Name-only cross-reference. Step's full documentation (description,
      // props) lives in Step.doc.mjs as a `subComponentOf: 'Stepper'` doc, so
      // it is emitted once from there and skipped here to avoid double emission.
      name: 'Step',
    },
  ],
  // A Stepper draws nothing on its own — every bar, indicator, and label comes
  // from its Steps — so without seeded children the preview opens on an empty
  // stage and the orientation/density/indicator knobs have nothing to act on.
  // Three steps is the smallest set that shows all three progress states at
  // once: completed, current, and upcoming.
  playground: {
    defaults: {
      activeStep: 1,
      children: [
        {__element: 'Step', props: {step: 0, label: 'Cart'}},
        {__element: 'Step', props: {step: 1, label: 'Shipping'}},
        {__element: 'Step', props: {step: 2, label: 'Payment'}},
      ],
    },
  },
}
```
