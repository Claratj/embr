/**
 * Shared by Checkbox and Radio — the same control at two shapes. Native `<input>` with
 * `appearance-none`, so the browser still owns semantics, keyboard, form submission and
 * validation; Embr only paints the box (docs/adr/0007).
 *
 * Checked is a `brand.primary` fill with an `on-brand` glyph — the same pair as a selected Tag,
 * so "selected" looks the same everywhere — inside a `brand.primaryText` border. The border is
 * not decoration: in dark, the fill alone measures 2.99:1 against bg.surface, just under the 3:1
 * a component boundary needs (WCAG 1.4.11). `brand.primaryText` is the orange already tuned for
 * each theme (orangeStrong in light, light orange in dark) and clears 3:1 on every surface.
 * All of it is measured in `npm run verify:contrast` (PHASE 5 rows).
 *
 * No hover treatment, matching the field controls (internal/field-classes.ts): the pointer cursor
 * and the border already say "interactive". No focus class: the global `:focus-visible` ring
 * (src/css/base.css) lands on the input itself, which IS the visible box.
 *
 * Disabled dims the whole row (box, glyph and label) from the root via `has-disabled:`, not the
 * input alone — otherwise the glyph and label would stay at full strength next to a faded box.
 */
export const CHOICE_INPUT_BASE_CLASSES =
  'peer m-0 size-4 shrink-0 cursor-pointer appearance-none border bg-surface ' +
  'transition-colors duration-fast ease-default ' +
  'checked:border-brand-text checked:bg-brand disabled:cursor-not-allowed';

/**
 * `invalid` matches the fields: 1px `border-border` becomes 2px `border-danger`. Once checked
 * the brand fill and border win — a checked box is, by definition, no longer the empty
 * required box the error was about.
 */
export const CHOICE_STATE_CLASSES = {
  default: 'border-border',
  invalid: 'border-2 border-danger',
};

/** The box sits on the first line of the label, so multi-line labels wrap under the text. */
export const CHOICE_ROW_CLASSES =
  'inline-flex items-start gap-2 font-body text-sm text-ink cursor-pointer ' +
  'has-disabled:cursor-not-allowed has-disabled:opacity-disabled';

/** Centres the 16px box on the first line box of the label text (`1lh`, a relative unit). */
export const CHOICE_BOX_SLOT_CLASSES = 'flex h-lh shrink-0 items-center';

export const CHOICE_BOX_CLASSES = 'relative inline-flex size-4 shrink-0';
