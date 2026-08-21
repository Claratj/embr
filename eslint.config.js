import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'storybook-static/**',
      'coverage/**',
      'src/tokens/generated/**',
      // design-sync build artifacts and staged scripts (gitignored, except the durable set under
      // .design-sync/ — previews/, overrides/, config.json, NOTES.md, conventions.md — which IS
      // committed but isn't part of this package's own TS project; it targets the sync harness's
      // own module resolution, not this repo's tsconfig).
      'ds-bundle/**',
      '.ds-sync/**',
      '.design-sync/**',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // eslint-plugin-react-hooks v7 still ships its `configs.recommended*` presets in the legacy
    // eslintrc shape (`plugins: ['react-hooks']`), which ESLint 10 flat config rejects. Register
    // the plugin ourselves and take its rules — same result, no dependency on the export shape.
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs['recommended-latest'].rules,
  },
  storybook.configs['flat/recommended'],
  {
    // The build scripts are plain ESM JavaScript running in Node. Type-aware rules have no types
    // to work with there — every Style Dictionary token would be `any` — so they'd report noise
    // rather than bugs. Lint them for correctness, not for types.
    files: ['scripts/**/*.js', 'scripts/**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly' },
    },
  },
  {
    // verify-contrast.mjs additionally passes callbacks into page.evaluate(), which run inside
    // the Playwright-controlled browser page, not Node — hence the DOM globals on top of the
    // Node ones above.
    files: ['scripts/verify-contrast.mjs'],
    languageOptions: {
      globals: { document: 'readonly', getComputedStyle: 'readonly', URL: 'readonly' },
    },
  },
  prettier,
);
