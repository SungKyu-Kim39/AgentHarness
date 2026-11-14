# Ned local reference

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

Upstream: https://github.com/GoogleChrome/modern-web-guidance/blob/4dd968349e54ca45a05dd5c818fb035c9054b022/skills/modern-web-guidance/guides/visual-design/adapt-scrollbar-to-contrast-preferences.md
License: CC-BY-4.0. Original authors and attributions in the guide are retained. Local preface and offline cross-reference replacements added by Ned contributors. Citation URLs are attribution only; use local assets and the actual supported browser versions.

---

# Adapt scrollbar to high-contrast preferences

Users who enable high-contrast modes in their operating system or browser expect UI elements (like scrollbars) to be extremely legible, often relying on stark foreground-background separation rather than subtle grays or theme colors.

This guide provides instructions on how to use the `@media (prefers-contrast: more)` CSS media feature to enforce high-contrast scrollbar styling.

## Enhance Legibility

When customizing scrollbars with `scrollbar-color` or custom variables, you can provide an explicit override for high-contrast modes. This is especially helpful if your primary application theme uses lower-contrast scrollbars for aesthetic reasons, although the default thumb still needs at least 3:1 contrast against the track (WCAG 1.4.11 Non-text Contrast).

Use an `@media (prefers-contrast: more)` block to define dark, distinct colors for the thumb and track.

```css
/* Define default standard colors as variables */
.scroller {
  --scrollbar-thumb: #707070;
  --scrollbar-track: #f1f1f1;

  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
  scrollbar-width: thin;
  scrollbar-gutter: stable;
}

/* Provide clear, high-contrast overrides */
@media (prefers-contrast: more) {
  .scroller {
    /* Use extremely distinct colors like solid black against white */
    --scrollbar-thumb: #000000;
    --scrollbar-track: #ffffff;
  }
}
```

### Issues to be aware of when using scrollbar-color

- Do NOT animate or transition `scrollbar-color`. A [WebKit bug](https://bugs.webkit.org/show_bug.cgi?id=311752) causes the scrollbar to flicker every time `scrollbar-color` changes.
- On macOS, `scrollbar-color` (standard) and `::-webkit-scrollbar` (legacy) properties are ignored by default because macOS uses native "overlay" scrollbars. You MUST pair custom colors with `scrollbar-width` (e.g., `thin` or `auto`) to force macOS to render them.
- Even with `scrollbar-width` applied, macOS overlay scrollbars render the track (gutter) as transparent by default. If the design requires a visible track background color on MacOS, you MUST apply `scrollbar-gutter: stable;` to the scrollable container, but note that it only appears after the user hovers over the scrollbar.
- Even with `scrollbar-gutter: stable` the track may be transparent on MacOS. The thumb should not depend on the track color to be visible.

## Fallbacks & Browser Support

### Fallbacks & browser support for scrollbar-color

Baseline status for scrollbar-color: Newly available. It's been Baseline since 2025-12-12.
Supported by: Chrome 121 (Jan 2024), Edge 121 (Jan 2024), Firefox 64 (Dec 2018), and Safari 26.2 (Dec 2025).

This feature is progressive enhancement and does not always require fallbacks.

If the styling is important and the user's Baseline target is "Baseline Widely Available" or earlier, you SHOULD include the non-standard `::-webkit-scrollbar` pseudo-elements as fallbacks.

Wrap legacy fallbacks in an `@supports not (scrollbar-color: auto)` block to prevent conflicts between standard properties and legacy WebKit selectors in browsers that support both natively.

If you are using custom properties to define colors, these will cascade to the legacy WebKit selectors automatically. You do NOT need to duplicate them.

```css
/* Legacy fallback for WebKit/Blink browsers */
@supports not (scrollbar-color: auto) {
  .scroller::-webkit-scrollbar {
    /* Must define base size in WebKit for custom colors to be visual */
    width: 12px;
    height: 12px;
  }

  .scroller::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
  }

  .scroller::-webkit-scrollbar-track {
    background: var(--scrollbar-track);
  }
}
```
