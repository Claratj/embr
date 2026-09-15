import { useLayoutEffect, type ReactNode } from 'react';
import type { Decorator, Preview } from '@storybook/react-vite';

import './storybook.css';

/**
 * Light/dark is a *token mode*, not a component variant: flipping `data-theme` on <html>
 * swaps the values behind the `--embr-*` custom properties, and every utility re-resolves.
 * Nothing in a component knows which theme it is in. That's the whole design.
 *
 * `useLayoutEffect`, not `useEffect`: it runs before paint, so the attribute is in place before
 * axe measures colour contrast and before Chromatic takes its snapshot. With `useEffect` the
 * dark story could be audited while still rendered light.
 */
function ThemeMode({ theme, children }: { theme: 'light' | 'dark'; children: ReactNode }) {
  useLayoutEffect(() => {
    document.documentElement.dataset['theme'] = theme;
  }, [theme]);

  return <>{children}</>;
}

const withTheme: Decorator = (Story, context) => (
  <ThemeMode theme={context.globals['theme'] === 'dark' ? 'dark' : 'light'}>
    <Story />
  </ThemeMode>
);

const preview: Preview = {
  decorators: [withTheme],
  initialGlobals: { theme: 'light' },
  globalTypes: {
    theme: {
      description: 'Token mode',
      toolbar: {
        title: 'Theme',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: 'fullscreen',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    // Golden rule 2: a11y is a requirement, not a report. `test: 'error'` makes an axe
    // violation fail `npm test` and CI, rather than showing up as a note in a panel.
    a11y: { test: 'error' },
  },
  // @storybook/addon-a11y's own afterEach only fails on `result.violations` — but axe's
  // color-contrast rule reports a failure it can't be 100% certain about as `incomplete`
  // ("needs manual review"), not a violation, and addon-a11y never looks at that array. Verified
  // by planting plain white-on-white text: a11y: { test: 'error' } let it pass silently. This is
  // a second, project-owned afterEach — Storybook composes afterEach hooks from every preview
  // source, so this runs in addition to (not instead of) addon-a11y's own, using the exact same
  // axe-core run addon-a11y uses (including its 'region' exception — component stories rarely
  // have a landmark, and that's a false positive, not a real violation).
  //
  // Gated the same way addon-a11y gates its own throw (see its getIsVitestStandaloneRun): this
  // env var is the string 'false' when running under the vitest gate (`npm test`, CI) and unset
  // during interactive `npm run dev` — `import.meta.env.VITEST` is NOT set in this browser
  // context, despite the name, so it can't be used here. Verified directly by dumping
  // import.meta.env inside a planted story's play function.
  async afterEach(context) {
    if (context.viewMode !== 'story' || import.meta.env['VITEST_STORYBOOK'] !== 'false') return;
    const a11yParam = context.parameters['a11y'] as
      { disable?: boolean; test?: string } | undefined;
    if (a11yParam?.disable === true || a11yParam?.test === 'off') return;

    const axe = (await import('axe-core')).default;
    const result = await axe.run(document.body, {
      rules: { region: { enabled: false } },
    });
    if (result.incomplete.length > 0) {
      throw new Error(
        `axe: ${result.incomplete.length} rule(s) need manual review, reported as ` +
          `"incomplete" rather than "violations" — addon-a11y's own gate misses these: ` +
          result.incomplete.map((r) => r.id).join(', '),
      );
    }
  },
};

export default preview;
