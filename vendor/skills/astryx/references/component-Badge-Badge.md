# Astryx component reference: Badge/Badge.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Badge/Badge.doc.mjs. Original SHA-256: c62c6a8ab396c688dbb47ad80440ebf0801e5f89c2791f0a7c98ae17b75d35bb.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Badge',
  displayName: 'Badge',
  category: 'Feedback & Status',
  keywords: ["badge","tag","chip","label","status","indicator","count","counter","pill","notification","marker"],
  props: [
    {
      name: 'variant',
      type: "'neutral' | 'info' | 'success' | 'warning' | 'error' | 'blue' | 'cyan' | 'green' | 'orange' | 'pink' | 'purple' | 'red' | 'teal' | 'yellow'",
      description:
        'Visual style variant. Semantic variants (neutral, info, success, warning, error) use solid backgrounds. Non-semantic color variants use tinted backgrounds with colored text for categorization and tagging.',
      default: "'neutral'",
    },
    {
      name: 'label',
      type: 'ReactNode',
      required: true,
      description:
        'Badge text content. A badge is one line and at least as tall as that line of its label, so it grows with its text (a larger text size); a label wider than the space available is cut with an ellipsis rather than escaping its container; a string or number label is also set as the badge\'s title so the full text stays reachable on hover.',
    },
    {
      name: 'icon',
      type: 'ReactNode',
      description: 'Optional leading icon.',
      slotElements: [{__element: 'Icon', props: {icon: 'check', size: 'sm'}}],
    },
  ],
  playground: {
    defaults: {
      label: 'Badge',
      variant: 'neutral',
    },
  },
  theming: {
    targets: [
      {className: 'astryx-badge', visualProps: ['variant']},
    ],
  },
  usage: {
    description:
      'Badge highlights a status or category at a glance. Use it sparingly: only when a value represents a distinct state (Active, Failed) or a grouping tag (Engineering, Design). Most metadata (dates, durations, counts, descriptions) should be plain description text, not badges.',
    bestPractices: [
      {guidance: true, description: 'Every status badge steals attention. Only badge states where the user needs to notice or act: errors, warnings, items requiring follow-up. If no action is needed, plain text is fine.'},
      {guidance: true, description: 'Use success, warning, and error variants only for system status that demands attention: "Failed", "Degraded", "Action Required". These have bold solid backgrounds designed to stand out.'},
      {guidance: true, description: 'Use color variants (blue, purple, teal, etc.) for category tags that group or classify items: team names, content types, priority levels.'},
      {guidance: true, description: 'Keep labels to one or two words. If you need more detail, put it in surrounding text instead of the badge.'},
      {guidance: true, description: 'Add an icon when it helps identify the badge type quickly, but always include a text label alongside it.'},
      {guidance: true, description: 'A string or number label keeps its character order under right-to-left, so `+3` and `@alice` read as written. When a rich label mixes directions, mark the direction on your own content, for example with `dir` or `<bdi>`.'},
      {guidance: false, description: 'Apply a "success" badge to every healthy/active/normal item. If all rows show green "Active" badges, none stand out; the badge adds noise, not information. Show only the states that need user attention (errors, warnings, pending actions).'},
      {guidance: false, description: 'Use badges for metadata. Durations ("6h window"), counts ("12 trigger types"), dates, and descriptions are not statuses or categories; use description text (Text with type="supporting") instead.'},
      {guidance: false, description: 'Use semantic status variants (success, warning, error, info) for categories or informational content. These are visually loud and should only indicate system state.'},
      {guidance: false, description: 'Repeat the same badge in every row of a table or list. If the same value appears in most rows, it\'s not adding information; use plain text for common states and reserve badges for the exceptional ones.'},
      {guidance: false, description: 'Make badges clickable; they are read-only indicators. Use a button or link if the user needs to take action.'},
    ],
    anatomy: [
      {name: 'Icon', required: false, description: 'An optional leading icon that helps identify the badge type at a glance.'},
      {name: 'Label', required: true, description: 'The text or number shown inside the badge.'},
    ],
  },
}
```
