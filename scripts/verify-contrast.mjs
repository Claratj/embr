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
 *     controls against Button, and gates the pairs that must match exactly.
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
  'bg.subtle': '--embr-bg-subtle',
  'text.default': '--embr-text-default',
  'text.muted': '--embr-text-muted',
  'text.on-inverse-muted': '--embr-text-on-inverse-muted',
  'text.on-inverse-action': '--embr-text-on-inverse-action',
  'brand.primary-text': '--embr-brand-primary-text',
  'brand.link-hover': '--embr-brand-link-hover',
  'brand.label-on-inverse': '--embr-brand-label-on-inverse',
  'inverse.action': '--embr-inverse-action',
  'inverse.action-hover': '--embr-inverse-action-hover',
  'focus.ring-on-inverse': '--embr-focus-ring-on-inverse',
  'status.on-warning-solid': '--embr-status-on-warning-solid',
  'status.neutral-subtle': '--embr-status-neutral-subtle',
  'status.neutral-border': '--embr-status-neutral-border',
  'status.on-neutral': '--embr-status-on-neutral',
  'status.info-subtle': '--embr-status-info-subtle',
  'status.info-border': '--embr-status-info-border',
  'status.on-info': '--embr-status-on-info',
  'status.success-subtle': '--embr-status-success-subtle',
  'status.success-border': '--embr-status-success-border',
  'status.on-success': '--embr-status-on-success',
  'status.warning-subtle': '--embr-status-warning-subtle',
  'status.warning-border': '--embr-status-warning-border',
  'status.on-warning': '--embr-status-on-warning',
  'status.danger-subtle': '--embr-status-danger-subtle',
  'status.danger-border': '--embr-status-danger-border',
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
    'status.on-warning-solid',
    'status.warning',
    4.5,
    'BORRADOR 3 — status.onWarningSolid vs status.warning (solid fill; ochre is too light for white)',
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
  // Borrador 3 (2026-11): every role the palette rebase added or re-pointed.
  ['text.default', 'bg.page', 4.5, 'BORRADOR 3 — text.default vs bg.page', true],
  ['text.default', 'bg.surface', 4.5, 'BORRADOR 3 — text.default vs bg.surface', true],
  ['text.default', 'bg.subtle', 4.5, 'BORRADOR 3 — text.default vs bg.subtle', true],
  ['text.muted', 'bg.page', 4.5, 'BORRADOR 3 — text.muted vs bg.page', true],
  [
    'brand.primary-text',
    'bg.page',
    4.5,
    'BORRADOR 3 — brand.primaryText vs bg.page (outline button)',
    true,
  ],
  ['brand.link-hover', 'bg.page', 4.5, 'BORRADOR 3 — brand.linkHover vs bg.page', true],
  ['text.muted', 'bg.surface', 4.5, 'BORRADOR 3 — text.muted vs bg.surface', true],
  [
    'brand.primary-text',
    'bg.surface',
    4.5,
    'BORRADOR 3 — brand.primaryText vs bg.surface (outline button)',
    true,
  ],
  ['brand.link-hover', 'bg.surface', 4.5, 'BORRADOR 3 — brand.linkHover vs bg.surface', true],
  ['focus.ring', 'bg.surface', 3.0, 'BORRADOR 3 — focus.ring vs bg.surface', true],
  [
    'brand.primary-text',
    'bg.subtle',
    4.5,
    'BORRADOR 3 — brand.primaryText vs bg.subtle (outline button hover)',
    true,
  ],
  [
    'text.on-inverse-muted',
    'bg.inverse',
    4.5,
    'BORRADOR 3 — text.onInverseMuted vs bg.inverse',
    true,
  ],
  [
    'brand.label-on-inverse',
    'bg.inverse',
    4.5,
    'BORRADOR 3 — brand.labelOnInverse vs bg.inverse (eyebrow on teal)',
    true,
  ],
  [
    'inverse.action',
    'bg.inverse',
    3.0,
    'BORRADOR 3 — inverse.action vs bg.inverse (inverse button border)',
    true,
  ],
  [
    'text.on-inverse-action',
    'inverse.action',
    4.5,
    'BORRADOR 3 — text.onInverseAction vs inverse.action (inverse-solid label)',
    true,
  ],
  [
    'text.on-inverse-action',
    'inverse.action-hover',
    4.5,
    'BORRADOR 3 — text.onInverseAction vs inverse.actionHover',
    true,
  ],
  [
    'focus.ring-on-inverse',
    'bg.inverse',
    3.0,
    'BORRADOR 3 — focus.ringOnInverse vs bg.inverse',
    true,
  ],
  [
    'status.on-neutral',
    'status.neutral-subtle',
    4.5,
    'BORRADOR 3 — status.onNeutral vs status.neutralSubtle (soft badge)',
    true,
  ],
  [
    'status.neutral-border',
    'bg.page',
    3.0,
    'BORRADOR 3 — status.neutralBorder vs bg.page (outline badge)',
    true,
  ],
  [
    'status.on-neutral',
    'bg.page',
    4.5,
    'BORRADOR 3 — status.onNeutral vs bg.page (outline badge text)',
    true,
  ],
  [
    'status.on-info',
    'status.info-subtle',
    4.5,
    'BORRADOR 3 — status.onInfo vs status.infoSubtle (soft badge)',
    true,
  ],
  [
    'status.info-border',
    'bg.page',
    3.0,
    'BORRADOR 3 — status.infoBorder vs bg.page (outline badge)',
    true,
  ],
  [
    'status.on-info',
    'bg.page',
    4.5,
    'BORRADOR 3 — status.onInfo vs bg.page (outline badge text)',
    true,
  ],
  [
    'status.on-success',
    'status.success-subtle',
    4.5,
    'BORRADOR 3 — status.onSuccess vs status.successSubtle (soft badge)',
    true,
  ],
  [
    'status.success-border',
    'bg.page',
    3.0,
    'BORRADOR 3 — status.successBorder vs bg.page (outline badge)',
    true,
  ],
  [
    'status.on-success',
    'bg.page',
    4.5,
    'BORRADOR 3 — status.onSuccess vs bg.page (outline badge text)',
    true,
  ],
  [
    'status.on-warning',
    'status.warning-subtle',
    4.5,
    'BORRADOR 3 — status.onWarning vs status.warningSubtle (soft badge)',
    true,
  ],
  [
    'status.warning-border',
    'bg.page',
    3.0,
    'BORRADOR 3 — status.warningBorder vs bg.page (outline badge)',
    true,
  ],
  [
    'status.on-warning',
    'bg.page',
    4.5,
    'BORRADOR 3 — status.onWarning vs bg.page (outline badge text)',
    true,
  ],
  [
    'status.on-danger',
    'status.danger-subtle',
    4.5,
    'BORRADOR 3 — status.onDanger vs status.dangerSubtle (soft badge)',
    true,
  ],
  [
    'status.danger-border',
    'bg.page',
    3.0,
    'BORRADOR 3 — status.dangerBorder vs bg.page (outline badge)',
    true,
  ],
  // Phase 5 — Checkbox / Radio. Checked = brand.primary fill inside a brand.primaryText border.
  // The border carries the 3:1 boundary (WCAG 1.4.11); the fill alone is reported but not gated,
  // because in dark it lands at 2.99:1 on bg.surface — the measurement that put the border there.
  [
    'brand.primary-text',
    'bg.page',
    3.0,
    'PHASE 5 — brand.primaryText vs bg.page (checked checkbox/radio boundary)',
    true,
  ],
  [
    'brand.primary-text',
    'bg.surface',
    3.0,
    'PHASE 5 — brand.primaryText vs bg.surface (checked checkbox/radio boundary)',
    true,
  ],
  [
    'brand.primary',
    'bg.surface',
    3.0,
    '(informational) PHASE 5 — brand.primary fill alone vs bg.surface',
    false,
  ],
  [
    'text.on-brand',
    'brand.primary',
    3.0,
    'PHASE 5 — text.onBrand vs brand.primary (tick, dash and dot glyphs)',
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
  ['Select md', 'components-select--medium', '#storybook-root select'],
  ['Select sm', 'components-select--small', '#storybook-root select'],
];

