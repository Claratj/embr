# ADR 0001 — DTCG token format, compiled by Style Dictionary

- **Status:** Accepted
- **Date:** 2026-07-13
- **Phase:** 0

## Context

Embr's whole thesis is that design values live in exactly one place and everything else is
generated from them. That requires (a) a format to author tokens in and (b) a compiler to turn
them into the artefacts consumers need: CSS custom properties for the browser, and a typed
TypeScript export for authoring.

The alternatives were a hand-maintained CSS file of custom properties, a TypeScript object as the
source of truth, or a proprietary format tied to a design tool.

## Decision

Author tokens as **W3C DTCG JSON** (`$value` / `$type` / `$description`) and compile them with
**Style Dictionary v5**.

Three tiers, and the direction of dependency is one-way:

```
primitive  →  semantic  →  component
(raw palette) (roles)      (only when a component truly needs its own token)
```

Components may only reference the **semantic** tier. A component that reaches for
`color.magenta` instead of `brand.primary` has bypassed the system.

## Consequences

**Good**

- DTCG is a standard, not an invention. It interoperates with Tokens Studio, Figma variables and
  other tooling, so the tokens are portable if the pipeline is ever replaced.
- One source, many outputs. Adding a target (Android, iOS, a Figma sync) is a new Style Dictionary
  platform, not a second copy of the values.
- The generated TypeScript is genuinely typed (`as const satisfies Record<string, EmbrToken>`), so
  renaming a token is a compile error at every call site rather than a silent `undefined`.

**Costs / caveats**

- Style Dictionary **v5**, not the v4 named in the original plan: v5 is the current stable major,
  adopts the DTCG 2025.10 spec, and requires Node ≥22. The tokens parse unchanged.
- Generated output is not committed (see [ADR 0005](0005-generated-tokens-are-not-committed.md)),
  so a fresh clone must run `build:tokens` before anything else works. Every script does this via
  a `pre` hook, and CI runs it as an explicit step.
- Composite `shadow` tokens rely on Style Dictionary's `shadow/css/shorthand` transform. If we
  ever need a second shadow layer per token, that transform needs revisiting.
