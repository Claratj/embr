---
'embr-ui': major
---

Rebase the brand palette onto MyWeb (claratoloba.com), which is now the source of truth for Embr's tokens. There is exactly one consumer today, so this is the cheap moment to break the token contract rather than carry the old values forward.

**Breaking:**

- `brand.primary` moves from magenta to terracotta (`#CF3F17`, 4.55:1 vs `bg.page`, 4.80:1 with `text.onBrand`); `brand.primaryStrong` follows (`#B5330D`, 6.10:1). Magenta's only remaining job is `focus.ring` and the new `brand.eyebrow`. This also fixes a real bug: `brand.primary` and `focus.ring` used to both resolve to magenta, so a focused primary button had a focus ring in its own color — a 1:1 ratio.
- `radius.md` is removed (nothing keeps 8px as a distinct step once `sm` moves there). `radius.sm` goes 4px → 8px (inputs); `radius.lg` goes 12px → 20px (cards). `radius.full` is unchanged; `Button` and `Tag` are pills now.
- `status.info` and its three derived roles (`infoSubtle`/`onInfo`/`infoBorder`) move from a cool, off-brand teal (195°) to MyWeb's own card-surface teal (179°), in both themes.
- The type scale gains five fluid members: `bodyLg`/`h4`/`h3`/`h2`/`h1` are `clamp()` expressions copied verbatim from MyWeb, not fixed steps. A component's type now responds to the viewport, not just the page — a deliberate call, not an oversight. `xs`–`4xl` and the rest of the fixed scale are unchanged.

**New tokens:**

- Colors: `text.heading`, `text.caption`, `brand.eyebrow`, `bg.inverse`, `text.onInverse`, `text.onInverseMuted`, `brand.labelOnInverse` — the inverse (teal card) surface MyWeb uses for its dark-on-brand sections. `text.heading` gets a dedicated dark override (`plumLight`, `#E7C9DC`, 11.9:1 vs `bg.page` / 10.0:1 vs `bg.surface`) — plain plum is only 1.41:1 on the dark page, which would have silently broken every heading in dark mode. `CardTitle` is the first consumer, moving from `text-ink` to `text-heading`.
- Typography: `eyebrow`/`caption`/`body` sizes, `font.weight.extrabold`, `lineHeight` (`tight`/`snug`/`normal`), `letterSpacing` (`eyebrow`/`tight`).
- Motion: `duration.fast` (140ms, used by `Button`/`Tag`'s hover transition), `duration.base` (240ms, reserved), `easing.out`. All transitions respect `prefers-reduced-motion` via `motion-reduce:transition-none`.
- `opacity.disabled` (0.5) replaces the hardcoded `disabled:opacity-50` on `Button` and `Tag` — the same fix `Input`/`Textarea`/`Tooltip` will need.

Tailwind v4 has no themeable `--duration-*` or `--opacity-*` namespace, so `duration-fast`/`duration-base`/`opacity-disabled` are defined via `@utility` rather than `@theme` — `easing.out` (`ease-out`) goes through the normal `@theme` namespace like every other token.

**`Badge` does not get a `size` prop.** It was built, measured, and removed in the same session: `sm` and `md` rendered at the same 26px height with the same `text-xs`, differing only by 4px of horizontal padding per side — a tweak, not a size. `Button` and `Tag` keep `size` (`sm`/`md`), where 26px vs 37px is a real, visible distinction.

No font files ship with the package — `font.family` stays a family declaration only; the consuming app loads Montserrat/Mulish itself.
