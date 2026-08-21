---
'embr-ui': minor
---

Three components: `Input`, `Textarea`, `FormField` (plus `FormFieldLabel`/`FormFieldDescription`/`FormFieldError`).

All three ship with `ref` as a regular prop (React 19 — no `forwardRef`), are RSC-safe, and stay tree-shakeable via per-component exports.

- **Input** — `sm` / `md` sizes (default `md`), `invalid?: boolean`. No `asChild` (not a link), no adornments/icons/prefix-suffix yet. No hover treatment on the border; focus is the existing global `:focus-visible` rule, unchanged — neither Input nor Textarea adds a focus class. `invalid` swaps a 1px `border-border` for a 2px `border-danger` and sets `aria-invalid`; the field grows 2px rather than compensating with a non-token padding value.
- **Textarea** — identical tokens, states, and `size` prop to Input (shared via an internal module — both are specified to stay in lockstep). `rows` defaults to 3, `resize: vertical` only. Ships with **no `min-height`**: expressing "at least as tall as Input md" needs either a literal pixel value or a new height token, and neither exists this session — known, documented gap.
- **FormField** — the accessibility piece; Input/Textarea are just styled controls. Wires `FormFieldLabel`/`FormFieldDescription`/`FormFieldError` and the control together by id via React context + `useId`, never by cloning children or asking the consumer to pass matching ids. `invalid` is derived from whether a `FormFieldError` is actually rendered, not a separate prop, so a consumer is never in a position to set `invalid` and pass an error that disagree. Label is mandatory (`FormFieldLabel`'s `srOnly` prop is the only sanctioned way to hide it visually — there is no "no label" mode). The error never replaces the description; both feed `aria-describedby`, error first. `required` puts the native attribute on the control and a visible, `aria-hidden` marker on the label.

**Two token fixes, both proven against the compiled CSS with a new `scripts/verify-contrast.mjs`, not estimated:**

- `border.control` was referenced by the token docs since the previous release but never actually existed in `tokens/` — confirmed absent, not a build failure. `border.default` (the only neutral border role) failed the 3:1 control-boundary floor on all four surface/theme combinations (1.28:1 light, 1.99/1.66:1 dark). Retuned in place — light ink alpha 12% → 48%, dark hex `#564349` → `#826C73` — no new token. This also strengthens `Tag`'s unselected border and `Card`'s border, the only other consumers; deliberate, not managed around.
- `text.caption` had no dark override at all (light and dark shared the same value) and failed the 4.5:1 text floor in **both** themes, not just dark (light 3.97–4.03:1, dark 1.00–1.11:1). Retuned light ink alpha to 60% and added a real dark override (new `inkCaptionLight` primitive) — both now clear 4.5:1 with margin.

**Known, accepted gaps, documented rather than silently fixed:**

- Input/Textarea's height still doesn't match `Button` pixel-for-pixel: `md` is a 2px gap (39px vs 37px), `sm` is a 1px gap (28px vs 27px) — not a uniform 2px as a first pass assumed. A uniform transparent border on `Button` would close the `md` gap exactly but overshoot `sm` by 1px the other way, so left as-is.
- `FormFieldError` still uses `status.danger`, which fails 4.5:1 as text in dark (2.89–2.94:1); `status.on-danger` passes both themes and is the documented correct fix, deferred rather than switched to unilaterally.
- A pre-existing, unrelated gap surfaced while verifying the above: the Storybook/Vitest axe integration (`a11y: { test: 'error' }`) does not appear to actually enforce anything — confirmed with two planted violations (a labelless input, white-on-white text) that both passed silently. Not fixed here; flagged in `EMBR-PHASE-4.md` for follow-up.

`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, and `jsdom` are new devDependencies — the `unit` Vitest project (named in `vitest.config.ts` since phase 2) had no consumer until `FormField.test.tsx`.
