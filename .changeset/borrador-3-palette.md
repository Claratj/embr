---
'embr-ui': major
---

Rebase the colour tokens onto **borrador 3**: three brand families (plum, orange, teal) and a slate-green dark ramp. See `docs/adr/0006-borrador-3-palette.md`.

**Breaking:**

- Removed primitives: `color.magenta`, `amber*`, `amberLabel`, `tealBrand`, `gray*`, `sand`, `linen`, and the dark `charcoalRaised`/`charcoalSubtle`/`charcoalBorder`/`plumLight`/`deepGreenPage`/`grayLight`/`inkCaptionLight`. Status primitives are renamed to their hue: `neutral*`, `info*`, `green*`, `ochre*`, `crimson*`.
- Removed semantic role: `brand.accent` (no consumer; it duplicated `brand.primary`). Tailwind `bg-accent` / `text-accent` no longer compile.
- Changed values: `bg.inverse` is teal `#0A4544`; `brand.labelOnInverse` is sage-light `#CDE8E2` (was amber); `status.info` is teal, `status.success` green `#2F7D4F`, `status.warning` ochre `#D6A32C` (a solid warning now needs `text-on-warning-solid`, not white); every dark-mode neutral moves to the slate ramp, and dark link, eyebrow, focus and outline text move to light orange `#F38362`.

**Added:** `border.subtle`, `border.onInverse`, `brand.primaryText`, `brand.linkHover`, `brand.decor`, `brand.markFrame`, `brand.markScript`, `focus.ringOnInverse`, `status.onWarningSolid`, and `inverse.action` / `inverse.actionHover` / `text.onInverseAction`, each with a Tailwind utility in `preset.css`.

**Components:** `Button` outline uses `brand.primaryText`; `Card` uses `border.subtle`; solid warning `Badge` uses `status.onWarningSolid`.

**Migration:** replace `bg-accent`/`text-accent` with `bg-brand`/`text-brand-text`; if you painted white text on `bg-warning`, use `text-on-warning-solid`; references to removed primitives should move to the semantic role that used them.
