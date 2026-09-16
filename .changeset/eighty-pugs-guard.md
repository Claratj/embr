---
'embr-ui': patch
---

New `npm run verify:motion` — a motion contract, measured against the real rendered components in `storybook-static/`, wired into CI after the Storybook build. Sibling to `verify:contrast`, and there for the same reason: assert what actually ships, not what the source says.

It exists because of a bug that shipped three times while the whole suite stayed green. `Button`, `Tag` and `FormFieldError` each declared `transition-[…,transform]` next to a `scale`/`translate` utility, which in Tailwind v4 compile to the standalone `scale:`/`translate:` properties — so their press and entrance animations never transitioned at all. Every story rendered, every test passed, axe was green, and the animation was dead. Nothing in the repo could see it.

Sixteen checks across four groups: the movement property is named in its own transition list; reduced motion drops movement while keeping the colour/opacity fade; every `:hover` rule sits behind a `pointer:` media query; and each component uses the easing curve its role calls for.

Every check was mutation-tested — each bug was reintroduced and the corresponding check confirmed to go red. That pass caught two checks that could only ever pass: a touch-device hover test that went green with or without the gate (Tailwind already wraps `hover:` in `@media (hover: hover)`, and Playwright's touch emulation sets `hover: none` and `pointer: coarse` together), now replaced by reading the rule's own media condition out of the stylesheet.

Also extracts `scripts/serve-static.mjs`, now shared by `verify-contrast.mjs` and `verify-motion.mjs`.
