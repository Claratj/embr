import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs', // autodocs
    '@storybook/addon-a11y', // axe
    '@storybook/addon-vitest', // test runner; interactions are core since Storybook 9
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: { viteConfigPath: '.storybook/vite.config.ts' },
    },
  },
  typescript: {
    // Generate prop tables from the TypeScript types rather than hand-written argTypes.
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;
