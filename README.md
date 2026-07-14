# Embr

An accessible, token-driven React design system — published as a versioned package and documented
in Storybook.

**Live Storybook:** _pending first Chromatic deploy — see [Deploying Storybook](#deploying-storybook)._

Embr is deliberately **domain-agnostic**. Its components are generic and reusable, and it never
imports business logic. A separate application ([Compass](#who-consumes-it)) installs Embr as a
real external dependency, pinned to a version — which is the entire point of building it as a
package rather than as a folder of components.

---

## Why it exists

Most "design system" portfolio projects are a folder of styled components. This one is built to
behave like a system a team would actually depend on:

- **One source of truth for design values.** Every colour, space, radius, font and shadow comes
  from a token. Not "should come from" — _can only_ come from, enforced by the build (see
  [the Tailwind layer](#the-tailwind-layer)).
- **Accessibility as a gate, not a report.** Every story is executed in a real browser and audited
  with axe. A WCAG violation fails CI.
- **A public API that is a contract.** Typed, documented, and versioned with Changesets, so the
  consumer can pin a version and read a changelog.

## The token pipeline

Design values are authored once as [W3C DTCG](https://www.designtokens.org/) JSON and compiled into
every artefact the system needs. Nothing downstream is hand-written.

```
                    tokens/*.json           ← the only place a design value is written
              (DTCG: $value / $type)
                          │
                          ▼
                 Style Dictionary v5         npm run build:tokens
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   tokens.css      tokens.dark.css      tokens.ts
   :root           :root[data-theme     typed export
   (light)          ='dark']            (autocomplete +
        │                 │              compile-time safety)
        └────────┬────────┘                  │
                 ▼                           │
        --embr-* custom properties           │
                 │                           │
                 ▼                           │
        preset.css  (@theme inline)          │
        maps tokens → Tailwind namespaces    │
                 │                           │
                 ▼                           ▼
              components ────────────────────┘
        (consume semantic tokens only)
```

### Three tiers

| Tier          | Example                                     | Who may reference it       |
| ------------- | ------------------------------------------- | -------------------------- |
| **primitive** | `color.magenta` — `#AA1355`                 | the semantic tier only     |
| **semantic**  | `brand.primary`, `bg.page`, `status.danger` | components, consumers      |
| **component** | (none yet)                                  | the component that owns it |

A component reaching for `color.magenta` instead of `brand.primary` has bypassed the system, and
that is exactly what the architecture exists to prevent.

Status tokens are generic on purpose — `neutral / info / success / warning / danger`. Embr never
knows what they _mean_. Mapping them to business states (an application funnel, a deadline
threshold) is the consuming app's job.

### Theming

Light and dark are **token modes**, not component variants. `tokens.dark.css` re-points the semantic
layer under `:root[data-theme='dark']`; because the Tailwind utilities compile to `var(--embr-*)`
references rather than to resolved values, every utility re-resolves when that attribute flips. No
component knows which theme it is in, and no component is forked to support one.

> **Phase 0 status:** dark mode is a working _stub_. It re-points the semantic roles at primitives
> that already exist rather than inventing colours, so `bg.page` and `bg.surface` are currently the
> same charcoal. Phase 1 designs a real dark palette — a raised-surface neutral, a dark border
> neutral, and status colours re-tuned for dark backgrounds.

### The Tailwind layer

Tailwind v4 has no JS presets; theming is CSS-first. `preset.css` maps the generated custom
properties onto Tailwind's namespaces with `@theme inline`, and **resets each namespace to `initial`
first**. Tailwind's default palette and scales therefore do not exist:

```
bg-page   text-ink   bg-brand   bg-danger   p-4   rounded-md   shadow-md    ✅ compile
bg-red-500   p-13   rounded-3xl   text-9xl                                  ❌ do not exist
```

That is what makes "no hardcoded design values" a build guarantee rather than a code-review
convention. The reasoning — and the escape hatch — are in
[ADR 0003](docs/adr/0003-tailwind-v4-css-first-theme.md).

## Install

```bash
npm install embr-ui
```

Embr needs the React 19 runtime (it takes `ref` as a regular prop — see
[ADR 0002](docs/adr/0002-react-19-ref-as-prop.md)):

```json
"peerDependencies": { "react": "^19", "react-dom": "^19" }
```

Then import the styles:

```css
@import 'tailwindcss';
@import 'embr-ui/preset.css'; /* tokens + the Tailwind theme layer — the usual choice */
```

| Entry                | Contains                                                        |
| -------------------- | --------------------------------------------------------------- |
| `embr-ui/tokens.css` | the `--embr-*` custom properties only. No Tailwind required.    |
| `embr-ui/preset.css` | `tokens.css` + the Tailwind `@theme` layer.                     |
| `embr-ui/styles.css` | `preset.css` + Embr's base styles (body, headings, focus ring). |

Tokens are also importable as typed values, for the cases where a utility class will not do:

```ts
import { tokens, cssVar } from 'embr-ui';

tokens['brand-primary'].value; // '#aa1355'
cssVar('brand-primary'); // 'var(--embr-brand-primary)' — a typo here is a compile error
```

Enable dark mode by setting the attribute:

```html
<html data-theme="dark"></html>
```

## Development

```bash
npm install
npm run dev            # Storybook at :6006
```

| Command                   | What it does                                                       |
| ------------------------- | ------------------------------------------------------------------ |
| `npm run build:tokens`    | Regenerates CSS vars + typed TS from `tokens/`.                    |
| `npm run build`           | Builds the library (ESM, per-module, `.d.ts`) and the CSS entries. |
| `npm run build-storybook` | Static Storybook.                                                  |
| `npm test`                | Vitest — unit tests, plus every story run in Chromium with axe.    |
| `npm run lint`            | ESLint.                                                            |
| `npm run typecheck`       | `tsc --noEmit`.                                                    |
| `npm run changeset`       | Record a user-facing change (semver + changelog).                  |

Generated token output is **not committed**
([ADR 0005](docs/adr/0005-generated-tokens-are-not-committed.md)); every script regenerates it via a
`pre` hook, so it cannot go stale.

## Testing

A component is not "done" until its stories, states, accessibility and tests are all green.

- **Vitest + React Testing Library** for logic.
- **Storybook stories run as tests**, in real Chromium via Playwright — not jsdom, because focus
  behaviour and colour contrast are not faithfully simulated there.
- **axe on every story**, with `a11y: { test: 'error' }`, so a violation is a failing build.
- **Chromatic** for visual regression on the key components (from Phase 3).

The a11y gate is verified, not assumed: planting a contrast failure, a button with no accessible
name, or an image with no alt text each turn the suite red.

## Deploying Storybook

Storybook publishes to [Chromatic](https://www.chromatic.com/) on every push to `main`.

To enable it: create a Chromatic project for this repo, then add its token as a repository secret
named `CHROMATIC_PROJECT_TOKEN` (**Settings → Secrets and variables → Actions → New repository
secret**). The workflow is already wired in
[`.github/workflows/chromatic.yml`](.github/workflows/chromatic.yml). Once the first build lands,
put the URL at the top of this README.

## Decisions

The reasoning behind the non-obvious choices — this is where the judgement lives:

- [ADR 0001 — DTCG tokens, compiled by Style Dictionary](docs/adr/0001-dtcg-tokens-with-style-dictionary.md)
- [ADR 0002 — Target React 19, `ref` as a regular prop](docs/adr/0002-react-19-ref-as-prop.md)
- [ADR 0003 — Tailwind as a CSS `@theme`, with closed namespaces](docs/adr/0003-tailwind-v4-css-first-theme.md)
- [ADR 0004 — Pin TypeScript 6, not 7](docs/adr/0004-typescript-6-not-7.md)
- [ADR 0005 — Generated token output is not committed](docs/adr/0005-generated-tokens-are-not-committed.md)

## Who consumes it

**Compass**, a separate application, installs Embr from the registry at a pinned version. Keeping
the two repos apart is what forces the API to be real: Embr cannot reach into Compass's domain, and
Compass cannot patch around a bad Embr API — it has to be fixed, versioned and released.

## Stack

TypeScript 6 (strict) · React 19 · Vite 8 (library mode) · Style Dictionary 5 (DTCG) ·
Tailwind CSS 4 · Radix UI (from Phase 2) · Storybook 10 (a11y + Vitest addon) · Vitest 4 ·
Chromatic · Changesets · GitHub Actions.

## License

MIT
