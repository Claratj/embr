import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

/**
 * Storybook's Vite config, kept separate from the library's `vite.config.ts` on purpose:
 * that one is in library mode (`build.lib`, externalised React, per-module output), which is
 * not what we want when bundling a Storybook app. Storybook's React plugin is supplied by
 * `@storybook/react-vite`, so all we add here is Tailwind.
 */
export default defineConfig({
  plugins: [tailwindcss()],
});
