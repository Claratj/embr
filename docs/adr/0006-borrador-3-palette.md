# ADR 0006 — Borrador 3: three brand families, a slate dark ramp

- **Status:** Accepted
- **Date:** 2026-11-10
- **Phase:** sync (between phases 4 and 5)

## Context

Palette D (2026-09-10) left Embr with nine brand hues: plum, magenta, orange, amber, teal,
tealBrand, green, sand, linen. Several had no consumer, magenta and plum competed for the same
jobs, and the dark theme ran on a charcoal/plum ramp (`#2E2327`, `plumLight`) that the light theme
no longer resembled.

On 2026-11-09 the palette was redecided together with the claratoloba.com redesign ("borrador 3")
and recorded first in the Embr design-system artifact, where it was reviewed visually in both
themes. This repo is the code source of truth, so the decision lands here as a token rebase.

## Decision

Three brand families, each with one job:

- **Plum** `#4D0C3E` — identity: headings, eyebrow, link, focus ring.
- **Orange** `#C54120` — action: CTA fill. `orangeStrong` `#A2361A` is the CTA hover _and_ every
  piece of orange text (`brand.primaryText`, `brand.linkHover`).
- **Teal** `#0A4544` — calm and surface: `bg.inverse`, `status.info`. Sage `#AAD8D0` is decorative
  only (`brand.decor`); sage-light `#CDE8E2` is text on teal and plum and the dark-mode heading.

Status colours are functional, not brand: green, ochre, crimson, plus a neutral, each as a trio
(subtle fill / `on*` foreground / border). Ochre is too light for white text, so a solid warning
carries ink (`status.onWarningSolid`).

Dark mode uses a **slate-green ramp**, the brand teal hue at low chroma: page `#101717`, raised
`#1D2828`, subtle `#2A3737`, border `#5A7775`, muted `#859F9E`. One light orange, `#F38362`, does
every orange text job in dark. `bg.subtle` gets its own step (`slateSubtle`) so a hover on a card is
visible (it was equal to `bg.surface`, 1.00:1).

New semantic roles: `border.subtle`, `border.onInverse`, `brand.primaryText`, `brand.linkHover`,
`brand.decor`, `brand.markFrame`, `brand.markScript`, `focus.ringOnInverse`,
`status.onWarningSolid`, and a new `inverse` root (`inverse.action`, `inverse.actionHover`,
`text.onInverseAction`) for actions on the inverse surfaces, which are theme-invariant.

Retired: magenta, amber/amberLabel, tealBrand, gray, sand, linen, the charcoal/plum dark ramp, and
`brand.accent` (it never had a consumer and only duplicated `brand.primary`).

## Consequences

- Breaking for token consumers: names removed and values changed in both themes (see the
  changeset). `scripts/build-tokens.js` treats `inverse` as a semantic root.
- `verify:contrast` gains a row for every role the rebase added or re-pointed, in both themes; all
  gated rows pass. Success and danger still differ by hue more than by lightness (1.23:1), so
  status components must always carry a word, never colour alone.
- Components re-pointed in the same change: `Button` outline uses `brand.primaryText`, `Card` uses
  `border.subtle`, solid warning `Badge` uses `status.onWarningSolid`.
