---
'embr-ui': minor
---

Foundations: the design token pipeline and its public entry points.

- **Tokens.** DTCG token files compile via Style Dictionary v5 into CSS custom properties
  (`--embr-*`) and a typed TypeScript export. Three tiers: primitive → semantic → component.
  Components consume semantic tokens only.
- **Theming.** Light and dark ship as token modes, switched with `data-theme="dark"` on the root
  element. Dark is a working stub in this release — it re-points the semantic layer at existing
  primitives and does not yet have a designed dark palette.
- **Tailwind.** `embr-ui/preset.css` maps the tokens onto Tailwind v4's theme namespaces with
  `@theme inline`. Each namespace is reset to `initial` first, so Tailwind's default palette and
  scales are unavailable and off-token utilities (`bg-red-500`, `p-13`) do not compile.
- **Entry points.** `embr-ui` (typed tokens + `cssVar`), `embr-ui/tokens.css`,
  `embr-ui/preset.css`, `embr-ui/styles.css`.

No components yet.
