# ADR 0003 — Ship the Tailwind layer as a CSS `@theme`, and close the namespaces

- **Status:** Accepted
- **Date:** 2026-07-13
- **Phase:** 0

## Context

The plan called for a "Tailwind preset" — a JavaScript config object consumers would spread into
their `tailwind.config.js`. **Tailwind v4 removed JS config presets.** Theming is CSS-first: you
declare theme variables in an `@theme` block, and Tailwind derives the utility classes from them.

So the artefact had to change. The question was what to put in it.

## Decision

Ship `embr-ui/preset.css`: the generated token custom properties plus an `@theme inline` block
that maps them onto Tailwind's namespaces.

Two decisions inside that:

**1. `@theme inline`, not plain `@theme`.** With `inline`, a utility compiles to the _reference_ —
`.bg-page { background-color: var(--embr-bg-page); }` — rather than to a value resolved once at
build time. That is precisely what makes dark mode work: setting `data-theme="dark"` changes what
`--embr-bg-page` resolves to, and every utility follows, with no recompile and no component
re-render.

**2. Every namespace is reset to `initial` before our keys are added.**

```css
@theme inline {
  --color-*: initial;
  --color-page: var(--embr-bg-page);
  /* … */
  --spacing: initial; /* also kills the base multiplier, so `p-13` cannot be synthesised */
  --spacing-*: initial;
  --spacing-4: var(--embr-space-4);
}
```

Tailwind's default palette and scales stop existing. `bg-red-500`, `p-13`, `rounded-3xl` and
`text-9xl` do not compile — verified, not assumed. **This is the mechanism that enforces golden
rule 1**: there is no hardcoded-value escape hatch to forget to police in review, because the
utility simply isn't there.

Colours are keyed by **role** (`--color-page`, `--color-ink`, `--color-brand`) rather than by the
token's property path (`--color-bg-page`), because Tailwind serves `bg-`, `text-`, `border-` and
`ring-` from one shared colour namespace — the latter would spell `bg-bg-page` at the call site.
The mapping is documented in `src/css/theme.css`.

## Consequences

**Good**

- A consumer physically cannot introduce an off-token colour or spacing step through a utility.
  Consistency is enforced by the compiler, not by discipline.
- Dark mode is a token mode, not a component variant. No component knows which theme it is in.
- CSS-first distribution is just a file. No config merging, no plugin ordering.

**Costs / caveats**

- **This is the most opinionated call in Phase 0.** A closed system will eventually block a
  legitimate one-off ("I need 20px here"). The correct response is to add a token, not to reopen
  the namespace — but if it proves too rigid in Compass, deleting one `*: initial` line relaxes it
  per namespace. That escape hatch is one line, and it is deliberate.
- Arbitrary values (`p-[13px]`) still work; Tailwind does not gate those on the theme. The closed
  namespaces make off-token values _inconvenient and conspicuous in review_, not impossible.
- CLAUDE.md's wording ("Tailwind preset consuming those CSS variables") predates Tailwind v4 and
  has been updated to match reality.
