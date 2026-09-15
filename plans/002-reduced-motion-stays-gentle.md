# 002 — Reduced motion should drop movement, not every transition

- **Status**: TODO
- **Commit**: 3d45113
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 4 files, one line each (`src/components/Button.tsx`, `src/components/Tag.tsx`, `src/components/FormField.tsx`, `src/components/internal/field-classes.ts`)

## Problem

Every transitioning component in this repo guards `prefers-reduced-motion` with `motion-reduce:transition-none`, which disables the _entire_ transition — including plain color/opacity fades that carry no motion sickness risk. AUDIT.md is explicit: "Reduced motion means fewer and gentler animations, **not zero** — keep transitions that aid comprehension, remove position changes." Right now, a reduced-motion user gets an instant, jarring color/opacity snap everywhere a motion-safe user gets a smooth 140–240ms fade.

Two different fixes are needed depending on whether the component's transition currently includes a `transform` (movement) component or not.

Current code:

```tsx
// src/components/Button.tsx:39-42 — current (color-only transition, no transform)
const BASE_CLASSES =
  'inline-flex items-center justify-center rounded-full font-body font-medium transition-colors ' +
  'duration-fast ease-out motion-reduce:transition-none disabled:pointer-events-none ' +
  'disabled:opacity-disabled';
```

```tsx
// src/components/Tag.tsx:22-26 — current (color + transform, transform added for press feedback)
const BASE_CLASSES =
  'inline-flex items-center rounded-full border font-body font-medium ' +
  'transition-[background-color,border-color,color,transform] duration-fast ease-out ' +
  'active:scale-[0.97] motion-reduce:transition-none disabled:pointer-events-none ' +
  'disabled:opacity-disabled';
```

```tsx
// src/components/FormField.tsx:114-127 — current (opacity + transform, transform is the entrance movement)
export function FormFieldError({ className, ...rest }: ComponentPropsWithRef<'p'>) {
  const field = useFormFieldContext('FormFieldError');
  return (
    <p
      id={field.errorId}
      className={cx(
        'text-sm font-medium text-on-danger transition-[opacity,transform] duration-base ' +
          'ease-out starting:opacity-0 starting:-translate-y-1 motion-reduce:transition-none',
        className,
      )}
      {...rest}
    />
  );
}
```

```ts
// src/components/internal/field-classes.ts:13-16 — current (color-only transition, no transform)
export const FIELD_BASE_CLASSES =
  'w-full rounded-sm border bg-surface text-ink font-body placeholder:text-caption ' +
  'transition-colors duration-fast ease-out motion-reduce:transition-none ' +
  'disabled:opacity-disabled';
```

## Target

**Rule for this plan**: if a class string's transition has no `transform` component, `motion-reduce:transition-none` is pure loss — delete it, the underlying transition is color/opacity-only and safe to keep under reduced motion. If it does include `transform`, replace `motion-reduce:transition-none` with a narrower override that repeats the _same_ `transition-[...]` property list minus `transform` — this keeps color/opacity easing while making the transform change instant (no movement).

```tsx
// src/components/Button.tsx:39-42 — target (no transform in this class today, so nothing to gate)
const BASE_CLASSES =
  'inline-flex items-center justify-center rounded-full font-body font-medium transition-colors ' +
  'duration-fast ease-out disabled:pointer-events-none disabled:opacity-disabled';
```

```tsx
// src/components/Tag.tsx:22-26 — target
const BASE_CLASSES =
  'inline-flex items-center rounded-full border font-body font-medium ' +
  'transition-[background-color,border-color,color,transform] duration-fast ease-out ' +
  'active:scale-[0.97] motion-reduce:transition-[background-color,border-color,color] ' +
  'disabled:pointer-events-none disabled:opacity-disabled';
```

```tsx
// src/components/FormField.tsx:114-127 — target
export function FormFieldError({ className, ...rest }: ComponentPropsWithRef<'p'>) {
  const field = useFormFieldContext('FormFieldError');
  return (
    <p
      id={field.errorId}
      className={cx(
        'text-sm font-medium text-on-danger transition-[opacity,transform] duration-base ' +
          'ease-out starting:opacity-0 starting:-translate-y-1 motion-reduce:transition-[opacity]',
        className,
      )}
      {...rest}
    />
  );
}
```

