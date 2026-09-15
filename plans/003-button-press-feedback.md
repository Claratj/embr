# 003 — Add press feedback to Button

- **Status**: TODO
- **Commit**: 3d45113
- **Severity**: MEDIUM
- **Category**: Physicality & origin
- **Estimated scope**: 1 file, 1 class string (`src/components/Button.tsx`)

## Problem

`Button` is the most-instantiated interactive primitive in this design system. It has a hover treatment (`hover:bg-*` per variant) but no response to being pressed — clicking it gives zero tactile feedback before the `onClick` fires. `Tag.tsx` already solved this exact problem this session (see Repo conventions below) — `Button` is the one component in the interactive set that still lacks it.

Current code:

```tsx
// src/components/Button.tsx:39-42 — current
const BASE_CLASSES =
  'inline-flex items-center justify-center rounded-full font-body font-medium transition-colors ' +
  'duration-fast ease-out motion-reduce:transition-none disabled:pointer-events-none ' +
  'disabled:opacity-disabled';
```

## Target

```tsx
// src/components/Button.tsx:39-42 — target
const BASE_CLASSES =
  'inline-flex items-center justify-center rounded-full font-body font-medium ' +
  'transition-[background-color,transform] duration-fast ease-out active:scale-[0.97] ' +
  'motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-disabled';
```

`background-color` (not the broader `transition-colors`) because that's the only color property any `VARIANT_CLASSES` entry (`src/components/Button.tsx:21-25`) ever changes on hover — `outline`'s border stays `border-brand` at rest and on hover, and no variant changes text color on hover. `duration-fast` (140ms) and `ease-out` are `--embr-motion-duration-fast` / `--embr-motion-easing-out` — already the values on this exact line, unchanged. `scale-[0.97]` is within AUDIT.md's press-feedback range (`scale(0.95–0.97)`) and matches `Tag.tsx`'s value exactly.

## Repo conventions to follow

- **Exemplar — copy this pattern exactly**: `src/components/Tag.tsx:22-26`, added this session for the identical problem on `Tag`:
  ```tsx
  const BASE_CLASSES =
    'inline-flex items-center rounded-full border font-body font-medium ' +
    'transition-[background-color,border-color,color,transform] duration-fast ease-out ' +
    'active:scale-[0.97] motion-reduce:transition-none disabled:pointer-events-none ' +
    'disabled:opacity-disabled';
  ```
  Button's version is narrower (`background-color` only, no `border-color`/`color`) because, unlike Tag, no `VARIANT_CLASSES` entry changes border or text color on hover.
- `duration-fast`/`ease-out`/`motion-reduce:transition-none` are already present on this line — do not introduce new token names, only add `active:scale-[0.97]` and widen the transition-property list.

## Steps

1. In `src/components/Button.tsx`, replace `BASE_CLASSES` (currently lines 39-42) with the Target block above. This is the only edit.

## Boundaries

- Do NOT touch `VARIANT_CLASSES`, `SIZE_CLASSES`, or any other part of the file.
- Do NOT touch `Tag.tsx`, `Badge.tsx`, `Card.tsx`, `Input.tsx`, `Textarea.tsx`, `field-classes.ts`, or `FormField.tsx`.
- Do NOT add asymmetric press/release timing — this is a simple press, not a hold-to-confirm; AUDIT.md's asymmetric-timing guidance applies to deliberate multi-phase interactions, not a plain button press.
- If `BASE_CLASSES` doesn't match the Current snippet above (drift since commit `3d45113` — e.g. if plan 002 already ran and removed `motion-reduce:transition-none`), adapt only the specific lines that differ; still add `transition-[background-color,transform]` and `active:scale-[0.97]` in the same position shown in Target, and STOP to report if the surrounding structure is unrecognizable rather than guessing.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint`, `npm test` — all expected to pass unchanged (no test asserts on `BASE_CLASSES`' literal string). `npm run build-storybook` should still succeed.
- **Feel check**:
  - Open Storybook's Button stories (`solid`, `outline`, `ghost` × `sm`, `md`). Click and hold each: confirm a subtle, fast shrink (should read as "pressed," not as a bounce or wobble) that releases back to full size on mouseup.
  - In DevTools' Animations panel (More tools → Animations), trigger a press and set playback to 10%: confirm the scale change and the (unrelated, pre-existing) hover color change are both smooth over ~140ms, no stepping.
  - Confirm disabled Buttons (`disabled` story, if present, or add `disabled` in the Storybook controls) do not scale on click — `disabled:pointer-events-none` should prevent `:active` from ever engaging.
  - Fire clicks rapidly (double/triple-click) on a Button: confirm the scale transition retargets smoothly each time rather than snapping or stacking (this is inherent to using a CSS transition rather than a keyframe animation, but confirm it visually).
- **Done when**: every Button variant/size gives a visible, fast press response, disabled Buttons never scale, and all mechanical checks pass.
