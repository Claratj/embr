import type { ComponentPropsWithRef } from 'react';

import { cx } from './internal/cx';
import {
  FIELD_BASE_CLASSES,
  FIELD_SIZE_CLASSES,
  FIELD_STATE_CLASSES,
} from './internal/field-classes';
import type { FieldSize } from './internal/field-classes';
import { useFormFieldControlContext } from './internal/form-field-context';

export type InputSize = FieldSize;

/**
 * No `asChild`: an input is not a link and has no child to render as — Slot's polymorphism has
 * no meaningful target here, unlike Button.
 *
 * `Omit<..., 'size'>`: the native `size` attribute is a number (visible character width) —
 * unrelated to and incompatible with this component's own `size` variant prop.
 */
export interface InputProps extends Omit<ComponentPropsWithRef<'input'>, 'size'> {
  /** @default 'md' */
  size?: InputSize;
  /**
   * Border switches to `border-2 border-danger` and `aria-invalid` is set. Colour is never the
   * only signal — pair this with FormField's error text, which carries the actual meaning.
   */
  invalid?: boolean;
}

/**
 * No `forwardRef` — React 19 accepts `ref` as a regular prop.
 *
 * Ambient `FormField` wiring (id, aria-describedby, invalid, required) is merged in when this
 * Input is rendered inside one, but an explicit prop the consumer actually passes always wins —
 * `id`/`required`/`aria-describedby` are destructured out and re-applied after the context
 * fallback, and `invalid` is a plain `||` since it's not a DOM attribute name collision.
 */
export function Input({
  size = 'md',
  invalid = false,
  className,
  id,
  required,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: InputProps) {
  const field = useFormFieldControlContext();
  const isInvalid = invalid || field.invalid === true;
  return (
    <input
      id={id ?? field.controlId}
      aria-describedby={ariaDescribedBy ?? field.describedBy}
      aria-invalid={isInvalid || undefined}
      required={required ?? field.required}
      className={cx(
        FIELD_BASE_CLASSES,
        FIELD_SIZE_CLASSES[size],
        isInvalid ? FIELD_STATE_CLASSES.invalid : FIELD_STATE_CLASSES.default,
        className,
      )}
      {...rest}
    />
  );
}
