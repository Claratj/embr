# 004 — Add a `motion.easing.default` token for pure color/border transitions

- **Status**: TODO
- **Commit**: 3d45113
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 3 files (`tokens/core.json`, `src/css/theme.css`, `src/components/internal/field-classes.ts`) + a token rebuild

## Problem

The design system has exactly one easing token, `motion.easing.out` (`--embr-motion-easing-out`, `cubic-bezier(0.22, 1, 0.36, 1)`, exposed as the Tailwind utility `ease-out`). AUDIT.md's easing decision order recommends plain `ease` — not `ease-out` — for hover/color-change transitions, reserving `ease-out` for entering/exiting and moving/morphing motion. Right now every color transition in the repo, including ones with no entrance or press component, uses `ease-out` simply because it's the only curve available.

This is genuinely LOW/optional: the repo has clearly chosen minimalism (one curve, reused everywhere) on purpose, and the mismatch is subtle. Scope this plan to the one place it can be applied with zero side effects — `field-classes.ts`'s `FIELD_BASE_CLASSES`, whose transition is border-color only, never combined with a `transform`. Do **not** attempt this on `Button`/`Tag`: their transitions mix `background-color` (which should ease with `ease`) and `transform` (which should keep `ease-out`) in a single Tailwind transition utility, and splitting one utility into two differently-eased properties needs a much more invasive arbitrary-value rewrite — disproportionate for a LOW finding. Leave them on `ease-out`.

Current code:

```json
// tokens/core.json:106-109 — current
"easing": {
  "$type": "cubicBezier",
  "out": { "$value": [0.22, 1, 0.36, 1] }
}
```

```css
/* src/css/theme.css:170-176 — current */
/* ---- Motion ------------------------------------------------------------------------ */
/* `--ease-*` is a real Tailwind theme namespace (unlike duration/opacity below), so it goes
   through @theme like everything else. Reset first: Tailwind ships its own ease-in/out/in-out
   values, and golden rule 1 means those shouldn't be usable un-tokenized. */
--ease-*: initial;
--ease-out: var(--embr-motion-easing-out);
```

```ts
// src/components/internal/field-classes.ts:13-16 — current
export const FIELD_BASE_CLASSES =
  'w-full rounded-sm border bg-surface text-ink font-body placeholder:text-caption ' +
  'transition-colors duration-fast ease-out motion-reduce:transition-none ' +
  'disabled:opacity-disabled';
```

## Target

`ease` is not an arbitrary approximation — CSS defines the `ease` keyword as exactly `cubic-bezier(0.25, 0.1, 0.25, 1)` per the CSS Easing Functions spec. Add that exact curve as a second token, named `default` to match this system's existing naming (`motion.easing.out`, sibling `motion.easing.default`).

```json
// tokens/core.json:106-110 — target
"easing": {
  "$type": "cubicBezier",
  "out": { "$value": [0.22, 1, 0.36, 1] },
  "default": { "$value": [0.25, 0.1, 0.25, 1] }
}
```

```css
/* src/css/theme.css:170-177 — target */
/* ---- Motion ------------------------------------------------------------------------ */
/* `--ease-*` is a real Tailwind theme namespace (unlike duration/opacity below), so it goes
   through @theme like everything else. Reset first: Tailwind ships its own ease-in/out/in-out
   values, and golden rule 1 means those shouldn't be usable un-tokenized.
   `ease-default` is CSS's own `ease` curve (cubic-bezier(0.25,0.1,0.25,1)), tokenized for pure
   color/border transitions; `ease-out` stays reserved for entrances, exits, and press feedback. */
--ease-*: initial;
--ease-out: var(--embr-motion-easing-out);
--ease-default: var(--embr-motion-easing-default);
```

```ts
// src/components/internal/field-classes.ts:13-16 — target
export const FIELD_BASE_CLASSES =
  'w-full rounded-sm border bg-surface text-ink font-body placeholder:text-caption ' +
  'transition-colors duration-fast ease-default motion-reduce:transition-none ' +
  'disabled:opacity-disabled';
```

## Repo conventions to follow

