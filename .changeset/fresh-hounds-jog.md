---
'embr-ui': patch
---

Fix the Storybook a11y gate silently missing real contrast failures. `@storybook/addon-a11y`'s own `afterEach` only fails on `result.violations` — but axe-core's `color-contrast` rule reports a failure it can't be 100% certain about as `incomplete` ("needs manual review") instead, and addon-a11y never looks at that array. Confirmed by planting plain white-on-white text: `a11y: { test: 'error' }` passed it silently.

Adds a second, project-owned `afterEach` in `.storybook/preview.tsx` that runs the same axe-core check addon-a11y uses (including its `region` exception) and fails on any non-empty `incomplete` array too. Storybook composes `afterEach` hooks from every preview source, so this runs alongside addon-a11y's own, not instead of it. Gated on `import.meta.env['VITEST_STORYBOOK'] === 'false'` — the same signal addon-a11y's own vitest-only check uses internally — so it only throws under the vitest gate (`npm test`, CI), never during interactive `npm run dev`.

Verified against the same white-on-white case, which now fails as expected; the full existing suite (64/64 stories and unit tests) still passes, so no story was relying on the gap.
