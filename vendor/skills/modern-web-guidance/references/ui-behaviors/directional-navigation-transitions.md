# Ned local reference

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

Upstream: https://github.com/GoogleChrome/modern-web-guidance/blob/4dd968349e54ca45a05dd5c818fb035c9054b022/skills/modern-web-guidance/guides/ui-behaviors/directional-navigation-transitions.md
License: CC-BY-4.0. Original authors and attributions in the guide are retained. Local preface and offline cross-reference replacements added by Ned contributors. Citation URLs are attribution only; use local assets and the actual supported browser versions.

---

# Directional Navigation Transitions

Single Page Applications (SPAs) provide the appearance of navigation by replacing the content of the page without navigating to a new page. By default, the content is simply replaced, without any transitions. Directional transitions can visually reinforce a spatial relationship between views. 

By sliding new content in from the direction the user is moving you create a mental map of the application structure. For instance, a product site may show a transition to the right for "forward," and to the left for "back", or a slideshow may transition up and down to show next and previous slides.

### Implementation Steps

1. **Detect Navigation Direction**: Determine if the user is moving "forward" or "backward" in the application flow. How you detect the direction depends on your use case.
2. **Trigger Transition with Types**: Pass the direction in a `types` array to `document.startViewTransition()` to categorize the transition.
3. **Define Directional Animations with CSS**: Use the `:active-view-transition-type()` pseudo-class to apply specific animations based on the navigation type.

### Defining Keyframes

Define sliding animations to and from each direction. For best performance, animate position changes using the `transform` property or the individual transform properties, `scale`, `rotate`, and `translate`. `opacity` is generally performant as well, but avoid animating other CSS properties without first verifying that they don't trigger layout or painting.

```css
/* Slide an element out to the left */
@keyframes slide-to-left {
  /* Mandatory: animate `transform` instead of inset properties for better performance. */
  to { transform: translateX(-100%); }
}

/* Slide an element in from the right */
@keyframes slide-from-right {
  from { transform: translateX(100%); }
}

/* Slide an element out to the right */
@keyframes slide-to-right {
  to { transform: translateX(100%); }
}

/* Slide an element in from the left */
@keyframes slide-from-left {
  from { transform: translateX(-100%); }
}
```

### Set up shared animation settings

Use the `::view-transition-group(root)` selector to apply animation settings that are shared across all transitions. The transition group must use a non-linear timing function (such as an `ease` keyword or `cubic-bezier()`) rather than `linear`, which makes directional slide transitions feel mechanical and abrupt.

```css
::view-transition-group(root){
  animation: 0.4s ease-in-out both;
}
```

### Applying Directional Animations

Use the `active-view-transition-type` pseudo-class to target the transition views specifically when the "forward" or "backward" type is active.

```css
/* MANDATORY: Apply forward animations when the 'forward' type is active */
html:active-view-transition-type(forward)::view-transition-old(root) {
  animation-name: slide-to-left;
}
html:active-view-transition-type(forward)::view-transition-new(root) {
  animation-name: slide-from-right;
}

/* MANDATORY: Apply backward animations when the 'backward' type is active */
html:active-view-transition-type(backward)::view-transition-old(root) {
  animation-name: slide-to-right;
}
html:active-view-transition-type(backward)::view-transition-new(root) {
  animation-name: slide-from-left;
}
```

### Triggering the Transition

When navigating, pass the appropriate type to the `startViewTransition` method.

```javascript
const transitionType = yourTransitionTypeLogic();
const updateDOM = yourUpdateDOMLogic();

document.startViewTransition({
  update: updateDOM,
  types: [transitionType] // Matches the CSS :active-view-transition-type() selectors
});
```


### Accessibility

Always respect user preferences for reduced motion by disabling or simplifying animations.

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(root) {
    animation: none !important;
  }
}
```

### Fallback strategies

Baseline status for View transitions: Newly available. It's been Baseline since 2025-10-14.
Supported by: Chrome 111 (Mar 2023), Edge 111 (Mar 2023), Firefox 144 (Oct 2025), and Safari 18 (Sep 2024).

Baseline status for Active view transition: Newly available. It's been Baseline since 2026-01-13.
Supported by: Chrome 125 (May 2024), Edge 125 (May 2024), Firefox 147 (Jan 2026), and Safari 18.2 (Dec 2024).

The View Transitions API is a progressive enhancement. In unsupported browsers, `document.startViewTransition` will be `undefined`. You must wrap your navigation logic in a feature detection check to ensure the DOM update still occurs immediately without animation, as shown in this helper function.

```javascript
/**
 * Navigates to a new view with a directional transition.
 * @param {Function} updateDOM - Callback to update the DOM state.
 * @param {string} direction - Either 'forward' or 'backward'.
 */
function navigate(updateDOM, direction) {
  // Feature detect for browsers that do not support View Transitions
  if (!document.startViewTransition) {
    updateDOM();
    return;
  }

  // Start transition with the specific navigation type
  document.startViewTransition({
    update: updateDOM,
    types: [direction] // Matches the CSS :active-view-transition-type() selectors
  });
}
```
