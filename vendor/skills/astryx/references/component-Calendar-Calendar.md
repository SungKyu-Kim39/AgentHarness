# Astryx component reference: Calendar/Calendar.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Calendar/Calendar.doc.mjs. Original SHA-256: bbd5efb3ca8b05c59a8d895ef6e4a017b33a44ac227f6b878e1c7857fbd738cc.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'Calendar',
  displayName: 'Calendar',
  category: 'Form Controls',
  keywords: [
    'calendar',
    'datepicker',
    'date picker',
    'rangepicker',
    'date range',
    'monthview',
    'daypicker',
  ],
  usage: {
    description:
      'Calendar lets the user pick a date or date range from a month grid. Use it in booking flows, scheduling UIs, date filters, or anywhere the user needs to see surrounding dates for context.',
    bestPractices: [
      {
        guidance: true,
        description:
          'Set min and max dates to limit selection to a valid window, like only future dates for a booking or the current quarter for a report.',
      },
      {
        guidance: true,
        description:
          'Use range mode when the user needs to pick a start and end date, like a trip or a time-off request.',
      },
      {
        guidance: true,
        description:
          'Use dateConstraints to disable specific dates like weekends or holidays, and explain why they are unavailable.',
      },
      {
        guidance: true,
        description:
          'Show two months side by side when the user frequently selects dates that span a month boundary.',
      },
      {
        guidance: true,
        description:
          'For a custom month view, use useCalendarNavigation and useCalendarDays from @astryxdesign/core/Calendar. To show another calendar system, pass the same calendar to both and feed visibleCalendarMonths into useCalendarDays. The hooks default to gregory and never read the InternationalizationProvider calendar.',
      },
      {
        guidance: false,
        description:
          'Use a calendar for dates far in the past or future like a birth date. A text input is faster for open-ended entry.',
      },
      {
        guidance: false,
        description:
          'Disable large blocks of dates without context. The user should understand why dates are unavailable.',
      },
    ],
    anatomy: [
      {
        name: 'Calendar root',
        required: true,
        description:
          'The container that holds the month header and the day grid.',
      },
      {
        name: 'Month header',
        required: true,
        description:
          'The month name and year with navigation arrows to move between months. The arrows mirror automatically under dir="rtl".',
      },
      {
        name: 'Day grid',
        required: true,
        description:
          'A 7-column grid of days with column headers for the day names.',
      },
      {
        name: 'Day button',
        required: true,
        description: 'One day in the grid; the control a date is picked with.',
      },
      {
        name: 'Selected day',
        required: false,
        description:
          'The currently selected date, highlighted. In range mode, the start and end dates plus the days between them.',
      },
      {
        name: 'Today marker',
        required: false,
        description: 'A subtle indicator on the current date for orientation.',
      },
    ],
  },
  props: [
    {
      name: 'mode',
      type: "'single' | 'range'",
      description: 'Selection mode.',
      default: "'single'",
    },
    {
      name: 'value',
      type: 'ISODateString | DateRange | null',
      description:
        'Controlled selected value. Use null for no selection; omit value or pass undefined for uncontrolled mode.',
    },
    {
      name: 'defaultValue',
      type: 'ISODateString | DateRange',
      description: 'Uncontrolled default value.',
    },
    {
      name: 'onChange',
      type: 'Function',
      description: 'Selection callback.',
    },
    {
      name: 'numberOfMonths',
      type: '1 | 2',
      description: 'Number of months to display.',
      default: '1',
    },
    {
      name: 'min',
      type: 'ISODateString',
      description: 'Minimum selectable date.',
    },
    {
      name: 'max',
      type: 'ISODateString',
      description: 'Maximum selectable date.',
    },
    {
      name: 'dateConstraints',
      type: 'Array<(date: Date) => boolean>',
      description: 'Custom constraint functions.',
    },
    {
      name: 'maxRangeSpan',
      type: 'number',
      description:
        'Range mode: max days a range may span, both endpoints counted (7 = a 7-day window). Caps the window from the picked start; before a start is picked every day stays selectable.',
    },
    {
      name: 'minRangeSpan',
      type: 'number',
      description:
        'Range mode: min days a range must span, both endpoints counted (2 forbids a single-day range). Clicking the start again commits a one-day range when allowed, or cancels the in-progress selection when the minimum is longer. Default 1.',
    },
    {
      name: 'focusDate',
      type: 'ISODateString',
      description:
        'Controlled visible month. Unset, the calendar opens on the selected date, else on today clamped into the min/max window.',
    },
    {
      name: 'onFocusDateChange',
      type: '(focusDate: ISODateString) => void',
      description: 'Navigation callback.',
    },
    {
      name: 'handleRef',
      type: 'React.Ref<CalendarHandle>',
      description:
        'Imperative handle for calendar navigation, including navigateTo().',
    },
    {
      name: 'hasOutsideDays',
      type: 'boolean',
      description: 'Show days from adjacent months.',
      default: 'true',
    },
    {
      name: 'hasWeekNumbers',
      type: 'boolean',
      description:
        'Show ISO 8601 week numbers. They are ISO 8601 week numbers in every calendar system.',
      default: 'false',
    },
    {
      name: 'hasVariableRowCount',
      type: 'boolean',
      description:
        'Give each month only the rows it needs. The default fixed 6-row grid keeps the same height from month to month; a variable row count trades that fixed height for a more compact grid.',
      default: 'false',
    },
    {
      name: 'weekStartsOn',
      type: "0 | 1 | 2 | 3 | 4 | 5 | 6 | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'",
      description:
        'First day of week. Accepts a number (0=Sunday) or a three-letter day name (e.g. "mon").',
      default: '0',
    },
    {
      name: 'calendar',
      type: "'gregory' | 'iso8601' | 'buddhist' | 'roc' | 'japanese' | 'persian' | 'indian' | 'hebrew' | 'chinese' | 'dangi' | 'coptic' | 'ethiopic' | 'ethioaa' | 'islamic-civil' | 'islamic-tbla' | 'islamic-umalqura'",
      description:
        "Calendar system the grid shows, such as 'persian', 'hebrew', or 'islamic-umalqura'. It sets the months, their names, and month and year navigation. value, min, max, focusDate, and every callback stay Gregorian ISO dates. Calendars other than gregory, iso8601, buddhist, roc, and japanese need Temporal; where the runtime lacks it, load a polyfill such as temporal-polyfill/full/global on the server and in the browser, or the grid shows Gregorian months. Month starts in the Chinese and Dangi calendars come from the runtime's Temporal, and some polyfills start a few months one day apart from native Temporal; when server and browser markup must match, use one implementation on both sides, such as installImplementation() from temporal-polyfill/full/shim, which replaces a native Temporal.",
      default: 'the InternationalizationProvider calendar, else gregory',
    },
  ],
  examples: [
    {
      label: 'A custom month view in the Persian calendar',
      code: `import {Button} from '@astryxdesign/core/Button';
import {
  useCalendarDays,
  useCalendarNavigation,
} from '@astryxdesign/core/Calendar';

function PersianMonth() {
  const {monthYearLabel, visibleCalendarMonths, navigateMonth} =
    useCalendarNavigation({initialValue: '2026-10-30', calendar: 'persian'});
  // visibleCalendarMonths[0] is {year: 1405, month: 8}: Aban 1405.
  const {weeks} = useCalendarDays({
    ...visibleCalendarMonths[0],
    calendar: 'persian',
  });
  return (
    <section aria-label={monthYearLabel}>
      <Button label="Previous month" onClick={() => navigateMonth(-1)} />
      <Button label="Next month" onClick={() => navigateMonth(1)} />
      {weeks.map(week => (
        <div key={week[0].iso}>
          {week.map(day => (
            <span key={day.iso} data-date={day.iso}>
              {day.isOutside ? '' : day.dayNumber}
            </span>
          ))}
        </div>
      ))}
    </section>
  );
}`,
    },
  ],
  theming: {
    targets: [
      {className: 'astryx-calendar', visualProps: ['mode']},
      {
        className: 'astryx-calendar-nav',
        visualProps: ['nav'],
        states: ['disabled'],
      },
      {
        className: 'astryx-calendar-day',
        states: ['selected', 'today', 'disabled', 'in-range', 'marker'],
      },
    ],
  },
}
```
