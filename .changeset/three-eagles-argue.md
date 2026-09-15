---
'embr-ui': major
---

Correct three role assignments from the Palette D rebase (`silly-pumas-listen`) that didn't actually match the reference image, plus drop the three colors that never belonged to Palette D at all:

- **`brand.primary` (CTA)** — the image labels `#E2694A` "Accent principal / CTA primario", but that hex is only 3.31:1 with white text (fails AA). `color.orange` is retuned to `#C54120` — same hue/sat as `#E2694A`, darkened to L45% — 5.06:1 with white. `orangeStrong` (`#A2361A`, 6.82:1) is the hover step. `brand.accent` now shares the same primitive; it has no component consumer yet, same as before.
- **`brand.eyebrow` / `focus.ring`** — were on magenta, which the image reserves for Accent secundario (badges/tags — still no component consumer for that role, so `color.magenta`'s value is untouched, only its description). Both move to `color.plum` (13.20:1 on `bg.page`) to free magenta up and, more importantly, to avoid repeating the exact Phase 2 bug where `brand.primary` and `focus.ring` shared a value and made the focus ring invisible on the primary button.
- **`brand.link`** — was on `rust` (an orphan, see below). Palette D has no dedicated link hex, so this reuses `plum` too.
- **`status.success` / `brand.tertiary`** — the image says `#1E4A42` **is** the success color, not a role apart from it. `color.green` is retuned directly to `#1E4A42` (9.94:1 with white — matches the image's own stated "AAA" claim exactly), and the separate `color.tertiary`/`brand.tertiary` primitive and role are deleted rather than kept as an unconsumed duplicate.
- **Orphans removed**: `terracottaCta`, `terracottaCtaHover`, and `rust` never appeared in the Palette D reference image — deleted, not just unreferenced. Dark's `magentaLight` and `rustLight` are also gone (no longer used now that link/eyebrow/focus all moved to plum); dark reuses the already-existing `plumLight` for all three, per this theme's own rule that a dark tint is always its light counterpart's hue, only re-lightened.

Every changed pair re-verified against the compiled CSS with `verify:contrast` (extended with a new `brand.link` row): CTA fill/hover 5.06:1/6.82:1, success solid fill 9.94:1, eyebrow/link/focus.ring 13.20:1 light and 11.28:1 dark — all with real margin, both themes.

**Still pending, not addressed by this correction:**

- `successSubtle`/`onSuccess`/`successBorder` are tuned for the old rotated green (154.8°) and are now 14° off the true 169° success base — same "pending recompute" gap already open for info/warning/danger.
- The `text.caption` regression from `silly-pumas-listen` is untouched by this commit.
