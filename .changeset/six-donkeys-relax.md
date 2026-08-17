---
'embr-ui': patch
---

Dark mode: a real palette, not a stub.

- **Dark neutrals.** `bg.surface` and `bg.subtle` are now genuine raised/subtle dark neutrals
  (`#2E2327`, `#3F3136`), not aliases of the primary text color, as the previous release's dark
  mode was. `border.default` follows the same pattern. All three are new dark-only primitives in
  `tokens/themes/dark/`, not changes to the light palette or any brand value.
- **Dark focus ring.** `focus.ring` is now overridden for dark — the light-mode magenta is only
  2.54:1 on the dark page (below WCAG 2.4.11's 3:1 floor for a focus indicator); dark mode gets a
  lighter tint of the same hue, verified at 4.30:1 on `bg.page` and 3.59:1 on `bg.surface`.
- **Dark link color**, same reasoning: the light-mode `brand.link` (rust) drops to 3.35:1 on a dark
  page, below AA text contrast; dark mode gets a lighter tint verified at 5.11:1.
- **`status.*` colors are intentionally NOT re-tuned for dark in this release** — they remain
  correct as fills (white text on any of them is 5–6.3:1 regardless of theme) but are not meant
  for bare inline text on the page background in either theme. This is a known, documented gap
  ahead of the Badge/StatusPill component, not an oversight.
- **Foundations, fully documented.** Typography, Spacing, Radii, Shadows and Focus join Colors in
  Storybook — each generated live from the typed token export, each with a light and dark story.

This corrects the previous release's changelog, which described dark mode as "a working stub."
That was accurate when it shipped; this release is what Phase 1 of that entry pointed at.
