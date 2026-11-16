# Astryx component reference: Calendar/useCalendarNavigation.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Calendar/useCalendarNavigation.doc.mjs. Original SHA-256: 49914b52160105c8b0d96030645348cc81e2295f9058711948650c2c83e2a11e.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useCalendarNavigation',
  displayName: 'useCalendarNavigation',
  group: 'Calendar',
  keywords: [
    'calendar',
    'navigation',
    'month',
    'navigateMonth',
    'monthYearLabel',
    'pendingFocus',
    'clearPendingFocus',
    'keyboard navigation',
    'previous month',
    'next month',
  ],
  params: [
    {
      name: 'options',
      type: 'UseCalendarNavigationOptions',
      description: 'Configuration for visible month, calendar system, and navigation callbacks.',
      required: true,
    },
    {
      name: 'options.initialValue',
      type: 'ISODateString',
      description:
        'Initial ISO date string (YYYY-MM-DD) used to determine the starting focus month when uncontrolled.',
      required: false,
    },
    {
      name: 'options.focusDate',
      type: 'ISODateString',
      description:
        'Controlled ISO date string (YYYY-MM-DD) determining which month is currently displayed. Used with onFocusDateChange as a controlled pair.',
      required: false,
    },
    {
      name: 'options.onFocusDateChange',
      type: '(focusDate: ISODateString) => void',
      description:
        'Callback invoked when user navigation changes the visible focus month. Used with focusDate as a controlled pair.',
      required: false,
    },
    {
      name: 'options.numberOfMonths',
      type: '1 | 2',
      description:
        'Number of consecutive months to display simultaneously (1 or 2). Default is 1.',
      default: '1',
      required: false,
    },
    {
      name: 'options.calendar',
      type: 'CalendarSystem',
      description:
        "Calendar system whose months the hook steps and formats (e.g. 'gregory', 'persian', 'hebrew'). Calendars other than gregory, iso8601, buddhist, roc and japanese need Temporal. The provider's calendar is never read. Default is 'gregory'.",
      default: "'gregory'",
      required: false,
    },
  ],
  returns: [
    {
      name: 'baseMonth',
      type: 'PlainDate',
      description: 'The Gregorian first day of the primary focus month.',
    },
    {
      name: 'visibleMonths',
      type: 'PlainDate[]',
      description: 'Array of Gregorian first-day PlainDate objects for each currently visible month.',
    },
    {
      name: 'visibleCalendarMonths',
      type: '{year: number; month: number}[]',
      description:
        'Array of year and month pairs for each visible month in the active calendar system, compatible with useCalendarDays options.',
    },
    {
      name: 'monthYearLabel',
      type: 'string',
      description:
        'Formatted localized header label for the visible month or range of months (e.g. "June 2026").',
    },
    {
      name: 'navigateMonth',
      type: '(delta: number, focusedDate?: ISODateString, offset?: number) => void',
      description:
        'Steps the visible month forward (+1) or backward (-1). When focusedDate is passed, computes pendingFocus on the target date across the month boundary using offset (defaults to 7).',
    },
    {
      name: 'pendingFocus',
      type: 'ISODateString | null',
      description:
        'Target ISO date to focus following a month navigation step, or null when no cross-month keyboard focus is pending.',
    },
    {
      name: 'clearPendingFocus',
      type: '() => void',
      description:
        'Clears pendingFocus once the target day cell has received keyboard focus.',
    },
  ],
  usage: {
    description:
      'Manages visible month state and pagination for calendar components. It provides previous/next month stepping, localized month-year header strings, and pending focus tracking so keyboard arrow navigation seamlessly moves focus across month boundaries into the adjacent month. Use it directly when composing custom calendar headers, pager controls, or dual-month availability pickers.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Wire navigateMonth(-1) and navigateMonth(1) to Previous/Next icon buttons to paginate months.',
      },
      {
        guidance: true,
        description:
          'Pass focusedDate and offset (e.g. 1 for horizontal arrow keys, 7 for vertical arrow keys) to navigateMonth so pendingFocus directs keyboard focus to the correct day cell after the month transition.',
      },
      {
        guidance: false,
        description:
          'Hardcode month-year header strings manually; use monthYearLabel which automatically formats according to the active locale and calendar system.',
      },
    ],
  },
  relatedComponents: ['Calendar'],
  relatedHooks: ['useCalendarDays', 'useCalendarConstraints'],
  importPath: '@astryxdesign/core/Calendar',
  category: 'utilities',
}
```
