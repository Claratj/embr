// Fork of lib/css-fallback.mjs — see .design-sync/config.json's libOverrides for why.
//
// Embr ships CSS as three layered files that chain via relative @import
// (dist/styles.css → ./preset.css → ./tokens.css — see scripts/build-css.js).
// That's real, intentional content (base-layer rules), so upstream's
// isPlaceholderCss (<500B, @import-only) never trips and the storybook
// fallback never fires — but none of the three dist files contain compiled
// Tailwind utility classes: Embr deliberately ships the preset, not
// pre-generated utilities (docs/adr/0003), and expects the CONSUMING app's
// own Tailwind build to generate them. The only place those utilities exist
// already compiled is the reference storybook build (`.storybook/storybook.css`
// runs `@tailwindcss/vite` for real). So: also fall back to storybook's
// compiled CSS when the copied dist CSS references a relative sibling that
// wasn't carried into the bundle (import-chain broke), even though the file
// itself isn't a tiny stub.

import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';

export function inlineFontFacesFromStorybook(sbStatic, existingRules) {
  if (!sbStatic) return [];
  let html;
  try { html = readFileSync(join(sbStatic, 'iframe.html'), 'utf8'); } catch { return []; }
  const familyOf = (block) => /font-family:\s*['"]?([^'";}]+)/i.exec(block)?.[1].trim().toLowerCase();
  const have = new Set(existingRules.map(familyOf).filter(Boolean));
  const out = [];
  for (const m of html.matchAll(/@font-face\s*\{[^}]*\}/gi)) {
    const block = m[0];
    const urls = [...block.matchAll(/url\(\s*['"]?([^'")]+)/gi)].map((u) => u[1]);
    if (!urls.length || !urls.every((u) => u.startsWith('data:'))) continue;
    const fam = familyOf(block);
    if (!fam || have.has(fam)) continue;
    out.push(block);
  }
  if (out.length) console.error(`  [FONTS_FROM_PREVIEW_HEAD] harvested ${out.length} data-URI @font-face rule(s) from the storybook reference`);
  return out;
}

export function isPlaceholderCss(p) {
  if (!existsSync(p)) return false;
  const sz = statSync(p).size;
  if (sz > 500) return false;
  const txt = readFileSync(p, 'utf8');
  const stripped = txt.replace(/\/\*[\s\S]*?\*\//g, '').replace(/@(import|charset)\b[^;]*;/g, '').trim();
  return stripped.length === 0;
}

// Additional trigger (Embr-specific): a relative @import target that isn't
// carried into `out` alongside bundleCss — i.e. the copied file is real but
// its import chain is broken in the output.
function hasUnresolvedImport(p, out) {
  if (!existsSync(p)) return false;
  const txt = readFileSync(p, 'utf8');
  for (const m of txt.matchAll(/@import\s+(?:url\()?["']([^"')]+)["']/g)) {
    const target = m[1];
    if (/^(https?:|\/\/)/.test(target)) continue; // remote, not ours to resolve
    if (!existsSync(join(out, target))) return true;
  }
  return false;
}

export function fallbackCssFromStorybook({ bundleCss, sbStatic, out }) {
  const isStub = existsSync(bundleCss) && isPlaceholderCss(bundleCss);
  const isBroken = existsSync(bundleCss) && !isStub && hasUnresolvedImport(bundleCss, out);
  if ((existsSync(bundleCss) && !isStub && !isBroken) || !sbStatic || !existsSync(join(sbStatic, 'iframe.html'))) return null;
  const iframeHtml = readFileSync(join(sbStatic, 'iframe.html'), 'utf8');
  const links = [...iframeHtml.matchAll(/<link\b[^>]*>/gi)]
    .map((m) => m[0])
    .filter((t) => /\brel\s*=\s*["']stylesheet["']/i.test(t))
    .map((t) => t.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1])
    .filter((h) => h && !/^(https?:|\/\/)/.test(h))
    .map((h) => join(sbStatic, h.replace(/^\.\//, '')))
    .filter((p) => p.startsWith(sbStatic + sep) && existsSync(p))
    .sort((a, b) => statSync(b).size - statSync(a).size);
  if (links[0]) {
    const was = !existsSync(bundleCss)
      ? 'missing'
      : isStub
        ? `a ${statSync(bundleCss).size}B placeholder`
        : `a real file with a broken relative @import (dist's split styles.css/preset.css/tokens.css chain wasn't carried into the bundle, and none of them contain compiled Tailwind utilities anyway)`;
    const kb = (statSync(links[0]).size / 1024).toFixed(0);
    const srcDir = dirname(links[0]);
    const css = readFileSync(links[0], 'utf8');
    const assets = [...new Set([...css.matchAll(/url\(\s*(['"]?)(?!data:|https?:|\/\/|\/)([^'")]+)\1\s*\)/gi)].map((m) => m[2]))];
    writeFileSync(bundleCss, css);
    console.error(`[CSS_FROM_STORYBOOK] _ds_bundle.css was ${was} — replaced with ${relative(out, links[0])} (${kb} KB).`);
    if (assets.length) {
      console.error(`[CSS_ASSETS] ${assets.length} relative url() ref(s) in the fallback CSS won't resolve post-upload (fonts are copied separately via extractFonts; images will 404): ${assets.slice(0, 5).join(', ')}${assets.length > 5 ? ', …' : ''}`);
    }
    return srcDir;
  }
  console.error(`[CSS_PLACEHOLDER] _ds_bundle.css is missing, a stub, or has a broken relative import, and no storybook CSS found to fall back to — set cfg.cssEntry to the compiled stylesheet.`);
  return null;
}

export function scrapeRemoteImports(sbStatic) {
  if (!sbStatic || !existsSync(join(sbStatic, 'iframe.html'))) return [];
  const iframeHtml = readFileSync(join(sbStatic, 'iframe.html'), 'utf8');
  const out = [...new Set(
    [...iframeHtml.matchAll(/<link\b[^>]*>/gi)]
      .map((m) => m[0])
      .filter((t) => /\brel\s*=\s*["']stylesheet["']/i.test(t))
      .map((t) => t.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1])
      .filter((h) => h && /^(https?:|\/\/)/.test(h))
      .map((h) => (h.startsWith('//') ? 'https:' + h : h)),
  )];
  if (out.length) {
    console.error(`  remote stylesheet(s) from storybook: ${out.length} → styles.css @import url(...)`);
  }
  return out;
}
