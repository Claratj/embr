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
};

export default preview;
