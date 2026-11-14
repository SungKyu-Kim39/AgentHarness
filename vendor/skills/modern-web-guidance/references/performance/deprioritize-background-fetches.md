# Ned local reference

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

Upstream: https://github.com/GoogleChrome/modern-web-guidance/blob/4dd968349e54ca45a05dd5c818fb035c9054b022/skills/modern-web-guidance/guides/performance/deprioritize-background-fetches.md
License: CC-BY-4.0. Original authors and attributions in the guide are retained. Local preface and offline cross-reference replacements added by Ned contributors. Citation URLs are attribution only; use local assets and the actual supported browser versions.

---

# Deprioritize background fetches

When a page performs multiple simultaneous network requests, they often compete for the same bandwidth. Non-critical data such as analytics, logging, or background synchronization should be deprioritized so that user-initiated or critical data fetches can complete more quickly.

## How to implement

1. **Identify background requests**: Determine which `fetch()` calls are for non-essential data that doesn't impact the immediate user experience.
2. **Apply fetch priority**: Add the `priority: 'low'` option to the `fetch()` initialization object.

## Example code

```javascript
// Use high priority (default) for critical UI updates
const criticalData = await fetch('/api/data');

// Explicitly deprioritize background analytics
fetch('/api/analytics', {
  method: 'POST',
  body: JSON.stringify(eventData),
  // Lower the priority to prevent network contention
  priority: 'low'
});
```

## Best practices

- **DO** use `priority: 'low'` for analytics, beacons, or telemetry data that isn't required for the current view.
- **DO** use `priority: 'low'` for "prefetching" data that the user *might* need later, ensuring it doesn't slow down what they need *now*.
- **DO NOT** use `priority: 'low'` for fetches that are critical to the user experience.
- **DO NOT** use the deprecated `importance` key in the fetch options object. The correct key is `priority`.

## Fallback strategy

Baseline status for Fetch priority: Newly available. It's been Baseline since 2024-10-29.
Supported by: Chrome 103 (Jun 2022), Edge 103 (Jun 2022), Firefox 132 (Oct 2024), and Safari 17.2 (Dec 2023).

The `priority` option in the Fetch API is a progressive enhancement. Browsers that do not support it will ignore the option and treat the request with default priority. No explicit feature detection or fallback logic is required for basic usage.
