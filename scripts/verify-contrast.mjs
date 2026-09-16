#!/usr/bin/env node
/**
 * Verifies WCAG contrast ratios and control heights against the REAL compiled output — never
 * the source token JSON — because the whole point is catching drift between what tokens/
 * documents and what actually ships. Two modes:
 *
 *   node scripts/verify-contrast.mjs contrast   — reads --embr-* custom properties straight out
 *     of dist/tokens.css (via a real browser, so the :root[data-theme='dark'] cascade resolves
 *     exactly as a consumer's browser would) and computes ratios for a fixed set of role pairs.
 *   node scripts/verify-contrast.mjs height     — mounts real stories from the built Storybook
 *     (storybook-static/) in a real browser and measures rendered heights, for comparing new
 *     controls against Button.
 *
 * Requires `npm run build` (contrast mode) and/or `npm run build-storybook` (height mode) to
 * have been run first — this script never builds anything itself, so a stale run is always the
 * caller's mistake, not a silent difference from what's on disk.
 */
import { chromium } from 'playwright';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { serveStatic } from './serve-static.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TOKENS_CSS = resolve(ROOT, 'dist/tokens.css');
const STORYBOOK_STATIC = resolve(ROOT, 'storybook-static');
const STORYBOOK_IFRAME = join(STORYBOOK_STATIC, 'iframe.html');

// ---- WCAG contrast -------------------------------------------------------------------------

function srgbToLinear(c) {
  const n = c / 255;
  return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance({ r, g, b }) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(a, b) {
  const [L1, L2] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (L1 + 0.05) / (L2 + 0.05);
}

// A translucent foreground (rgba alpha < 1) doesn't have a contrast ratio on its own — it has
// to be composited over its actual background first, exactly as the browser paints it.
function compositeOver(fg, bg) {
  const a = fg.a ?? 1;
  if (a === 1) return fg;
  return {
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a),
  };
}

