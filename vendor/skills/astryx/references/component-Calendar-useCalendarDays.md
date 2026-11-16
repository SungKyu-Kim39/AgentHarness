# Astryx component reference: Calendar/useCalendarDays.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Calendar/useCalendarDays.doc.mjs. Original SHA-256: 76883d415623723896fbbdf8dc83c7f98ce1fa053f310d15f6febd0bb6c35bef.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useCalendarDays',
  displayName: 'useCalendarDays',
  group: 'Calendar',
  keywords: [
    'calendar',
    'month',
    'grid',
    'weeks',
    'days',
    'weekday names',
    'week start',
    'date picker',
  ],
  params: [
    {
      name: 'options',
      type: 'UseCalendarDaysOptions',
      description: 'The month to lay out and how.',
      required: true,
    },
    {
      name: 'options.year',
      type: 'number',
      description:
        'Year of the month to lay out, as options.calendar numbers it.',
      required: true,
    },
    {
      name: 'options.month',
      type: 'number',
      description:
        "The month's position in its year under options.calendar, 1-based. In the Gregorian calendar 1 is January and 12 is December; other calendars number months as Temporal.PlainDate does, so a Hebrew leap year runs from 1 to 13.",
      required: true,
    },
    {
      name: 'options.weekStartsOn',
      type: 'DayOfWeek',
      description:
        'First day of the week, from 0 (Sunday) to 6 (Saturday). It sets the first column of both the grid and dayNames.',
      default: '0',
      required: false,
    },
    {
      name: 'options.hasVariableRowCount',
      type: 'boolean',
      description:
        'Use only as many week rows as the month needs instead of a fixed 6-row grid. That is 4 to 6 for a Gregorian month, and 1 or 2 for the short thirteenth month of the Coptic and Ethiopic calendars.',
      default: 'false',
      required: false,
    },
    {
      name: 'options.calendar',
      type: 'CalendarSystem',
      description:
        "The calendar system that numbers year, month and each day's dayNumber. Every day keeps its Gregorian date and iso. The hook never reads the InternationalizationProvider calendar. Calendars other than gregory, iso8601, buddhist, roc and japanese need Temporal; without it the hook uses Gregorian numbers and warns once in development.",
      default: "'gregory'",
      required: false,
    },
  ],
  returns: [
    {
      name: 'days',
      type: 'CalendarDay[]',
      description:
        'Every cell of the grid in order, including the days from the previous and next months that fill the first and last weeks. Each day has date (a PlainDate), iso (YYYY-MM-DD), isOutside (true for a day outside the month) and dayNumber (its day of the calendar month).',
    },
    {
      name: 'weeks',
      type: 'CalendarDay[][]',
      description: 'The same days grouped into rows of seven.',
    },
    {
      name: 'dayNames',
      type: 'string[]',
      description:
        "Weekday header names for the current locale (from InternationalizationProvider), starting at weekStartsOn. Abbreviated where every name fits the column, otherwise the locale's narrow names.",
    },
    {
      name: 'totalCells',
      type: 'number',
      description:
        'Number of cells in the grid: 42 for the fixed grid, otherwise rows times seven.',
    },
  ],
  usage: {
    description:
      "Builds the day grid for one month: every date to show, including the previous and next months' days that fill the first and last weeks, grouped into weeks, plus localized weekday header names that start on weekStartsOn. It is the layout Calendar uses, for a custom month view such as a compact availability grid or a mini calendar. It returns data only: rendering, selection, keyboard navigation and the grid's accessibility semantics are the caller's.",
    bestPractices: [
      {
        guidance: true,
        description:
          'Render dayNames as the header row so the header follows weekStartsOn and the locale together with the grid.',
      },
      {
        guidance: true,
        description:
          'Style days with isOutside differently, for example dimmed, so the filler days read as part of the next or previous month.',
      },
      {
        guidance: false,
        description:
          'Use it to build a date picker that people choose from; use Calendar, which adds selection, keyboard navigation and grid semantics.',
      },
    ],
  },
  relatedComponents: ['Calendar'],
  relatedHooks: ['useLocale'],
  importPath: '@astryxdesign/core/Calendar',
  category: 'utilities',
}
```
