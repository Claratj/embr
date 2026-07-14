/**
 * Embr — public entry point.
 *
 * Phase 0 ships foundations only: the generated design tokens and a helper to reference them.
 * Components land in Phase 2 and are exported from here, one per module, so consumers can
 * tree-shake down to what they actually import.
 *
 * Styles are *not* imported from JavaScript — that would make this module impure and break
 * `sideEffects: false`. Consumers import them explicitly:
 *
 *   @import "tailwindcss";
 *   @import "embr-ui/preset.css";   // tokens + Tailwind theme
 *   // or "embr-ui/styles.css"      // the above, plus Embr's base layer
 */
export { tokens, cssVar } from './tokens/generated/tokens';
export type { EmbrToken, TokenName } from './tokens/generated/tokens';
