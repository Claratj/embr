#!/usr/bin/env node
/**
 * Verifies the motion contract against REAL rendered components in storybook-static/ — the same
 * reasoning as verify-contrast.mjs: assert what actually ships, not what the source says.
 *
 * This script exists because of a specific bug that shipped three times and that the whole test
 * suite was blind to. Tailwind v4's `scale-*` and `translate-*` utilities compile to the
 * standalone CSS properties `scale:` and `translate:`, which the browser animates independently
 * of `transform`. Button, Tag and FormFieldError each declared `transition-[…,transform]`
 * alongside a `scale`/`translate` utility, so their press and entrance animations never
 * transitioned at all — they snapped. Every story rendered, every assertion passed, axe was
 * green, and the animation was silently dead. Nothing in the repo could see it.
 *
 * The reduced-motion checks need `prefers-reduced-motion` emulation, which a Storybook play
 * function cannot do — it runs in whatever context the test runner gave it. Hence a Playwright
 * script rather than an interaction test.
 *
 * Deliberately NOT here: sampling intermediate values across a running transition to prove it
 * "really eases". That is the most direct proof, and it is how these fixes were verified by hand,
 * but it is timing-sensitive and would make CI flaky. The property assertions below catch the
 * exact bug class deterministically: a transition list naming `transform` does not contain
 * `scale`, so it fails.
 *
 * Requires `npm run build-storybook` to have been run first — this script never builds anything
 * itself, so a stale run is always the caller's mistake, not a silent difference from what's on
 * disk.
 */
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { serveStatic } from './serve-static.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const STORYBOOK_STATIC = resolve(ROOT, 'storybook-static');
const STORYBOOK_IFRAME = join(STORYBOOK_STATIC, 'iframe.html');

const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_DEFAULT = 'cubic-bezier(0.25, 0.1, 0.25, 1)';

const BUTTON = ['components-button--solid', '#storybook-root button'];
const TAG = ['components-tag--unselected', '#storybook-root button'];
const INPUT = ['components-input--invalid', '#storybook-root input'];
const TEXTAREA = ['components-textarea--invalid', '#storybook-root textarea'];
const FIELD_ERROR = ['components-formfield--with-error', '#storybook-root p.text-on-danger'];

// [label, [storyId, selector], property] — the property the component actually animates must be
// named in its own transition list. Naming `transform` instead of `scale`/`translate` is the bug
// this catches: the utility sets `scale:`/`translate:`, so `transform` transitions nothing.
const MOVEMENT_CHECKS = [
  ['Button press animates (scale, not transform)', BUTTON, 'scale'],
  ['Tag press animates (scale, not transform)', TAG, 'scale'],
  ['FormFieldError entrance animates (translate, not transform)', FIELD_ERROR, 'translate'],
];

// [label, [storyId, selector], mustExclude, mustInclude] — under prefers-reduced-motion: reduce,
// movement is dropped but the comprehension-carrying colour/opacity fade is kept. Reduced motion
// means fewer and gentler animations, not zero.
const REDUCED_MOTION_CHECKS = [
  ['Button drops the press, keeps the colour fade', BUTTON, 'scale', 'background-color'],
  ['Tag drops the press, keeps the colour fade', TAG, 'scale', 'background-color'],
  ['FormFieldError drops the slide, keeps the fade', FIELD_ERROR, 'translate', 'opacity'],
  ['Input keeps its border-colour fade', INPUT, null, 'background-color'],
];

// [label, [storyId, selector]] — hover must be gated behind (hover: hover) and (pointer: fine).
// On a touch device a bare :hover fires on tap with no pointer move to clear it, leaving the
// control stuck in its hover colour.
//
// The `pointer: fine` half is asserted against the stylesheet, not by emulating a touch device.
// Tailwind v4 already wraps every `hover:` utility in `@media (hover: hover)` on its own, and
// Playwright's touch emulation sets `hover: none` and `pointer: coarse` together — so a rendered
// "does the hover apply on a phone?" check goes green whether or not `can-hover:` is there. It
// can only pass, which makes it worse than no check at all. Reading the rule's own media
// condition distinguishes the two: ungated is `(hover: hover)`, gated adds `(pointer: fine)`.
const HOVER_CHECKS = [
  ['Button hover is pointer-gated', BUTTON],
  ['Tag hover is pointer-gated', TAG],
];

// Walks the live stylesheets for every `:hover` rule that applies to this element and returns the
// media conditions guarding each one.
function hoverRuleConditions(el) {
  return el.evaluate((node) => {
    const found = [];
    const walk = (rules, conditions) => {
      for (const rule of rules) {
        // Recurse through every grouping rule, not just @media: Tailwind v4 nests all of its
        // output inside `@layer utilities { … }`, so a media-only walk never reaches any of it.
        if (rule.cssRules) {
          const media = rule.conditionText ?? rule.media?.mediaText;
          walk(rule.cssRules, rule.media ? [...conditions, media] : conditions);
        }
        if (rule.selectorText?.includes(':hover')) {
          // Strip only the trailing `:hover` pseudo-class. A Tailwind hover utility's own class
          // name contains an *escaped* `\:hover\:` (`.can-hover\:hover\:bg-subtle:hover`), so a
          // global replace would mangle the selector into something that matches nothing.
          for (const part of rule.selectorText.split(',')) {
            const bare = part.trim().replace(/:hover\s*$/, '');
            if (bare.startsWith('.') && node.matches(bare)) {
              found.push({ selector: rule.selectorText, conditions });
              break;
            }
          }
        }
      }
    };
    for (const sheet of document.styleSheets) {
      try {
        walk(sheet.cssRules, []);
      } catch {
        /* cross-origin sheet, not ours */
      }
    }
    return found;
  });
}

