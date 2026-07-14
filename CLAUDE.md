# CLAUDE.md — Embr

Working agreement for this repo. Read it before every task and follow it. It encodes my
engineering decisions; treat it as the source of truth, above defaults.

Embr is a **design system published as a versioned package** and documented in Storybook. Other
apps consume it as an external dependency. Embr is domain-agnostic: its components are
generic and reusable, and it never imports business logic.

Full plan: `EMBR-PLAN.md`. Current phase: `EMBR-PHASE-0.md`.

## Golden rules (non-negotiable)

1. **No hardcoded design values.** Every color, space, radius, font and shadow comes from a
   semantic token. If a value isn't a token yet, add the token — don't inline it.
2. **Accessibility is a requirement, not a pass.** Ship WAI-ARIA-correct behavior and a visible
   focus ring on everything interactive. The Storybook a11y addon must report zero violations.
3. **Public API is a contract.** Typed, documented, stable. Breaking changes go through a
   changeset with a clear migration note.
4. **One phase per session.** Propose a short plan, wait for my approval (plan mode), implement,
   leave the tree green. Don't scope-creep into the next phase.
5. **Standard over clever.** Stick to the stack below. Don't add libraries or tooling without
   asking.

## Stack

TypeScript (strict) · React 19 · Vite 8 (library build) · **Style Dictionary v5** (DTCG tokens →
CSS variables + typed TS) · **Tailwind v4 `@theme` layer** consuming those CSS variables — v4
removed JS config presets, so the artefact we ship is `preset.css`, not a preset object
(`docs/adr/0003`) · **Radix UI** (headless primitives) · **Storybook (current major)** — a11y addon
+ the built-in test/interactions runner (`storybook/test` + `addon-vitest`; the standalone
interactions addon was merged into core in Storybook 9) · Vitest + React Testing Library ·
Chromatic (visual regression) · Changesets (semver + changelog) · GitHub Actions.

Use current stable majors (greenfield project): don't pin to older Storybook/Vite. If a tool's docs
name a specific version, follow the current stable one.

**One deliberate exception:** TypeScript is pinned to **6.x**, not the GA 7.x. TS 7 ships without a
stable programmatic API, so `typescript-eslint` cannot run on it until 7.1 — taking 7 would mean
either two compilers in the tree or no type-aware linting (`docs/adr/0004`). Revisit when 7.1 lands.

Published with `peerDependencies: react ^19` (the ref-as-prop API needs the React 19 runtime).

Language: English everywhere (code, comments, docs, Storybook, commits).

## Tokens

- Single source of truth: DTCG JSON in `tokens/` (`$value` / `$type`). Brand seed already exists —
  **do not change brand values** without asking.
- Three tiers: `primitive` (raw palette) → `semantic` (role: bg / text / border / brand / focus /
  status) → `component` (only when a component genuinely needs its own token).
- `npm run build:tokens` runs Style Dictionary → outputs (a) CSS custom properties on `:root` and
  (b) a typed TS export. Components consume **semantic** tokens only, via the Tailwind preset.
- Status tokens are **generic**: `neutral / info / success / warning / danger`. Embr is
  domain-agnostic — any mapping to business states (e.g. an application funnel: sent → interview →
  offer) lives in the consumer app (Compass), never in Embr.
- Theming (light/dark) is done with token modes, never by forking components.

## Components & API conventions

- Accept `ref` as a regular prop (React 19) — no `forwardRef`. Props typed and exported from the
  component file. Rationale for the React 19 target is recorded in `docs/adr/` (greenfield, single
  controlled consumer → modern ref-as-prop API instead of `forwardRef` boilerplate).
- Use **Radix** for overlays, dialog, select, tooltip, popover (focus management, keyboard, ARIA).
  Style it with our tokens; never re-implement a11y behavior Radix already solves.
- Prefer **compound components** (`Root/Trigger/Content/Item`) and support **`asChild`** /
  polymorphism where it makes sense. Design the API, don't just wrap.
- Inputs support both controlled and uncontrolled usage.
- Tree-shakeable: per-component exports, `"sideEffects": false`. Mark `'use client'` only where
  required (keep components RSC-safe by default).
- Each component ships: variants + states (default / hover / focus / disabled / error where
  relevant), visible focus ring (`focus.ring` token), one story per variant, autodocs.
- Components with logic (e.g. a threshold/day indicator) get unit tests + a Storybook interaction
  test.

## Testing pyramid

- Vitest + RTL for logic and rendering.
- Storybook interaction tests for behavior.
- axe (a11y addon) green on all stories.
- Chromatic visual regression on the key components.
  A component isn't "done" until its stories, states, a11y and tests are all green.

## Versioning & release

- **Changesets** for every user-facing change (semver + changelog). Compass will pin a version, so
  the changelog is the contract.
- Publish the package so Compass consumes it as a real external dependency (this is the whole point
  of Embr).

## Commits, docs & decisions

- Conventional commits, small and intention-revealing (`feat:`, `fix:`, `chore:`, `docs:`,
  `test:`). History is part of the evidence.
- Every non-trivial decision (why DTCG, why Radix, why Changesets, dark-mode strategy) gets a short
  ADR in `docs/adr/`.
- The README is a mini case study: what Embr is, the token architecture (with a diagram), a "How
  it was built" section, and the live Storybook URL.

## Commands

- `npm run dev` — Storybook locally.
- `npm run build:tokens` — regenerate CSS vars + TS from `tokens/`.
- `npm run build` — build the library. `npm run build-storybook` — static Storybook.
- `npm test` — Vitest. `npm run lint` / `npm run typecheck`.

## How we work together

- **Plan mode first.** Before touching code, summarize in 3–4 lines what you'll change and wait for
  my go-ahead.
- **Verified work only.** You draft, the test suite checks, I review at checkpoints. Nothing merges
  unless it's green and reviewed.
- **Close each phase with a critical self-review:** call out what's weak or what you'd flag in a
  code review before we call the phase done.
- If a decision isn't covered here or in the plan, ask. Don't invent dependencies, tooling, or
  scope.
