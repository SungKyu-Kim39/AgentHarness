# Ned local reference

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

Upstream: https://github.com/GoogleChrome/modern-web-guidance/blob/4dd968349e54ca45a05dd5c818fb035c9054b022/skills/modern-web-guidance/guides/performance/detect-initial-visibility-state.md
License: CC-BY-4.0. Original authors and attributions in the guide are retained. Local preface and offline cross-reference replacements added by Ned contributors. Citation URLs are attribution only; use local assets and the actual supported browser versions.

---

# Detect Initial Visibility State

Determining if a page was initially loaded in the background (e.g., opened in a new background tab) is critical for accurate performance monitoring. Pages loaded in the background often have delayed rendering and longer metric times (like First Contentful Paint). Identifying these pages allows you to filter them out of performance analytics to avoid skewed data.

The most accurate way to measure this is by using the `VisibilityStateEntry` API, which reliably records visibility changes on the browser's performance timeline, regardless of when your script actually executes.

### Detecting initial visibility and background time

MANDATORY: Use `performance.getEntriesByType('visibility-state')` to access the exact visibility history. Do not rely solely on checking `document.visibilityState` at execution time, as it is susceptible to race conditions.

```javascript
/**
 * Accurately determines visibility state history using the Performance API.
 */
function getVisibilityInfo() {
  // Retrieve VisibilityStateEntry members:
  const entries = performance.getEntriesByType('visibility-state');
  
  if (entries.length > 0) {
    const firstEntry = entries[0];
    
    // If the first performance entry for visibility is 'hidden',
    // the page was loaded in the background.
    const initiallyBackgrounded = firstEntry.name === 'hidden';
    
    // Find the precise, high-resolution timestamp of when the page 
    // was first backgrounded.
    let timeBackgrounded = null;
    for (const entry of entries) {
      if (entry.name === 'hidden') {
        // entry.startTime is used because it provides the exact browser 
        // timestamp of the visibility change, which is required for precision
        timeBackgrounded = entry.startTime;
        break;
      }
    }

    return {
      initiallyBackgrounded,
      timeBackgrounded
    };
  }
}
```

### Fallback strategies

Browser support for Page visibility state performance entries: Limited availability.
Supported by: Chrome 115 (Jul 2023) and Edge 115 (Jul 2023).
Unsupported in: Firefox and Safari.

For unsupported environments, you may fall back to checking the `document.visibilityState` property or listening for the `visibilitychange` event.

**MANDATORY:** You must understand that this fallback approach is often **highly inaccurate for determining initial background state**. Because scripts can load and execute asynchronously, a page could be opened in a background tab and then foregrounded by the user *before* your script has finished downloading and executing. When your script finally runs, `document.visibilityState` will synchronously read as `'visible'`, and you will incorrectly assume the page was loaded in the foreground, completely missing its initial hidden state. Furthermore, the fallback timestamp lacks the internal precision of the Performance API. If precision is a high priority, do not use the fallback.

```javascript
/**
 * Fallback implementation using document.visibilityState.
 * This approach is prone to race conditions if the script loads asynchronously.
 */
function getFallbackVisibilityInfo() {
  // Check the state exactly when this script executes.
  // This will fail to detect an initial background state if the user 
  // foregrounded the page before this script executed.
  let initiallyBackgrounded = document.visibilityState === 'hidden';
  
  // If it's hidden now, we approximate that it was hidden from load (time 0).
  let timeBackgrounded = initiallyBackgrounded ? 0 : null;

  // Listen for future visibility changes to capture if it is backgrounded later.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && timeBackgrounded === null) {
      // performance.now() is used here as a fallback, but it only gives 
      // us the time the event listener fired, not the precise internal 
      // browser time the visibility actually changed.
      timeBackgrounded = performance.now();
    }
  });

  return {
    get initiallyBackgrounded() { return initiallyBackgrounded; },
    get timeBackgrounded() { return timeBackgrounded; }
  };
}

// Modern implementation using VisibilityStateEntry API.
function getVisibilityInfo() {
  // Code omitted here would be the same modern
  // implementation shown earlier in this guide
  // ...
}

// DO: Detect if the VisibilityStateEntry API is available
if ('VisibilityStateEntry' in window) {
  // DO: If VisibilityStateEntry is available, use it first:
  getVisibilityInfo();
} else {
  // DO: If VisibilityStateEntry is unavailable, fall back to `document.visibilityState`:
  getFallbackVisibilityInfo();
}
```
