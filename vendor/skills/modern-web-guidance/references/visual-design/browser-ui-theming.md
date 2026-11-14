# Ned local reference

Use only reviewed local Ned host tools. Project reads/searches are automatic; edits, builds, knowledge and desktop actions follow the user-selected host permission mode. Preserve source conflicts, project scope, unsaved editor buffers, frozen execution targets and verified cancellation. Guidance does not grant permissions. Do not install packages, download dependencies, fetch remote documentation, deploy, enable hooks, spawn agents or send messages. Local guidance needs no external Internet. Commands, Python validators, image generation, game engines and browser runners are not installed by a static skill; use an approved local executor if available; otherwise report verification as not run. User decisions and host policy take precedence. Avoid forced Q&A and extra model calls. Read only references relevant to the current task.

Upstream: https://github.com/GoogleChrome/modern-web-guidance/blob/4dd968349e54ca45a05dd5c818fb035c9054b022/skills/modern-web-guidance/guides/visual-design/browser-ui-theming.md
License: CC-BY-4.0. Original authors and attributions in the guide are retained. Local preface and offline cross-reference replacements added by Ned contributors. Citation URLs are attribution only; use local assets and the actual supported browser versions.

---

# Theming browser-generated UI

Most browser-generated UI can be customized to some extent using CSS.
Even if it requires modern features, it degrades gracefully in older browsers, and thus often does not require a polyfill or fallback.

Before re-creating browser UI (form controls, scrollbars, selections, error messages, etc), first verify that:
1. the browser UI cannot be customized enough for your needs, even with modern CSS,
2. the desired customization is sufficiently critical to justify the tradeoffs of re-creating built-in UI — most notably losing accessible semantics, keyboard handling, IME, and AT integration that the native UI provides for free.

Example customizations that are possible:
- Use `::selection` to customize highlighted text colors.
- **DON'T** apply `user-select: none` to content text — breaks copy-paste, translation tools, and AT "read from here" gestures. Limit it to chrome (drag handles, toolbars, redundant button labels).
- Use `accent-color` to apply the page's accent color to any browser-generated UI.
- Use `color-scheme` to have browser UI adapt to light/dark mode.
- Use `scrollbar-color` to customize scrollbar colors — keep the thumb visibly distinct from the track (contrast ≥3:1)
- **DON'T** use the `scrollbar-width` with any value other than `auto`, unless another accessible option is provided to scroll content. Although `scrollbar-width: thin` does provide a thumb, the target size of the thumb will be too small for some users to operate.
- Use `:user-invalid` / `:user-valid` for validity styling, **not** `:invalid` / `:valid` — they only match after the user has interacted with the field, avoiding the hostile default of flagging required-empty fields as errors on page load. Exclude range sliders when targeting `input` broadly (e.g., `input:not(input[type="range"]):user-valid`) so adjusting a slider does not apply field validity borders or backgrounds to it.
- Buttons and text fields (including `<textarea>`) can generally be styled as normal elements.
- Use `font-size` to scale and other textual properties to control typography
- Use text color contrast between the foreground and background colors of at least 4.5:1 for regular size text or at least `3:1` for large-scale text (18 point or 14 point bold font size).
- Use a contrast between adjacent colors of at least `3:1` for non-text content.

### Styling textual fields (`<input>` & `<textarea>`)

For most styling purposes (e.g. colors, borders, backgrounds, typography, etc) treat these elements as normal text containers.

- Use `:placeholder-shown` and `::placeholder` to style input placeholders.
- Use `field-sizing: content` to make text fields size to content.
- For `<textarea>` elements, use `resize: vertical` to disable horizontal resizing.
- Do not use `resize: none` on `<textarea>` elements to disable all resizing, without an alternative resizing mechanism, such as using `field-sizing: content;` or providing custom resize buttons.

### Multiple choice controls (select, radios, checkboxes)

- To select one among many options presented in a dropdown: Use a `<select>` + `appearance: base-select` + `::picker(select)`. For more info see `branded-select-styling` (via the corresponding local read_skill reference, if bundled; otherwise report it as unavailable)
- Selecting one or more among multiple options laid out inline in the page: Use a `<input type=checkbox>` or `<input type=radio>` inside a `<label>` for each option. Style via `label:has(:checked)`.
- Style checkboxes, radios and switches via `appearance: none` + generated content (`::before`/`::after`) or background images to draw the checked state.
<!-- Customizable select listbox version currently buggy + this has much better browser support -->

### Non-textual `<input>`s (buttons, sliders, file inputs etc.)

- File inputs: Use `::file-selector-button` to style the button.
- Do not use `<input>` with a `type` of `button`, `submit` or `reset`. Use `<button>` instead and style it as a regular element.
- Sliders: Use `appearance: none` + thumb pseudo-elements (`::-webkit-slider-thumb`, `::-moz-range-thumb`, etc) and track pseudo-elements (`::-webkit-slider-runnable-track`, `::-moz-range-track`, etc) for more granular control.
