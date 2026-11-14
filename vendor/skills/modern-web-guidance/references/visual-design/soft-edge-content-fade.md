# Ned local reference

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

Upstream: https://github.com/GoogleChrome/modern-web-guidance/blob/4dd968349e54ca45a05dd5c818fb035c9054b022/skills/modern-web-guidance/guides/visual-design/soft-edge-content-fade.md
License: CC-BY-4.0. Original authors and attributions in the guide are retained. Local preface and offline cross-reference replacements added by Ned contributors. Citation URLs are attribution only; use local assets and the actual supported browser versions.

---

# Soft Edge Content Fade

## Overview
To apply a transparency gradient to the edges of a container (e.g., to indicate more content is available to scroll or to fade out text), use CSS Masking with a linear gradient. This approach is superior to using a semi-transparent overlay because it actually fades the content itself, allowing the background to show through naturally without interfering with text selection or pointer events.

## Implementation
To implement a soft edge fade:

### Fading the bottom edge of a container
This is useful for indicating that there is more content below in a scrollable area.

```css
.container {
  /* Enable scrolling */
  overflow-y: auto;
  
  /* MANDATORY: Use vendor prefix for wider support in older browsers */
  -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
  
  /* Standard property for modern browsers */
  mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
}
```

### Fading both top and bottom edges
You can use a single gradient with multiple color stops to fade both edges.

```css
.dual-fade-container {
  /* Content is visible between 10% and 90% of the height */
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%);
}
```

## Fallback strategies
Baseline status for Masks: Widely available. It's been Baseline since 2023-12-07.
Supported by: Chrome 120 (Dec 2023), Edge 120 (Dec 2023), Firefox 53 (Apr 2017), and Safari 15.4 (Mar 2022).

If a browser does not support `mask-image` or the prefixed version:
- The content will not fade and will display with sharp edges.
- Ensure the interface is still functional and content is readable without the fade (progressive enhancement).
- You can use a semi-transparent overlay as a fallback, but be aware it requires knowing the background color and may interfere with text selection unless `pointer-events: none` is used.

```css
/* Fallback using an overlay for browsers that do not support masking */
@supports (not (mask-image: linear-gradient(to bottom, black, transparent))) and (not (-webkit-mask-image: linear-gradient(to bottom, black, transparent))) {
  .container {
    position: relative;
  }
  
  .container::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 20%;
    /* Fallback assumes a solid background color (e.g., white) */
    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1));
    pointer-events: none; /* Allow interaction with text underneath */
  }
}
```
