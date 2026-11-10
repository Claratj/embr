# 0007 — Checkbox, Radio and Select are painted native controls, not Radix

- **Status:** accepted
- **Date:** 2026-11-10

## Context

Phase 5 adds Checkbox, RadioGroup/Radio and Select. Radix (already in the stack, via Slot and
Tooltip) ships headless versions of all three. Two options for each: style the native element,
or compose the Radix primitive.

## Decision

All three are native elements painted with tokens:

- **Checkbox / Radio**: `<input type="checkbox|radio">` with `appearance-none`. Radix renders a
  `<button role="checkbox">` plus a hidden input — no accessibility gain over the native input,
  and it would not fit FormField's ambient wiring, which targets a real control by `id`.
- **RadioGroup**: `<fieldset role="radiogroup">` + `<legend>`. The browser provides the single
  tab stop, arrow-key selection, `name`-based submission and `required` validation.
- **Select**: `<select>` with the same field classes as Input/Textarea and Embr's own chevron.
  The open list is the platform's.

Every control works controlled (`value`/`checked` + `onChange`/`onValueChange` + `onBlur`) and
uncontrolled (`defaultValue`/`defaultChecked` + `name` + `ref`), so it binds to a plain form,
react-hook-form or TanStack Form without Embr depending on any of them.

## Why not Radix Select

- **Mobile:** the native select opens the OS picker; a custom listbox is worse on touch.
- **Surface area:** portal (escapes `bg-inverse` sections and scoped themes), scroll lock and
  `pointer-events` on `body`, item-aligned positioning quirks, `value=""` forbidden on items,
  enter/exit motion to bring under the `verify:motion` contract, and focus leaving the trigger on
  open (a blur that marks a field "touched" before anything is chosen).
- **It doesn't buy the next requirement:** Radix Select is single-choice and has no combobox. A
  multiselect would need another component regardless.

Estimated cost to reach Embr's bar: about half a day native, 2–3 days with Radix.

## Consequences

- The open list of a Select can't be styled (no icons or descriptions in options). If a real case
  needs that, it gets a separate component — not a variant of Select.
- `multiple` is removed from Select's props: a native multi-select is a Cmd/Ctrl-click listbox
  nobody discovers. Few options → a group of Checkboxes (story: "Multiple selection"); many → a
  future **Combobox** (single and multiple), with its own ADR to choose a headless primitive.
- Checked is a `brand.primary` fill (the selected-Tag pair) inside a `brand.primaryText` border.
  Measured: in dark the fill alone is 2.99:1 against `bg.surface`, under the 3:1 boundary floor;
  the border clears it on every surface in both themes. No new colour was introduced for it.
- One new token: `radius.xs` (4px). `radius.sm` (8px) turns a 16px box into a circle, and a
  checkbox must never read as a radio.
- The standalone 16px box is under the 24px target size (WCAG 2.5.8) — the `children` label is
  what makes the target the whole row. Documented on the prop.
