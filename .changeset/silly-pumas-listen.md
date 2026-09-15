---
'embr-ui': major
---

Rebase the brand palette onto Palette D: `plum`, `magenta`, `orange`, `rust`, `cream`, and `charcoal` all move to new hex values, `terracottaCta`/`terracottaCtaHover` darken, `green`/`teal`/`amber`/`crimson` (status bases) shift hue, dark `bg.page` moves from reused charcoal to a new deep-green primitive (`deepGreenPage`), dark `text.heading` and `focus.ring` are repointed (`sageLight`, `tealStrong`), and a new `brand.tertiary` role is added. Same category of change as the MyWeb rebase (`warm-otters-glow`) — breaking the token contract while there's still one consumer, not carrying old values forward.

Every pair this rebase touches was re-verified against the actually compiled CSS with `verify:contrast` (extended with new rows for `text.heading`, `text.onInverse`, the four solid-fill/`text.onBrand` pairs, `brand.eyebrow`, and `focus.ring` — not estimated from the source patch's claimed numbers, several of which didn't match what the compiled output measured):

- All newly-added Palette D pairs clear their floor with real margin: `text.heading` 13.20:1/13.28:1, `text.onInverse` 5.47:1, `brand.primary`/`primaryStrong` solid fills 6.15:1/9.68:1, status solid fills 4.95–6.20:1, `brand.eyebrow` 8.26:1/13.34:1, `focus.ring` 8.26:1/7.15:1 (floor 3:1).
- Existing STOP 1/2/5 pairs still pass in dark despite the `bg.page` hue change (border.default 3.55:1/3.13:1, text.caption 5.67:1/5.00:1, status.on-danger 6.71:1/5.92:1).

**Known, accepted gaps — not fixed here, flagged for follow-up:**

- **`text.caption` regression in light**: the new `cream` (`#F7F2F5`, darker/warmer than the old `#FAF9F5`) pushes `text.caption` (still 60% ink alpha, untouched by this rebase) under the 4.5:1 floor — 4.33:1 on `bg.page`, 4.48:1 on `bg.surface` (was 4.67:1/4.75:1). This is a real regression on a real consumer (Input/Textarea placeholder text), not a theoretical one. `verify:contrast` will fail on this until `inkCaption`'s alpha is retuned against the new `cream` — accepted as debt for this session rather than picking a replacement value unilaterally. **This means `npm run verify:contrast` and CI's compiled-CSS check are currently red.**
- Notable: Storybook's axe a11y gate (`npm test`, 64/64) does **not** catch this regression — same class of gap already flagged separately (axe's `color-contrast` rule reports genuine failures as `incomplete` rather than `violations` in this setup, so `a11y: { test: 'error' }` never sees them). `verify:contrast` is the only thing that caught this.
- **Dark `bg.page`/`bg.surface` hue mismatch**: `bg.page` moves to deep green (`#0B1F17`) but `bg.surface` (`#2E2327`) and `border.default` (`#826C73`) stay in the old warm-charcoal family. Contrast ratios still pass (3.55:1, 3.13:1), but page and surface no longer share a hue family — a visual inconsistency the source patch didn't call out among its own listed open items.
- **`info`/`warning`/`danger` Subtle/on/Border trios were not recomputed** for their nudged base hues (only `success`'s trio was) — inherited directly from the source patch, unchanged here.
- **`brand.tertiary` has no component consumer yet** — same class of risk as `border.control` in the MyWeb rebase: an unconsumed role can be silently wrong with no test to catch it.