function parseColor(value) {
  const hex = /^#([0-9a-f]{6})$/i.exec(value.trim());
  if (hex) {
    const n = parseInt(hex[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 };
  }
  const rgba = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/i.exec(
    value.trim(),
  );
  if (rgba) {
    return {
      r: Number(rgba[1]),
      g: Number(rgba[2]),
      b: Number(rgba[3]),
      a: rgba[4] === undefined ? 1 : Number(rgba[4]),
    };
  }
  throw new Error(`cannot parse colour: "${value}"`);
}

// ---- contrast mode --------------------------------------------------------------------------

// role -> --embr-* custom property name. Extend this as future phases need new checks.
const VARS = {
  'bg.page': '--embr-bg-page',
  'bg.surface': '--embr-bg-surface',
  'bg.inverse': '--embr-bg-inverse',
  'border.default': '--embr-border-default',
  'text.caption': '--embr-text-caption',
  'text.heading': '--embr-text-heading',
  'text.on-inverse': '--embr-text-on-inverse',
  'text.on-brand': '--embr-text-on-brand',
  'brand.primary': '--embr-brand-primary',
  'brand.primary-strong': '--embr-brand-primary-strong',
  'brand.eyebrow': '--embr-brand-eyebrow',
  'brand.link': '--embr-brand-link',
  'focus.ring': '--embr-focus-ring',
  'status.danger': '--embr-status-danger',
  'status.on-danger': '--embr-status-on-danger',
  'status.info': '--embr-status-info',
  'status.success': '--embr-status-success',
  'status.warning': '--embr-status-warning',
};

// [fgRole, bgRole, floor, label, gate] — floor is the WCAG minimum that role pair must clear.
// 3:1 = non-text UI component boundary (WCAG 1.4.11); 4.5:1 = normal text (WCAG 1.4.3).
// gate=false means the row is reported but never fails the exit code — for roles that are
// deliberately not used in that pairing (e.g. status.danger is a border/fill token, not text; it
// stays here so a future consumer of it as text sees the real, expected-to-fail number).
const CONTRAST_CHECKS = [
  ['border.default', 'bg.page', 3.0, 'STOP 1 — border.default vs bg.page (control boundary)', true],
  [
    'border.default',
    'bg.surface',
    3.0,
    'STOP 1 — border.default vs bg.surface (control boundary)',
    true,
  ],
  ['text.caption', 'bg.page', 4.5, 'STOP 2 — text.caption vs bg.page (placeholder text)', true],
  [
    'text.caption',
    'bg.surface',
    4.5,
    'STOP 2 — text.caption vs bg.surface (placeholder text)',
    true,
  ],
  [
    'status.danger',
    'bg.page',
    4.5,
    '(informational) status.danger as text vs bg.page — unsafe, not consumed as text',
    false,
  ],
  [
    'status.danger',
    'bg.surface',
    4.5,
    '(informational) status.danger as text vs bg.surface — unsafe, not consumed as text',
    false,
  ],
  [
    'status.on-danger',
    'bg.page',
    4.5,
    'STOP 5 — status.on-danger as text vs bg.page (FormFieldError)',
    true,
  ],
  [
    'status.on-danger',
    'bg.surface',
    4.5,
    'STOP 5 — status.on-danger as text vs bg.surface (FormFieldError)',
    true,
  ],
  // Palette D re-verification — every pair this palette rebase actually touches or repoints.
  ['text.heading', 'bg.page', 4.5, 'PALETTE D — text.heading vs bg.page', true],
  ['text.on-inverse', 'bg.inverse', 4.5, 'PALETTE D — text.onInverse vs bg.inverse', true],
  [
    'text.on-brand',
    'brand.primary',
    4.5,
    'PALETTE D — text.onBrand vs brand.primary (solid CTA fill)',
    true,
  ],
  [
    'text.on-brand',
    'brand.primary-strong',
    4.5,
    'PALETTE D — text.onBrand vs brand.primaryStrong (CTA hover fill)',
    true,
  ],
  [
    'text.on-brand',
    'status.info',
    4.5,
    'PALETTE D — text.onBrand vs status.info (solid fill)',
    true,
  ],
  [
    'text.on-brand',
    'status.success',
    4.5,
    'PALETTE D — text.onBrand vs status.success (solid fill)',
    true,
  ],
  [
    'text.on-brand',
    'status.warning',
    4.5,
    'PALETTE D — text.onBrand vs status.warning (solid fill)',
    true,
  ],
  [
    'text.on-brand',
    'status.danger',
    4.5,
    'PALETTE D — text.onBrand vs status.danger (solid fill)',
    true,
  ],
  ['brand.eyebrow', 'bg.page', 4.5, 'PALETTE D — brand.eyebrow vs bg.page', true],
  ['brand.link', 'bg.page', 4.5, 'PALETTE D — brand.link vs bg.page', true],
  [
    'focus.ring',
    'bg.page',
    3.0,
    'PALETTE D — focus.ring vs bg.page (UI indicator floor, WCAG 2.4.11)',
    true,
  ],
];

async function readTokens(page, theme) {
  await page.evaluate((t) => {
    if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }, theme);
  const values = {};
  for (const [role, varName] of Object.entries(VARS)) {
    values[role] = await page.evaluate(
      (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim(),
      varName,
    );
  }
  return values;
}

async function runContrast() {
  if (!existsSync(TOKENS_CSS)) {
    console.error(`✗ ${TOKENS_CSS} not found — run \`npm run build\` first.`);
    process.exit(1);
  }
  const css = readFileSync(TOKENS_CSS, 'utf8');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(
    `<!doctype html><html><head><style>${css}</style></head><body></body></html>`,
  );

  let anyFail = false;
  const rows = [];
  for (const theme of ['light', 'dark']) {
    const values = await readTokens(page, theme);
    for (const [fgRole, bgRole, floor, label, gate] of CONTRAST_CHECKS) {
      const fgRaw = values[fgRole];
      const bgRaw = values[bgRole];
      const bg = parseColor(bgRaw);
      const fg = compositeOver(parseColor(fgRaw), bg);
      const ratio = contrastRatio(fg, bg);
      const pass = ratio >= floor;
      if (!pass && gate) anyFail = true;
      rows.push({ theme, label, fgRaw, bgRaw, ratio, floor, pass, gate });
    }
  }

  await browser.close();

  console.log('');
  for (const r of rows) {
    const mark = r.pass ? '✓' : '✗';
    console.log(
      `${mark} [${r.theme}] ${r.label}\n` +
        `    fg=${r.fgRaw}  bg=${r.bgRaw}  ratio=${r.ratio.toFixed(2)}:1  floor=${r.floor}:1`,
    );
  }
  console.log('');
  console.log(
    anyFail ? '✗ one or more contrast checks failed the floor' : '✓ all contrast checks pass',
  );
  process.exit(anyFail ? 1 : 0);
}

// ---- height mode ----------------------------------------------------------------------------

// [label, storyId, selector] — storyId is the storybook index id (title/export, kebab-cased,
// `--` joined). selector scopes the measurement to the actual control — Button stories render
// the button as the story root, but Input/Textarea stories wrap the control in a <label> (for a
// real accessible name), so the root itself would include the label text and gap.
const HEIGHT_CHECKS = [
  ['Button md', 'components-button--medium', '#storybook-root'],
  ['Button sm', 'components-button--small', '#storybook-root'],
  ['Input md', 'components-input--medium', '#storybook-root input'],
  ['Input sm', 'components-input--small', '#storybook-root input'],
];

async function measureHeight(page, baseUrl, storyId, selector) {
  await page.goto(`${baseUrl}/iframe.html?viewMode=story&id=${storyId}`);
  await page.waitForSelector('#storybook-root *', { timeout: 10_000 });
  const box = await page.locator(selector).first().boundingBox();
  return box?.height ?? null;
}

async function runHeight() {
  if (!existsSync(STORYBOOK_IFRAME)) {
    console.error(`✗ ${STORYBOOK_IFRAME} not found — run \`npm run build-storybook\` first.`);
    process.exit(1);
  }
  const server = await serveStatic(STORYBOOK_STATIC);
  const baseUrl = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('');
  for (const [label, storyId, selector] of HEIGHT_CHECKS) {
    const height = await measureHeight(page, baseUrl, storyId, selector);
    console.log(
      height == null ? `? ${label}: could not measure (${storyId})` : `  ${label}: ${height}px`,
    );
  }
  console.log('');

  await browser.close();
  server.close();
}

// ---- entry ------------------------------------------------------------------------------------

const mode = process.argv[2];
if (mode === 'contrast') await runContrast();
else if (mode === 'height') await runHeight();
else {
  console.error('usage: node scripts/verify-contrast.mjs <contrast|height>');
  process.exit(1);
}