- Token pipeline: DTCG JSON in `tokens/core.json` → `npm run build:tokens` (Style Dictionary) → `src/tokens/generated/tokens.css` (`--embr-*` vars) + `tokens.ts` (typed export) → bridged into Tailwind's `@theme inline` block in `src/css/theme.css`. This plan adds one token and follows that exact pipeline — do not hand-edit anything under `src/tokens/generated/`, it is build output.
- Naming: the existing key is `motion.easing.out`; this plan's new key is `motion.easing.default`, generating `--embr-motion-easing-default` and Tailwind utility `ease-default` — consistent with how `motion.duration.fast`/`motion.duration.base` already generate `duration-fast`/`duration-base` (`src/css/theme.css:184-190`).
- `Input.tsx`/`Textarea.tsx` both consume `FIELD_BASE_CLASSES` from `field-classes.ts` (see `src/components/Input.tsx:56-61`, `src/components/Textarea.tsx:63-69`) — editing the shared constant updates both, per the file's own STEP 2 comment ("if the two files diverge... one of them is wrong").

## Steps

1. In `tokens/core.json`, inside the `motion.easing` object (currently `tokens/core.json:106-109`), add `"default": { "$value": [0.25, 0.1, 0.25, 1] }` as a sibling of `"out"`, as shown in Target.
2. Run `npm run build:tokens`. Confirm it exits 0 and that `src/tokens/generated/tokens.css` now contains a line `--embr-motion-easing-default: cubic-bezier(0.25, 0.1, 0.25, 1);` (or equivalent — check the actual generated syntax, do not assume).
3. In `src/css/theme.css`, inside the `@theme inline { ... }` block's Motion section (currently `src/css/theme.css:170-176`), add `--ease-default: var(--embr-motion-easing-default);` on its own line after the existing `--ease-out` line, and update the section's comment as shown in Target to explain the split.
4. In `src/components/internal/field-classes.ts`, in `FIELD_BASE_CLASSES` (currently lines 13-16), change `ease-out` to `ease-default`.

## Boundaries

- Do NOT touch `Button.tsx` or `Tag.tsx` — their transitions mix transform with color in one utility; per Problem above, this plan does not attempt a per-property easing split there.
- Do NOT touch `FormField.tsx`'s `FormFieldError` — its transition is an entrance (opacity + transform), which correctly keeps `ease-out` per AUDIT.md's decision order.
- Do NOT rename or remove `motion.easing.out` / `--embr-motion-easing-out` / `ease-out` — it stays exactly as-is, still used by every entrance/press-feedback transition in the system.
- Do NOT hand-edit `src/tokens/generated/tokens.css` or `tokens.ts` directly — they are build output; if step 2's `build:tokens` run doesn't produce the expected variable, STOP and report rather than editing the generated file by hand.
- If `tokens/core.json`'s `easing` object, or `field-classes.ts`'s `FIELD_BASE_CLASSES`, don't match the Current snippets above (drift since commit `3d45113`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run build:tokens` (exit 0, new var present as described in Step 2), `npm run typecheck`, `npm run lint`, `npm test` — all expected to pass. `npm run build` (full library build, runs `build:tokens` again via `prebuild`) should also succeed, confirming `dist/tokens.css` picks up the new variable too.
- **Feel check**:
  - Open Storybook's Input story, toggle `invalid` on and off a few times via controls. The border-color transition should look effectively identical to before — `ease` and this repo's `ease-out` are both fast-starting curves at 140ms, so the difference is subtle by design, not a visible personality change.
  - In DevTools' Animations panel, capture the border-color transition and compare its computed easing function to `cubic-bezier(0.25, 0.1, 0.25, 1)` in the Elements → Computed panel for `transition-timing-function`.
  - Confirm Button and Tag's hover/press transitions are visually unchanged (they should be — this plan doesn't touch them).
- **Done when**: `ease-default` resolves to CSS's exact `ease` curve, only `FIELD_BASE_CLASSES` uses it, `ease-out` is unchanged and still used everywhere else, and all mechanical checks (including a full `npm run build`) pass.
