import type { ComponentPropsWithRef } from 'react';

import { cx } from './internal/cx';
import {
  FIELD_BASE_CLASSES,
  FIELD_SIZE_CLASSES,
  FIELD_STATE_CLASSES,
} from './internal/field-classes';
import type { FieldSize } from './internal/field-classes';
import { useFormFieldControlContext } from './internal/form-field-context';
import { ChevronDownGlyph } from './internal/glyphs';

export type SelectSize = FieldSize;

/**
 * `Omit<..., 'size'>`: the native `size` is a visible-row count, unrelated to the size variant.
 * `'multiple'`: a native multi-select is a fixed listbox driven by Cmd/Ctrl-click — not a
 * multiselect anyone discovers. Few options → a group of Checkboxes; many → a Combobox, its own
 * future component (docs/adr/0007).
 */
export interface SelectProps extends Omit<ComponentPropsWithRef<'select'>, 'size' | 'multiple'> {
  /** @default 'md' */
  size?: SelectSize;
  /**
   * Border switches to `border-2 border-danger` and `aria-invalid` is set. Colour is never the
   * only signal — pair it with FormField's error text.
   */
  invalid?: boolean;
  /**
   * Text shown while nothing is chosen. Rendered as a first `<option value="">`, disabled so it
   * can't be picked back, and selected initially when neither `value` nor `defaultValue` is
   * given. With `required`, submitting while it shows fails native validation.
   */
  placeholder?: string;
}

/**
 * A native `<select>` (docs/adr/0007): the OS picker on touch devices, full keyboard and
 * typeahead, form submission and validation, zero JS. Embr paints the closed control with the
 * exact field classes Input and Textarea use — same tokens, sizes and states — and replaces the
 * browser's arrow with its own chevron. The open list is the platform's and is not styled.
 *
 * Same FormField wiring as Input. Controlled (`value` + `onChange`) or uncontrolled
 * (`defaultValue` + `name`).
 *
 * `className` goes on the root wrapper (it carries the width), not on the `<select>`.
 */
export function Select({
  size = 'md',
  invalid = false,
  placeholder,
  className,
  id,
  required,
  value,
  defaultValue,
  'aria-describedby': ariaDescribedBy,
  children,
  ...rest
}: SelectProps) {
  const field = useFormFieldControlContext();
  const isInvalid = invalid || field.invalid === true;
  const showPlaceholderFirst =
    placeholder !== undefined && value === undefined && defaultValue === undefined;

  return (
    <span className={cx('relative block w-full', className)}>
      <select
        id={id ?? field.controlId}
        aria-describedby={ariaDescribedBy ?? field.describedBy}
        aria-invalid={isInvalid || undefined}
        required={required ?? field.required}
        value={value}
        defaultValue={showPlaceholderFirst ? '' : defaultValue}
        className={cx(
          FIELD_BASE_CLASSES,
          FIELD_SIZE_CLASSES[size],
          isInvalid ? FIELD_STATE_CLASSES.invalid : FIELD_STATE_CLASSES.default,
          // pr-6 (32px) clears the chevron: right-3 (12px) + size-4 (16px) + a 4px gap.
          'peer cursor-pointer appearance-none pr-6 disabled:cursor-not-allowed',
          // The placeholder reads as a placeholder, not a value — same token as Input's.
          placeholder !== undefined &&
            "has-[option[value='']:checked]:text-caption [&_option]:text-ink",
        )}
        {...rest}
      >
        {placeholder !== undefined && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      <ChevronDownGlyph className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted peer-disabled:opacity-disabled" />
    </span>
  );
}