```ts
// src/components/internal/field-classes.ts:13-16 — target (no transform in this class, nothing to gate)
export const FIELD_BASE_CLASSES =
  'w-full rounded-sm border bg-surface text-ink font-body placeholder:text-caption ' +
  'transition-colors duration-fast ease-out disabled:opacity-disabled';
```

## Repo conventions to follow

- Tailwind arbitrary-value transition-property lists (`transition-[a,b,c]`) are already the repo's own convention for multi-property transitions — see `src/components/Tag.tsx:24` and `src/components/FormField.tsx:120` (both written this session). This plan reuses the exact same syntax, just with a shorter property list under `motion-reduce:`.
- Keep `duration-fast`/`duration-base`/`ease-out` untouched — this plan only changes _which properties_ transition under reduced motion, never the timing values.

## Steps

1. In `src/components/Button.tsx`, in `BASE_CLASSES` (currently lines 39-42): delete `motion-reduce:transition-none ` (including the trailing space before `disabled:pointer-events-none`), leaving the rest of the string unchanged. There is no `transform` in this class today, so there is nothing to gate — the color fade is comprehension-safe and should run under reduced motion too.
2. In `src/components/Tag.tsx`, in `BASE_CLASSES` (currently lines 22-26): replace `motion-reduce:transition-none` with `motion-reduce:transition-[background-color,border-color,color]` — the same property list as the base `transition-[...]` utility, minus `transform`.
3. In `src/components/FormField.tsx`, in `FormFieldError`'s className (currently lines 119-121): replace `motion-reduce:transition-none` with `motion-reduce:transition-[opacity]` — keeps the fade-in, drops the `-translate-y-1` entrance slide.
4. In `src/components/internal/field-classes.ts`, in `FIELD_BASE_CLASSES` (currently lines 13-16): delete `motion-reduce:transition-none ` (including the trailing space). There is no `transform` in this class — the border-color fade on invalid is comprehension-safe and should run under reduced motion too.

## Boundaries

- Do NOT touch `Badge.tsx` or `Card.tsx` — neither has a transition or a `motion-reduce:` class.
- Do NOT change any `duration-*`, `ease-*`, or color/property values — only the `motion-reduce:` override itself.
- If this plan runs _after_ plan 001 (`003-button-press-feedback.md`) has already added `active:scale-[0.97]` and widened the transition list on `Button.tsx`, the Button step differs: instead of deleting `motion-reduce:transition-none`, replace it with `motion-reduce:transition-[background-color]` (matching Tag's pattern) so the newly-added press transform is excluded, not the color fade. Check the actual current content of `BASE_CLASSES` before editing — if it already contains `active:scale-[0.97]`, use this variant of the step instead of the one in Target above.
- If any of the four class strings above don't match what you find in the file (drift since commit `3d45113`, beyond the Button case just described), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint`, `npm test` — all expected to pass with no changes needed to any test file.
- **Feel check**:
  - In Chrome DevTools, open the Rendering panel (Cmd+Shift+P → "Show Rendering") and set "Emulate CSS media feature prefers-reduced-motion" to `reduce`.
  - Button/Tag: hover and click each. Confirm the background color still fades (not an instant snap), and on Tag confirm the press no longer scales (snaps instantly between 1 and 0.97, no visible easing).
  - FormField: toggle a field between valid and invalid a few times (e.g. the "With error" story). Confirm the error text's opacity still fades in over ~240ms, and does **not** visibly slide down from above — no residual jump or flash where the un-transitioned `-translate-y-1` starting position might otherwise show for a frame.
  - Input/Textarea: toggle `invalid` on the Input story. Confirm the border color still eases from `border-border` to `border-danger` under reduced motion.
  - Turn "Emulate ... prefers-reduced-motion" back to "No emulation" and re-check all four components look and feel exactly as they did before this plan (this plan must not change motion-safe behavior at all).
- **Done when**: every component with a transition still gives comprehension feedback (color/opacity fades) under reduced motion, no component moves/scales under reduced motion, and motion-safe behavior is byte-for-byte unchanged.
