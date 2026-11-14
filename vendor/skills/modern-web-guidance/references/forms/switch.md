# Ned local reference

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

Upstream: https://github.com/GoogleChrome/modern-web-guidance/blob/4dd968349e54ca45a05dd5c818fb035c9054b022/skills/modern-web-guidance/guides/forms/switch.md
License: CC-BY-4.0. Original authors and attributions in the guide are retained. Local preface and offline cross-reference replacements added by Ned contributors. Citation URLs are attribution only; use local assets and the actual supported browser versions.

---

# Build Accessible Switch Controls

Use the HTML `switch` attribute on `<input type="checkbox" switch>` with an associated `<label>` to build a binary on/off toggle that preserves native form submission, keyboard navigation, and screen reader semantics (see `checkbox` (via the corresponding local read_skill reference, if bundled; otherwise report it as unavailable) and `forms` (via the corresponding local read_skill reference, if bundled; otherwise report it as unavailable)).

## Markup

Add the boolean `switch` attribute to a standard checkbox input:

```html
<label>
  Enable notifications
  <input id="notifications" type="checkbox" switch>
</label>
```

- The label can wrap the input or be associated with `for`/`id`. All styling targets the input, so it doesn't depend on the label structure.
- When checked, the input submits its standard checkbox value. In JavaScript, listen for `change` (or `input`) events and read `.checked` rather than `.value`.

## Styling

Customize the control's highlight color using `accent-color` (see `brand-consistent-forms` (via the corresponding local read_skill reference, if bundled; otherwise report it as unavailable)) and ensure visible focus styling:

```css
input[type="checkbox"][switch] {
  accent-color: var(--accent-color, #1769e0);
  margin: 0;
  cursor: pointer;
}

input[type="checkbox"][switch]:focus-visible {
  outline: 3px solid var(--focus-color, #ff8c00);
  outline-offset: 4px;
}
```

## Fallback strategies

### Fallbacks & browser support for switch-control

Browser support for <input type="checkbox" switch>: Limited availability.
Supported by: Safari 17.4 (Mar 2024).
Unsupported in: Chrome, Edge, and Firefox.

If your Baseline target does not support `<input type="checkbox" switch>`, load `input-switch-polyfill` only when `'switch' in HTMLInputElement.prototype` is `false`. Do not load the polyfill unconditionally. The polyfill enhances checkboxes with the `switch` attribute by setting `role="switch"`, applying switch styling (`appearance: none`), syncing computed `accent-color`, and providing pointer drag support.

Use the package-loading approach appropriate to your project. The example below assumes your setup can resolve module specifiers:

```javascript
if (!('switch' in HTMLInputElement.prototype)) {
  import('input-switch-polyfill');
}
```

### Fallbacks & browser support for accent-color

Browser support for accent-color: Limited availability.
Supported by: Chrome 93 (Aug 2021), Edge 93 (Sep 2021), Firefox 92 (Sep 2021), and Safari 26.2 (Dec 2025).

The `accent-color` property is progressive enhancement.
Browsers that do not support this property will ignore it and use their default UI colors.
