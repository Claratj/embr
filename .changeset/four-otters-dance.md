---
'embr-ui': minor
---

Four components: `Button`, `Tag`, `Badge`, `Card` (plus `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`).

All four ship with `ref` as a regular prop (React 19 — no `forwardRef`), are RSC-safe (no `'use client'`), and stay tree-shakeable via per-component exports.

- **Button** — `solid` / `outline` / `ghost` variants. Supports `asChild` (via the new `@radix-ui/react-slot` dependency) to render its styling onto a single child, typically an `<a>`, while keeping that element's own semantics. Defaults `type="button"` on the native-button path so it doesn't submit an enclosing `<form>` by accident.
- **Tag** — a clickable filter chip, not a passive label (`Badge` covers that role). Always a real `<button>` (or `asChild` target), so it's keyboard-operable and carries `aria-pressed` for free. `selected` is controlled by the consumer; Tag holds no state.
- **Badge** — `solid` / `soft` / `outline` treatments over the five generic `status.*` roles added in the previous release. `solid` pairs the flat fill with `text-on-brand`; `soft` pairs `*Subtle` with `on*`; `outline` is transparent + `*Border` + `on*` text measured against the page. No variant stacks `Border` on top of `Subtle` — see `tokens/color.semantic.json` for why that pair fails contrast.
- **Card** — a static container: no `onClick`, no hover affordance, no focus ring. A compound component (`CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`); a card that needs to act like a control gets that from a `Button`/`asChild` placed inside it.

`@radix-ui/react-slot` and `@radix-ui/react-tooltip` are now in `dependencies` (the package's first runtime dependencies — `package.json` previously had no `dependencies` field). Both are needed at runtime by consumers, so neither belongs in `peerDependencies` or `devDependencies`. `react-tooltip` isn't consumed by any component yet — it lands with `Tooltip` in the next batch — but is added now so both Radix packages ship together. `sideEffects: false` and React externalization in the library build are unaffected.
