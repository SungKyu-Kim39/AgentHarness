# Astryx component reference: Timestamp/Timestamp.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Timestamp/Timestamp.doc.mjs. Original SHA-256: d6687a4afb937fdc8cf8aca9067e0285812e46544f412aff6323755f3512b072.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Timestamp',
  displayName: 'Timestamp',
  category: 'Content',
  keywords: [
    'date',
    'time',
    'datetime',
    'relative',
    'ago',
    'clock',
    'format',
    'duration',
    'relativetime',
  ],
  playground: {
    // `value` is required but has no semantic default, so the properties-tab
    // preview fell back to the literal string "value" — which
    // `new Date("value")` rejects, crashing the preview with "Invalid time
    // value". Seed a valid ISO 8601 date so the interactive preview renders.
    defaults: {
      value: '2026-02-19T17:00:00Z',
    },
  },
  props: [
    {
      name: 'value',
      type: 'string | number',
      description:
        'The date/time to display. Accepts Unix timestamps (seconds) or ISO 8601 strings.',
      required: true,
    },
    {
      name: 'format',
      type: "'relative' | 'relative_short' | 'auto' | 'date' | 'date_long' | 'date_weekday' | 'date_time' | 'time' | 'system_date' | 'system_date_time' | 'system_time' | 'unix_seconds'",
      description:
        "Display format. 'relative' uses the locale's native long relative-time wording ('2 hours ago' in English), 'relative_short' uses its narrow pattern ('2h ago' in English) for compact surfaces, 'date' shows 'Mar 21, 2025', 'date_long' shows 'March 21, 2025', 'date_weekday' shows 'Wed, Mar 21, 2025', 'date_time' shows 'Mar 21, 2025, 2:51 PM', 'time' shows '2:51 PM', 'system_*' variants use ISO-style formatting, 'unix_seconds' shows the Unix time in whole seconds since the epoch (an absolute, zone-independent value), 'auto' switches from relative to date_time based on recency. Absolute formats never read the current time. 'relative', 'relative_short' and 'auto' read it on the client only: a server render or static prerender shows the full date and time in UTC, labelled, and the client switches to the format's normal output after hydration. Date-bearing formats ('date', 'date_long', 'date_weekday', 'date_time', and the full date in the hover card and the accessible name) use the InternationalizationProvider calendar, such as calendar=\"persian\"; 'time', the relative formats, 'system_*', and 'unix_seconds' do not change.",
      default: "'auto'",
    },
    {
      name: 'timezoneID',
      type: 'string',
      description:
        "IANA time zone the absolute formats render in, such as 'UTC' or 'America/Los_Angeles'. Omit (or pass 'local') for the viewer's own zone. An explicit zone renders identically on the server and the client, so it is the way to show an absolute time without a hydration mismatch; relative formats' visible text ignores it, while configured tooltipEntries rows still follow it. An unknown identifier warns once in development and falls back to the viewer's zone.",
    },
    {
      name: 'autoThreshold',
      type: 'number',
      description:
        "Threshold in seconds for 'auto' format to switch from relative to date_time.",
      default: '604800',
    },
    {
      name: 'hasTooltip',
      type: 'boolean',
      description:
        'Whether to show a copyable hover card with the full date/time on hover or keyboard focus. Applies to relative timestamps and to any format once tooltipEntries is configured.',
      default: 'true',
    },
    {
      name: 'tooltipEntries',
      type: 'ReadonlyArray<{timezoneID?: string; format?: TimestampTooltipFormat; label?: string; isCopyable?: boolean}>',
      description:
        "Lines to show on hover, so one instant can be read (and optionally copied) in several time zones and/or formats at once. Each entry is one line, in the order given. An entry without timezoneID follows the Timestamp timezoneID when set, else the viewer's zone; 'local' always means the viewer's zone; format defaults to the full absolute style and also accepts 'full' alongside every non-relative TimestampFormat. Rows are read-only unless they set isCopyable (default false); copyable rows show a copy button in a dedicated trailing action column so buttons align, and the column is only present when some row is copyable. With no entries the card shows a single default row with the full absolute time, which is copyable. Configuring entries also attaches the surface to absolute formats, which otherwise have none.",
    },
    {
      name: 'isTimezoneShown',
      type: 'boolean',
      description:
        "Whether to append the timezone abbreviation to the visible text. Applies to the date_time and time formats; system_* formats stay machine-readable and never carry one. Use tooltipEntries to control the tooltip's time zones.",
      default: 'false',
    },
    {
      name: 'isLive',
      type: 'boolean',
      description:
        'Whether the relative time should update live (e.g. "2 min ago" \u2192 "3 min ago").',
      default: 'false',
    },
    {
      name: 'type',
      type: "'body' | 'large' | 'label' | 'supporting' | 'code' | 'display-1' | 'display-2' | 'display-3' | 'inherit'",
      description:
        'Semantic text type from Text. Determines size, weight, and line-height.',
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
  ],
  theming: {
    targets: [
      {className: 'astryx-timestamp', visualProps: ['type', 'color', 'format']},
      {className: 'astryx-timestamp-copy-button'},
    ],
    componentIcons: [
      {
        slot: 'timestamp-copy',
        description: 'The copy button icon on a hover card row.',
        fallback:
          '`copy`; `check` while copied; `close` while a failed copy shows',
        state: [
          {
            name: 'copied',
            type: 'boolean',
            description:
              'True while the copied feedback shows after a successful copy. False while a failed copy shows, so a theme-mapped slot keeps its rest glyph then.',
          },
        ],
        whenNull:
          'Hides the glyph. The button keeps its size, name, tooltip, and copy action.',
      },
    ],
  },
  usage: {
    description:
      'Timestamp formats a date or time value into human-readable text. Use it to show when something was created, updated, or is scheduled; picking relative for recency, absolute for precision, or auto to let the component decide.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Use the auto format in feeds and lists so recent items show "2 hours ago" and older items show the full date automatically.',
      },
      {
        guidance: true,
        description:
          'Keep formatting consistent within the same list or table; mixing relative and absolute timestamps in the same column confuses scanning.',
      },
      {
        guidance: true,
        description:
          'Enable isTimezoneShown when the audience spans multiple time zones, like a global team calendar or audit log.',
      },
      {
        guidance: true,
        description:
          "Use tooltipEntries when readers must compare zones, such as an incident log where the reader's time and the event's origin zone both matter.",
      },
      {
        guidance: true,
        description:
          'Pass timezoneID when an absolute time must read the same for every viewer and on the server, like an incident log timestamp or anything server-rendered; without it the server markup depends on the server zone.',
      },
      {
        guidance: true,
        description:
          'Label every entry once a tooltip shows more than one zone; a bare abbreviation is not always recognizable (Tokyo renders as "GMT+9", not "JST").',
      },
      {
        guidance: true,
        description:
          'Use isLive for active dashboards or real-time feeds so the relative time stays accurate without a page refresh.',
      },
      {
        guidance: true,
        description:
          'Reach for tooltipEntries when readers need to grab an exact value: an incident log or deploy record where someone pastes the UTC time or Unix seconds elsewhere; configuring entries turns the hover into copy-to-clipboard rows.',
      },
      {
        guidance: false,
        description:
          "Don't display raw Unix timestamps or ISO strings to users; always pass them through Timestamp to get a human-readable format.",
      },
      {
        guidance: false,
        description:
          'Avoid system_date or system_time formats in user-facing UI; they are meant for developer tools, logs, and machine-readable contexts.',
      },
      {
        guidance: false,
        description:
          'Don\'t disable the hover card on relative timestamps; users expect to hover for the full date when they see "3 hours ago".',
      },
      {
        guidance: false,
        description:
          "Don't stack many zones into one card; it is capped at 300px wide and long labelled lines wrap. Two or three entries read well.",
      },
      {
        guidance: false,
        description:
          'Don\'t pass a fixed-offset abbreviation like "EST" as timezoneID; it is a valid identifier but never observes daylight saving, so it reads an hour wrong for half the year. Use the region id, "America/New_York".',
      },
    ],
    anatomy: [
      {
        name: 'Formatted text',
        required: true,
        description:
          'The rendered date, time, or relative label like "2 hours ago" or "Mar 21, 2025".',
      },
      {
        name: 'Hover card',
        required: false,
        description:
          'A copyable hover card showing the full absolute date and time when the display is relative, or the rows configured via tooltipEntries. Its default single row carries the full absolute time.',
      },
      {
        name: 'Hover card row',
        required: false,
        description:
          'One row of the card: an optional label beside the instant rendered in one time zone and format. Rows opt into a copy button via isCopyable.',
      },
      {
        name: 'Copy button',
        required: true,
        description:
          "Per-row copy-to-clipboard button in the hover card; copies that row's formatted value.",
      },
    ],
  },
}
```
