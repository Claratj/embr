# design-sync notes — Embr

## Fixes applied

- **[GENERAL] dts root mis-detected as `types/`** — `package.json` had no top-level `types`/`typings`
  field (only under `exports["."]["types"]`), and the repo's own `types/vite-env.d.ts` (ambient
  Vite types, unrelated to the public API) matched the converter's `types/` fallback candidate
  before it ever tried `dist/`. Fix: added `"types": "./dist/index.d.ts"` to `package.json`
  (standard, additive, harmless — also correct practice for tools that don't read `exports`).
- **[GENERAL] foundation stories aren't components** — `Colors`, `Focus`, `Radii`, `Shadows`,
  `Spacing`, `Typography` (under `src/stories/foundations/`) document tokens, not exported
  components. Excluded via `cfg.titleMap: {<title>: null}`.
- **[GENERAL] CSS ships as a relative-import chain with no compiled utilities** —
  `dist/styles.css` → `./preset.css` → `./tokens.css` (see `scripts/build-css.js`), and none of
  the three contain compiled Tailwind utility classes: Embr ships the *preset*, not generated
  utilities (docs/adr/0003) — the consuming app's own Tailwind build is expected to generate
  them. Upstream's placeholder-CSS fallback only fires for tiny stub files, so it never caught
  this (`dist/styles.css` has real base-layer content, just a broken import chain once copied
  standalone). Forked `.design-sync/overrides/css-fallback.mjs` (declared in
  `cfg.libOverrides["css-fallback.mjs"]`) to also fall back to the storybook-compiled CSS when
  the copied file has an unresolved relative `@import` — not just when it's a tiny stub.
- **Fonts declared but never loaded, anywhere** — `tokens/core.json` names Montserrat (heading)
  and Mulish (body), but no `@font-face`/webfont link existed in the repo — not even in
  Storybook's own preview. Every consumer, including Embr's own Storybook, was silently falling
  back to system fonts. Added `.storybook/preview-head.html` with a Google Fonts `<link>`
  (weights 400–800, matching the full `font.weight` token scale) per the user's choice. This is
  a real pre-existing gap in Embr, not a sync-only fix — worth flagging if it surfaces again in
  review.
- **[GENERAL] per-story `globals` overrides don't reach compiled previews** — the repo's
  `withTheme` decorator (`.storybook/preview.tsx`) reads `context.globals.theme`, and Button's
  `Dark` story sets it via a per-story `globals: { theme: 'dark' }` override (not a decorator).
  The compiled-preview `compose()` function hardcodes `ctx.globals: {}` and never reads a
  story's own `globals` field (only `args`/`argTypes`/`decorators`/`parameters`) — and
  `bundlePreviewDecorators`' entry builds one static ctx for every preview, so even a working
  decorator bundle can't vary per-story. **`cfg.provider` cannot express this either** — it
  wraps every preview uniformly, with no per-story conditional. Fix, once, in
  `.design-sync/previews/Button.tsx`: a local `DarkMode` wrapper mirroring the decorator's own
  effect (`document.documentElement.dataset.theme = 'dark'`) for the `Dark` export only. Any
  future themed/global-driven story on another component needs the same per-component owned-
  preview treatment — there's no config knob for it.
- The decorator bundle itself still fails (`Could not resolve "tailwindcss"` — `preview.tsx`
  imports `./storybook.css` which has `@import 'tailwindcss'`, unresolvable by esbuild's plain
  CSS loader). Not chased further: no component currently needs a real context/provider (no
  Radix Tooltip usage yet despite the dependency being present), and the one decorator in the
  repo (`withTheme`) needed the owned-preview fix above regardless (per-story globals aren't
  bundle-driven anyway).

- **Tag's `Toggle` story is interaction-driven** — its `play()` function clicks the tag, so the
  reference storybook screenshot captures the POST-click (selected/red) state, but compiled
  previews never run `play()` and render the initial (unselected) state. Skipped via
  `cfg.overrides.Tag.skip: ["components-tag--toggle"]`.

## Re-sync risks

- If a future component uses a themed or `globals`-driven story (dark mode, locale, etc.), it
  will need the same manual owned-preview treatment as Button's `Dark` story — there is no
  config-level fix for per-story `globals`.
- If `@radix-ui/react-tooltip` (already a dependency) gets used by an exported component, revisit
  `cfg.provider` — Radix's Tooltip needs a `Provider` ancestor, and the decorator-bundle failure
  above means it won't come from `.storybook/preview.tsx` automatically.
- The `css-fallback.mjs` fork assumes the storybook-compiled CSS is always more complete than
  `dist/`'s shipped CSS. True today (utilities aren't pre-generated), but if Embr ever starts
  shipping compiled utility CSS in `dist/`, revisit whether the fork's broadened fallback trigger
  is still the right call — it would then be replacing a *complete* file unnecessarily.
- Google Fonts CDN link is an external network dependency for anyone rendering Embr's Storybook
  or the synced previews. If Embr later self-hosts the fonts, swap `.storybook/preview-head.html`
  for real `@font-face` rules and drop this note.
