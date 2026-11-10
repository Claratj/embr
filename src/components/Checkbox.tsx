import { useLayoutEffect, useRef } from 'react';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import {
  CHOICE_BOX_CLASSES,
  CHOICE_BOX_SLOT_CLASSES,
  CHOICE_INPUT_BASE_CLASSES,
  CHOICE_ROW_CLASSES,
  CHOICE_STATE_CLASSES,
} from './internal/choice-classes';
import { useComposedRefs } from './internal/compose-refs';
import { cx } from './internal/cx';
import { useFormFieldControlContext } from './internal/form-field-context';
import { CheckGlyph, DashGlyph } from './internal/glyphs';

/**
 * `Omit<..., 'type'>`: it is always a checkbox. `'size'`: the native attribute is a character
 * width, meaningless here — Checkbox has one size. `'children'`: re-declared below as the label.
 */
export interface CheckboxProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'type' | 'size' | 'children'
> {
  /**
   * The visible label. Rendered inside a wrapping `<label>`, so clicking the text toggles the
   * box and the whole row counts as the target. Omit it only when an external `<label>` or
   * `aria-label` names the control — and mind the 24px target size (WCAG 2.5.8) when you do.
   */
  children?: ReactNode;
  /**
   * The "some but not all" state of a select-all box. Controlled: it is a DOM property with no
   * HTML attribute, set on every render, and the browser clears it on click — so the consumer
   * recomputes it from its own state, like `checked`. Exposed to assistive tech as "mixed".
   */
  indeterminate?: boolean;
  /**
   * Border switches to 2px `border-danger` and `aria-invalid` is set. Colour is never the only
   * signal — pair it with FormField's error text.
   */
  invalid?: boolean;
}

/**
 * A native `<input type="checkbox">`, painted (docs/adr/0007). Works controlled (`checked` +
 * `onChange`) or uncontrolled (`defaultChecked` + `name`, read from the form), so it plugs into
 * a plain `<form>`, react-hook-form's `register`, or TanStack Form's `field.handleChange` alike.
 *
 * Inside a FormField it picks up the same ambient wiring as Input (id, aria-describedby, invalid,
 * required); an explicit prop always wins. Use the `children` label, not FormFieldLabel — a
 * checkbox's label sits beside it, not above.
 *
 * `className` goes on the root: the `<label>` row when there is a label, the box otherwise.
 */
export function Checkbox({
  children,
  indeterminate = false,
  invalid = false,
  className,
  id,
  required,
  'aria-describedby': ariaDescribedBy,
  ref,
  ...rest
}: CheckboxProps) {
  const field = useFormFieldControlContext();
  const isInvalid = invalid || field.invalid === true;
  const isRequired = required ?? field.required;

  const innerRef = useRef<HTMLInputElement>(null);
  const composedRef = useComposedRefs(innerRef, ref);
  // No dependency array on purpose: a click clears `indeterminate` in the DOM without a
  // re-render, so re-asserting the prop on every commit is what keeps the two in sync.
  useLayoutEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate;
  });

  const box = (
    <span
      className={cx(
        CHOICE_BOX_CLASSES,
        !children && 'has-disabled:opacity-disabled',
        !children && className,
      )}
    >
      <input
        ref={composedRef}
        type="checkbox"
        id={id ?? field.controlId}
        aria-describedby={ariaDescribedBy ?? field.describedBy}
        aria-invalid={isInvalid || undefined}
        required={isRequired}
        className={cx(
          CHOICE_INPUT_BASE_CLASSES,
          'rounded-xs indeterminate:border-brand-text indeterminate:bg-brand',
          isInvalid ? CHOICE_STATE_CLASSES.invalid : CHOICE_STATE_CLASSES.default,
        )}
        {...rest}
      />
      <CheckGlyph className="pointer-events-none absolute inset-0 size-4 text-on-brand opacity-0 peer-checked:opacity-100 peer-indeterminate:opacity-0" />
      <DashGlyph className="pointer-events-none absolute inset-0 size-4 text-on-brand opacity-0 peer-indeterminate:opacity-100" />
    </span>
  );

  if (!children) return box;

  return (
    <label className={cx(CHOICE_ROW_CLASSES, className)}>
      <span className={CHOICE_BOX_SLOT_CLASSES}>{box}</span>
      <span>
        {children}
        {isRequired && (
          <span aria-hidden="true" className="text-on-danger">
            {' '}
            *
          </span>
        )}
      </span>
    </label>
  );
}
