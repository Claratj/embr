// @vitest-environment node
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

import { compile } from 'tailwindcss';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Golden rule 1, enforced on the real compiler: with Embr's theme layer in front of Tailwind,
 * utilities that would emit Tailwind's own default values must not exist at all. A namespace
 * someone forgets to reset (or a Tailwind upgrade that adds one) turns this red.
 *
 * Compiles src/css/theme.css exactly as a consumer's build would — `@import "tailwindcss"` then
 * the theme — and asks the compiler for each candidate class. No tokens are loaded: whether a
 * utility *exists* doesn't depend on what its `var(--embr-*)` resolves to.
 */
const require = createRequire(import.meta.url);
const TAILWIND_DIR = dirname(require.resolve('tailwindcss/package.json'));
const THEME = resolve(import.meta.dirname, 'theme.css');

let build: (candidates: string[]) => string;

beforeAll(async () => {
  const theme = await readFile(THEME, 'utf8');
  const compiler = await compile(`@import 'tailwindcss';\n${theme}`, {
    base: import.meta.dirname,
    loadStylesheet: async (id) => {
      const path =
        id === 'tailwindcss'
          ? resolve(TAILWIND_DIR, 'index.css')
          : resolve(TAILWIND_DIR, id.replace(/^tailwindcss\//, ''));
      return { path, base: dirname(path), content: await readFile(path, 'utf8') };
    },
  });
  build = (candidates) => compiler.build(candidates);
});

/** True when the compiler emitted a rule for this class. */
function compiles(candidate: string): boolean {
  const selector = `.${candidate.replace(/[:/[\]().]/g, (c) => `\\${c}`)}`;
  return build([candidate]).includes(selector);
}

describe('theme.css namespace resets', () => {
  it.each([
    ['colour', 'bg-red-500'],
    ['spacing', 'p-13'],
    ['radius', 'rounded-md'],
    ['shadow', 'shadow-xl'],
    ['font size', 'text-base'],
    ['container', 'max-w-sm'],
    ['container', 'max-w-7xl'],
    ['blur', 'blur-sm'],
    ['drop shadow', 'drop-shadow-md'],
    ['inset shadow', 'inset-shadow-sm'],
    ['text shadow', 'text-shadow-sm'],
    ['aspect ratio', 'aspect-video'],
    ['perspective', 'perspective-near'],
    ['easing', 'ease-in-out'],
    ['animation', 'animate-spin'],
  ])('does not ship Tailwind’s default %s utility `%s`', (_, candidate) => {
    expect(compiles(candidate)).toBe(false);
  });

  // The positive control: without it, a broken compile (every candidate failing) would pass the
  // test above vacuously.
  it.each(['bg-brand', 'p-4', 'rounded-xs', 'shadow-md', 'max-w-field', 'max-w-tooltip'])(
    'still compiles the token-backed utility `%s`',
    (candidate) => {
      expect(compiles(candidate)).toBe(true);
    },
  );
});
