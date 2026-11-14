# Ned local reference

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

Upstream: https://github.com/GoogleChrome/modern-web-guidance/blob/4dd968349e54ca45a05dd5c818fb035c9054b022/skills/modern-web-guidance/guides/performance/faster-spa-view-transitions.md
License: CC-BY-4.0. Original authors and attributions in the guide are retained. Local preface and offline cross-reference replacements added by Ned contributors. Citation URLs are attribution only; use local assets and the actual supported browser versions.

---

# Faster SPA View Transitions via State Caching

Enable instant navigation between views in a Single-Page Application (SPA) by caching the rendered state of inactive views instead of destroying them.

## Overview

Traditionally, when a user navigates between tabs or views in an SPA, developers either destroy the old view or hide it using `display: none`. Both approaches require the browser to recreate or recalculate the full layout and paint when the user returns to that view.

By using `content-visibility: hidden` on inactive views, the browser removes the element’s contents from the layout flow and stops painting it, but *retains* its cached rendering state in memory. When the user switches back, the view restores nearly instantly.

### The CPU vs. RAM Trade-off

While this approach offers massive performance benefits, it introduces a specific trade-off that you must manage carefully:

*   **CPU Savings:** Massive. The browser completely skips layout and paint passes for hidden views.
*   **RAM Cost:** High. The browser keeps all DOM nodes, event listeners, and state for the hidden view in memory.

#### When This Trade-off Becomes Dangerous

*   **DO** use this strategy for simple applications with a small, predictable number of views (e.g., a 3-to-5 tabbed interface).
*   **DO NOT** unconditionally cache every view in highly dynamic applications that generate dozens of unique reports or use infinite dynamic routes. Doing so will eventually cause severe memory bloat and may crash the browser on low-end devices.
*   **MANDATORY:** If your application is highly dynamic, you MUST implement an **eviction strategy** (like a Least Recently Used cache) to destroy old views when a memory threshold is reached.

## Implementation

### 1. Configure View Containers

Set `content-visibility: hidden` on views that are not currently active.

> [!NOTE]
> The `content-visibility: hidden` property hides an element's *contents*, but the element itself remains styled and visible. Its background, borders, padding, and margins will still be painted by the browser.

```css
.spa-view.inactive {
  /* MANDATORY: Use hidden to cache the rendering state of inactive views */
  content-visibility: hidden;
  
  /* Optional: Prevent hidden views from taking up physical space in layout flow */
  position: absolute;
}
```

### 2. Manage Focus

When swapping views, ensure you manage keyboard focus correctly to preserve accessibility. Use the `inert` attribute to ensure interface elements in the hidden content are not included in the keyboard tab order.

```javascript
function switchToView(viewId) {
  // Hide all views
  document.querySelectorAll('.spa-view').forEach(view => {
    view.classList.add('inactive');
    view.setAttribute('aria-hidden', 'true');
    view.setAttribute('inert', 'inert');
  });
  
  // Show the target view
  const activeView = document.getElementById(viewId);
  activeView.classList.remove('inactive');
  activeView.setAttribute('aria-hidden', 'false');
  activeView.removeAttribute('inert');
  
  // MANDATORY: Move focus to the new view to ensure a logical tab-order
  activeView.focus();
}
```

### Fallback strategies

Baseline status for content-visibility: Newly available. It's been Baseline since 2025-09-15.
Supported by: Chrome 108 (Nov 2022), Edge 108 (Dec 2022), Firefox 130 (Sep 2024), and Safari 26 (Sep 2025).

The `content-visibility` property degrades gracefully. In browsers that do not support it:
*   The property is ignored.
*   To prevent fallback browsers from rendering all views simultaneously, you should provide a fallback to `display: none` in your CSS:

```css
@supports not (content-visibility: hidden) {
  .spa-view.inactive {
    display: none;
  }
}
```
