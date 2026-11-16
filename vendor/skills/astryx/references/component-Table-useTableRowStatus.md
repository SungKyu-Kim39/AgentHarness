# Astryx component reference: Table/useTableRowStatus.doc.mjs

Ned offline adaptation. Use read_skill for these frozen local references. Do not run the original Astryx CLI, online installation, registry discovery, update checks, blog feed, CDN, remote fonts or online playground. Static guidance does not grant execution permissions. Use existing compatible project dependencies, or the fully imported Windows x64 starter kit; never overwrite another project’s dependencies. Preserve the existing framework and ask about an actual incompatible migration, not about skill selection. Verify changes with approved local build tools and otherwise report verification as not run.

Copyright (c) Meta Platforms, Inc. and affiliates. MIT; see ../LICENSE.
Frozen npm package @astryxdesign/core 0.7.16, src/Table/useTableRowStatus.doc.mjs. Original SHA-256: 036de1c13f7c23a10e7563437fb1248866a39559b278b1d05c999ca0445667ab.
Only the exported English docs object is reproduced as text. It is not executable code. Online installation examples are omitted.

```javascript
{
  name: 'useTableRowStatus',
  subComponentOf: 'Table',
  displayName: 'useTableRowStatus',
  description:
    'Hook that returns a TablePlugin which prepends a narrow column signaling per-row status. Return {status, label} for a semantic success, warning, or error: Table resolves the matching glyph and tone through the active theme. Return {color, icon?, label} for a custom marker: every color is paint-only, an omitted icon renders the stable 8px dot, and an explicit icon renders that caller-selected glyph. Named custom icons keep their released Icon color mapping; raw CSS custom icons inherit the caller\'s exact paint instead of the previous primary fallback. Existing callers require no source migration. label is required and becomes the accessible image name plus supplemental hover tooltip; return null for no indicator. The column header is visually blank but carries a screen-reader-only localized name ("Row status", i18n key @astryx.table.rowStatus.columnHeader). Memoize getStatus with useCallback for a stable plugin identity.',
  props: [
    {
      name: 'getStatus',
      type: "(item: T) => ({ status: 'success' | 'warning' | 'error'; color?: never; icon?: never; label: string } | { status?: never; color: 'accent' | 'success' | 'error' | 'warning' | 'red' | 'orange' | 'green' | 'yellow' | 'blue' | 'gray' | string; icon?: IconName; label: string }) | null",
      description:
        'Derive either a semantic outcome or a custom marker. {status, label} accepts the closed success/error/warning vocabulary and resolves its glyph and tone through the active theme. {color, icon?, label} preserves the stable custom-marker path: color always selects paint, no icon renders an 8px dot, and icon renders the explicit caller glyph. Even color values named success/error/warning remain dots without icon. Valid icon names: close, chevronDown, chevronLeft, chevronRight, chevronsLeft, chevronsRight, check, success, error, warning, info, calendar, clock, externalLink, menu, moreHorizontal, search, upload, arrowUp, arrowDown, arrowsUpDown, funnel, eyeSlash, viewColumns, copy, checkDouble, wrench, stop, microphone. The branches are exclusive, label is required and announced via role="img", and null leaves the row status cell empty. Memoize with useCallback for a stable plugin identity.',
      required: true,
    },
  ],
}
```
