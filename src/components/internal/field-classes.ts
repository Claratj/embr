export type FieldSize = 'sm' | 'md';

/**
 * Shared between Input and Textarea — both are specified to use identical tokens, states, and
 * size prop (EMBR-PHASE-4.md STEP 2: "if the two files diverge in their state styling, one of
 * them is wrong"). Two real callers already, not a speculative helper.
 *
 * No hover treatment: the text cursor and the border itself already announce that a field is
 * interactive, so restyling the boundary on hover would just be noise. No focus class either —
 * the global `:focus-visible` rule (src/css/base.css) already covers it identically to every
 * other component; a second focus idiom in the same system would be a bug, not a feature.
 */
export const FIELD_BASE_CLASSES =
  'w-full rounded-sm border bg-surface text-ink font-body placeholder:text-caption ' +
  'disabled:opacity-disabled';

/**
 * Two sizes, matching Button's own text scale — differ only in vertical padding.
 *
 * Known, accepted height mismatch vs Button (EMBR-PHASE-4.md STOP 3, measured with Playwright
 * against the built Storybook, not estimated): md is 39px against Button md's 37px (2px gap);
 * sm is 28px against Button sm's 27px (1px gap — NOT the 2px the phase doc assumed by
 * extrapolating from md; Button's own Small story comment claiming "26px" is stale, it actually
 * renders 27px). A uniform 1px transparent border on Button would close the md gap exactly
 * (37+2=39) but overshoot sm by 1px in the other direction (27+2=29 vs Input's 28), since a
 * border adds to both edges. Deliberately left as-is rather than trading one mismatch for
 * another — do not "fix" this by touching Button's border or Input's padding without
 * re-verifying both sizes.
 */
export const FIELD_SIZE_CLASSES: Record<FieldSize, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-3 py-2 text-sm',
};

/**
 * `invalid` swaps the 1px `border-border` for a 2px `border-danger` — a deliberate 2px growth in
 * both directions, not a compensating padding value the integer-only spacing scale can't express
 * (EMBR-PHASE-4.md STOP 1).
 */
export const FIELD_STATE_CLASSES = {
  default: 'border-border',
  invalid: 'border-2 border-danger',
};
