import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

/**
 * Two projects, matching the testing pyramid in CLAUDE.md:
 *
 *   unit       Vitest + React Testing Library, for component logic (Phase 2 onwards).
 *   storybook  every story is executed as a test — it must render without throwing, its `play`
 *              function must pass, and axe must report zero violations (`a11y: { test: 'error' }`
 *              in .storybook/preview.tsx). Runs in real Chromium via Playwright, because
 *              accessibility and focus behaviour are not faithfully simulated by jsdom.
 *
 * Deliberately NOT here: a `setupFiles` entry calling `setProjectAnnotations`. Supplying one
 * makes Storybook skip the setup file it generates itself — and that generated file is the only
 * thing that registers the *addon* annotations, including the afterEach hook that actually runs
 * axe. With a hand-rolled setup file the suite reports green on stories with real WCAG
 * violations. Verified by planting a contrast failure: it must turn this suite red.
 */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'jsdom',
          include: ['src/**/*.test.{ts,tsx}'],
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: '.storybook' })],
        // Storybook's preview runtime pulls two CJS-only packages that Vite serves unbundled in
        // browser mode, where their named/default exports don't exist as ESM. Pre-bundling them
        // fixes the interop. Without this, Storybook's generated setup file fails to import and
        // *every* story errors out.
        optimizeDeps: { include: ['storybook/test'] },
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
