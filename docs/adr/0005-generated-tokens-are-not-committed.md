# ADR 0005 — Generated token output is not committed

- **Status:** Accepted
- **Date:** 2026-07-13
- **Phase:** 0

## Context

`npm run build:tokens` produces three files in `src/tokens/generated/`: `tokens.css`,
`tokens.dark.css` and `tokens.ts`. They are derived entirely from `tokens/*.json`.

Committing generated artefacts is a genuine trade-off, not an obvious wrong. Committing them makes
a fresh clone work immediately and makes token changes visible as a diff in review. Not committing
them guarantees they can never be stale.

## Decision

Do not commit them. `src/tokens/generated/` is gitignored, and every script that depends on the
output regenerates it first:

```json
"predev": "npm run build:tokens",
"prebuild": "npm run build:tokens",
"pretest": "npm run build:tokens",
"prebuild-storybook": "npm run build:tokens"
```

CI additionally runs `build:tokens` as its own explicit step, so a pipeline failure is reported as
a token failure rather than as a confusing downstream compile error.

## Consequences

**Good**

- The generated files cannot drift from `tokens/`. There is no "forgot to re-run the build" commit,
  and no possibility of a reviewer approving a token change whose output says something else.
- The source of truth is unambiguous: if it isn't in `tokens/`, it isn't a token.

**Costs / caveats**

- **The review diff shows intent, not effect.** A reviewer sees `{color.magenta}` change in the
  DTCG file, not the sixteen CSS variables that move as a result. Accepted for now: the token files
  are small and the mapping is mechanical. If this bites, the answer is a CI step that prints the
  generated diff on a PR — not committing the artefacts.
- A fresh clone must run an install + `build:tokens` before typecheck or an editor will report
  missing modules. The `pre` hooks cover every scripted path, but a bare `tsc` in a fresh clone
  will complain.