// [label, [storyId, selector], expected] — ease-out is reserved for entrances, exits and press
// feedback; a pure colour/border transition uses CSS's own `ease` curve.
const EASING_CHECKS = [
  ['Input uses ease-default', INPUT, EASE_DEFAULT],
  ['Textarea uses ease-default', TEXTAREA, EASE_DEFAULT],
  ['Button uses ease-out', BUTTON, EASE_OUT],
  ['Tag uses ease-out', TAG, EASE_OUT],
  ['FormFieldError uses ease-out', FIELD_ERROR, EASE_OUT],
];

const rows = [];
let anyFail = false;

function record(pass, label, detail) {
  if (!pass) anyFail = true;
  rows.push({ pass, label, detail });
}

async function open(page, baseUrl, [storyId, selector]) {
  await page.goto(`${baseUrl}/iframe.html?viewMode=story&id=${storyId}`);
  await page.waitForSelector('#storybook-root *', { timeout: 10_000 });
  return page.locator(selector).first();
}

const transitionList = (el) =>
  el.evaluate((n) =>
    getComputedStyle(n)
      .transitionProperty.split(',')
      .map((p) => p.trim()),
  );

async function run() {
  if (!existsSync(STORYBOOK_IFRAME)) {
    console.error(`✗ ${STORYBOOK_IFRAME} not found — run \`npm run build-storybook\` first.`);
    process.exit(1);
  }

  const server = await serveStatic(STORYBOOK_STATIC);
  const baseUrl = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch();

  // ---- movement properties + easing, default context ----------------------------------------
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  for (const [label, target, prop] of MOVEMENT_CHECKS) {
    const props = await transitionList(await open(page, baseUrl, target));
    record(props.includes(prop), label, `transition-property: ${props.join(', ')}`);
  }

  for (const [label, target, expected] of EASING_CHECKS) {
    const got = await (
      await open(page, baseUrl, target)
    ).evaluate((n) => getComputedStyle(n).transitionTimingFunction);
    record(got === expected, label, `${got}${got === expected ? '' : `  (want ${expected})`}`);
  }

  for (const [label, target] of HOVER_CHECKS) {
    const el = await open(page, baseUrl, target);

    // 1. The hover treatment still works on a normal pointer. Park the pointer off the control
    // first: it stays where the previous check left it across navigations, and the next story
    // can render right underneath it — reading a "before" colour that is already the hover one.
    await page.mouse.move(0, 0);
    const fine = await page.evaluate(() => matchMedia('(pointer: fine)').matches);
    const before = await el.evaluate((n) => getComputedStyle(n).backgroundColor);
    await el.hover();
    await page.waitForTimeout(250); // 140ms transition, generous settle window
    const after = await el.evaluate((n) => getComputedStyle(n).backgroundColor);
    record(
      fine && before !== after,
      `${label} — applies on a fine pointer`,
      fine ? `${before} -> ${after}` : 'FINE-POINTER EMULATION DID NOT TAKE EFFECT',
    );

    // 2. ...and every rule delivering it is guarded by `pointer:`.
    const hoverRules = await hoverRuleConditions(el);
    const ungated = hoverRules.filter((r) => !r.conditions.some((c) => c.includes('pointer')));
    record(
      hoverRules.length > 0 && ungated.length === 0,
      `${label} — every :hover rule is behind a pointer media query`,
      hoverRules.length === 0
        ? 'NO :hover RULES MATCHED — the check found nothing to assert on'
        : ungated.length
          ? `ungated: ${ungated.map((r) => r.selector).join(', ')}`
          : hoverRules.map((r) => `${r.selector} @ ${r.conditions.join(' and ')}`).join('; '),
    );
  }
  await ctx.close();

  // ---- reduced motion -----------------------------------------------------------------------
  const reducedCtx = await browser.newContext({ reducedMotion: 'reduce' });
  const reducedPage = await reducedCtx.newPage();
  for (const [label, target, mustExclude, mustInclude] of REDUCED_MOTION_CHECKS) {
    const props = await transitionList(await open(reducedPage, baseUrl, target));
    const ok =
      props.includes(mustInclude) && (mustExclude === null || !props.includes(mustExclude));
    record(ok, label, `transition-property: ${props.join(', ')}`);
  }
  await reducedCtx.close();

  await browser.close();
  server.close();

  console.log('');
  for (const r of rows) console.log(`${r.pass ? '✓' : '✗'} ${r.label}\n    ${r.detail}`);
  console.log('');
  console.log(anyFail ? '✗ one or more motion checks failed' : '✓ all motion checks pass');
  process.exit(anyFail ? 1 : 0);
}

await run();