// Pairs that must render at exactly the same height — a Select next to an Input in a form row
// that differs by a pixel is the kind of drift this script exists to catch. Unlike the Button vs
// Input gap (documented and accepted in internal/field-classes.ts), these share their classes,
// so any difference is a bug.
const SAME_HEIGHT = [
  ['Select md', 'Input md'],
  ['Select sm', 'Input sm'],
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
  const heights = {};
  for (const [label, storyId, selector] of HEIGHT_CHECKS) {
    const height = await measureHeight(page, baseUrl, storyId, selector);
    heights[label] = height;
    console.log(
      height == null ? `? ${label}: could not measure (${storyId})` : `  ${label}: ${height}px`,
    );
  }
  console.log('');

  let anyFail = false;
  for (const [a, b] of SAME_HEIGHT) {
    const pass = heights[a] != null && heights[a] === heights[b];
    if (!pass) anyFail = true;
    console.log(`${pass ? '✓' : '✗'} ${a} (${heights[a]}px) = ${b} (${heights[b]}px)`);
  }
  console.log('');

  await browser.close();
  server.close();
  process.exit(anyFail ? 1 : 0);
}

// ---- entry ------------------------------------------------------------------------------------

const mode = process.argv[2];
if (mode === 'contrast') await runContrast();
else if (mode === 'height') await runHeight();
else {
  console.error('usage: node scripts/verify-contrast.mjs <contrast|height>');
  process.exit(1);
}
