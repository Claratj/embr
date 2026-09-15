# 001 — Gate `hover:` classes behind `(hover: hover) and (pointer: fine)`

- **Status**: DONE
- **Commit**: 3d45113
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 2 files (`src/css/theme.css`, `src/components/Button.tsx`, `src/components/Tag.tsx` — 3 files total), no new dependencies

## Problem

`Button` and `Tag` apply `hover:bg-*` classes with Tailwind's default `hover:` variant, which compiles to a bare `:hover` pseudo-class with no pointer-type gating. On touch devices, tapping the element fires `:hover` and it can stay visually "stuck" in its hover color until the user taps elsewhere on the page — there is no mouse to move away and clear it.

Current code:

```tsx
// src/components/Button.tsx:21-25 — current
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  solid: 'bg-brand text-on-brand hover:bg-brand-strong',
  outline: 'border border-brand text-brand bg-transparent hover:bg-subtle',
  ghost: 'text-ink bg-transparent hover:bg-subtle',
};
```

```tsx
// src/components/Tag.tsx:34-37 — current
const STATE_CLASSES = {
  unselected: 'border-border bg-page text-ink hover:bg-subtle',
  selected: 'border-transparent bg-brand text-on-brand hover:bg-brand-strong',
};
```

## Target

A single shared Tailwind variant, gated on `(hover: hover) and (pointer: fine)` — the same media feature AUDIT.md's accessibility section specifies — applied everywhere `hover:` currently appears on these two components.

```css
/* src/css/theme.css — target, new top-level at-rule before @theme inline { */
@custom-variant can-hover (@media (hover: hover) and (pointer: fine));
```

```tsx
// src/components/Button.tsx:21-25 — target
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  solid: 'bg-brand text-on-brand can-hover:hover:bg-brand-strong',
  outline: 'border border-brand text-brand bg-transparent can-hover:hover:bg-subtle',
  ghost: 'text-ink bg-transparent can-hover:hover:bg-subtle',
};
```

```tsx
// src/components/Tag.tsx:34-37 — target
const STATE_CLASSES = {
  unselected: 'border-border bg-page text-ink can-hover:hover:bg-subtle',
  selected: 'border-transparent bg-brand text-on-brand can-hover:hover:bg-brand-strong',
};
```

## Repo conventions to follow

- Build-time Tailwind configuration (variant/theme declarations) lives in `src/css/theme.css`, the file already imported right after `@import 'tailwindcss'` in `.storybook/storybook.css:13` and in the published `dist/styles.css` build (`scripts/build-css.js`). Add the `@custom-variant` there, not in a new file.
- `theme.css` is documented top-to-bottom by section comments (`/* ---- Color ---- */` etc. — see `src/css/theme.css:38-176`). Add a short comment above the new `@custom-variant` explaining _why_ it exists, matching that file's voice (see the existing `@utility duration-fast` comment at `src/css/theme.css:178-183` for tone/length).
- Every other component in this repo composes variants by stacking them directly in the class string (e.g. `disabled:pointer-events-none`, `motion-reduce:transition-none` in `src/components/Button.tsx:39-42`) — `can-hover:hover:bg-*` follows that same stacking convention, it is not a new pattern.

## Steps

1. In `src/css/theme.css`, add the custom variant near the top of the file, before the `@theme inline {` block starts (currently `src/css/theme.css:38`):
   ```css
   /*
    * `can-hover:` gates `:hover` behind `(hover: hover) and (pointer: fine)` — plain `hover:`
    * fires on tap on touch devices with no way to clear it, leaving a button/tag stuck in its
    * hover color. Interactive components should always stack this in front of `hover:`.
    */
   @custom-variant can-hover (@media (hover: hover) and (pointer: fine));
   ```
2. In `src/components/Button.tsx`, in `VARIANT_CLASSES` (currently lines 21-25), prefix all three `hover:bg-*` occurrences with `can-hover:` as shown in Target.
3. In `src/components/Tag.tsx`, in `STATE_CLASSES` (currently lines 34-37), prefix both `hover:bg-*` occurrences with `can-hover:` as shown in Target.

## Boundaries

- Do NOT touch `Input`/`Textarea`/`field-classes.ts` — they intentionally have no hover treatment (`src/components/internal/field-classes.ts:8-11` documents this as deliberate, not an oversight).
- Do NOT touch `Card`, `Badge` — neither has a `hover:` class; nothing to gate.
- Do NOT change any color values, only the variant prefix.
- Do NOT add a JS media-query hook or any dependency — this is a pure CSS/Tailwind config change.
- If `VARIANT_CLASSES` or `STATE_CLASSES` no longer match the snippets above (drift since commit `3d45113`), STOP and report instead of improvising — another plan (e.g. 003, which also edits `Button.tsx`'s class strings) may have landed first.

## Verification

- **Mechanical**: `npm run typecheck` (expect no errors) and `npm run lint` (expect no errors) and `npm test` (expect all existing suites green — no test asserts on the literal class string). `npm run build-storybook` should still succeed.
- **Feel check**:
  - Open Storybook, go to the Button and Tag stories.
  - In Chrome DevTools, open the Device Toolbar (Cmd+Shift+M) and pick a touch device (e.g. "iPhone 14"). Tap a Button/Tag. Confirm the hover background does **not** apply and does **not** stick after the tap.
  - Switch back to a non-touch/desktop viewport. Confirm hovering with a real mouse still shows the hover background exactly as before this change.
  - In the Elements panel, force `:hover` state on a Button/Tag with the device toolbar in touch mode — confirm the computed `background-color` is unaffected (the `can-hover:hover:` rule shouldn't apply at all under `pointer: coarse`).
- **Done when**: hover backgrounds only ever apply under `(hover: hover) and (pointer: fine)`, mouse-hover behavior on desktop is pixel-identical to before, and all mechanical checks pass.
