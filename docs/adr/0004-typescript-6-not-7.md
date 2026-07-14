# ADR 0004 — Pin TypeScript 6, not 7

- **Status:** Accepted (revisit when TypeScript 7.1 ships)
- **Date:** 2026-07-13
- **Phase:** 0

## Context

TypeScript **7.0 is GA** — the Go-native compiler, and dramatically faster. The instinct on a
greenfield repo is to take the newest major.

But 7.0 ships **without a stable programmatic API**; that lands in 7.1. Every tool that inspects
the type system through the compiler API — `typescript-eslint` foremost, but also `ts-morph` and
custom transformers — cannot run on it. `typescript-eslint@8.63.0` declares its peer range as
`typescript >=4.8.4 <6.1.0`.

Microsoft's own migration path is a compatibility package (`@typescript/typescript6`) that
re-exports the 6.0 API, so `tsc` can be 7 while the linter keeps talking to 6.

## Decision

Use **TypeScript 6.0.3** for everything.

Rejected: TypeScript 7 plus the `@typescript/typescript6` compat alias. It works, but it puts two
compilers in the dependency tree and an alias in the lint config to buy compile speed we do not
need — a repo this size typechecks in under a second. That trade fails CLAUDE.md's rule 5,
"standard over clever".

Rejected: TypeScript 7 with type-aware linting dropped. Losing every type-aware rule in a project
whose selling point is a strictly-typed public API is not a trade, it's a regression.

## Consequences

- Lint, typecheck and Storybook all work with no workarounds and no alias.
- TypeScript 6.0.3 is still a current stable major, so "use current stable majors" holds — this is
  a decision to skip a _broken-for-us_ major, not to sit on an old one.
- **Revisit when 7.1 ships the stable API** and `typescript-eslint` widens its peer range. The
  upgrade should then be a one-line version bump.
