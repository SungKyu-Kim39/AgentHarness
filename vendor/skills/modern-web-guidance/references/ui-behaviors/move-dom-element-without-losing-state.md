# Ned local reference

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

Upstream: https://github.com/GoogleChrome/modern-web-guidance/blob/4dd968349e54ca45a05dd5c818fb035c9054b022/skills/modern-web-guidance/guides/ui-behaviors/move-dom-element-without-losing-state.md
License: CC-BY-4.0. Original authors and attributions in the guide are retained. Local preface and offline cross-reference replacements added by Ned contributors. Citation URLs are attribution only; use local assets and the actual supported browser versions.

---

# Move DOM Element Without Losing State

When reparenting DOM elements using traditional methods like `appendChild()` or `insertBefore()`, the browser implicitly removes the element from the DOM and then inserts it into its new location. This "remove and insert" operation resets many internal states, causing `<iframe>` elements to reload, CSS animations to restart, and input fields to lose focus.

To move an element while preserving its state, use the `moveBefore()` API. This method performs an atomic move, completely bypassing the removal and insertion steps.

## Moving an element with state

Use `moveBefore()` exactly as you would use `insertBefore()`. It requires two arguments: the node to move, and a reference node to insert before (or `null` to append to the end of the new parent).

```javascript
const newParent = document.getElementById('new-parent');
const elementWithState = document.getElementById('iframe-or-focused-input');

// MANDATORY: Use moveBefore to preserve state. 
// Passing null as the second argument appends the element to the end of newParent.
newParent.moveBefore(elementWithState, null);
```

## Moving custom elements (Web Components)

If you are moving custom elements using `moveBefore()`, their `connectedCallback` and `disconnectedCallback` lifecycle methods will **not** be fired.

If your custom element needs to perform specific logic when moved, implement the `connectedMoveCallback()` method inside the custom element definition.

```javascript
class MyCustomElement extends HTMLElement {
  connectedCallback() {
    // Runs on initial insertion.
  }
  
  connectedMoveCallback() {
    // Runs when the element is moved via moveBefore().
    // Use this to update state that depends on the new DOM location.
  }
}
```

## Fallback strategies

Browser support for moveBefore(): Limited availability.
Supported by: Chrome 133 (Feb 2025), Edge 133 (Feb 2025), and Firefox 144 (Oct 2025).
Unsupported in: Safari.

Since `moveBefore()` is a progressive enhancement, you MUST use feature detection before calling it, falling back to traditional `insertBefore()` or `appendChild()` operations for older browsers.

```javascript
const targetParent = document.getElementById('target-container');
const nodeToMove = document.getElementById('moving-element');

// Check if moveBefore is supported on the Element prototype
if ('moveBefore' in Element.prototype) {
  targetParent.moveBefore(nodeToMove, null);
} else {
  // Fallback: traditional move. 
  // Note: This WILL reset <iframe>, animation, and focus state in unsupported browsers.
  targetParent.insertBefore(nodeToMove, null);
}
```

## Accessibility considerations

Make sure that moving or reparenting an element does not cause any potentially disorienting changes of context, such as a loss of keyboard focus to the page's `<body>` element.

Where possible, make sure that the change is triggered by the user, rather than an automatic change, to prevent unexpected changes of context.

Make sure that moving or reparenting an element does not affect the meaning of the overall content. For example, if a page contains several panels of content that can be, or are intended to be, read independently and in any order, the meaning of the overall content is not affected through repositioning. However, if these panels of content must be presented in a certain sequence in order to be understood, repositioning the content in the DOM can break the reading sequence even if the visual order still makes sense. This can disorient people who cannot see the content and who use a screen reader.

If moving or reparenting an element triggers a change that is important for people to know about, for example moving a video from one area of the page to a "Favorites" list in another area of the page, use a live region to confirm that the move was was successful.
