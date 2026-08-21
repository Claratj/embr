import type { ComponentPropsWithRef } from 'react';

import { cx } from './internal/cx';
import {
  FIELD_BASE_CLASSES,
  FIELD_SIZE_CLASSES,
  FIELD_STATE_CLASSES,
} from './internal/field-classes';
import type { FieldSize } from './internal/field-classes';

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

/** No `forwardRef` — React 19 accepts `ref` as a regular prop. */
export function Input({ size = 'md', invalid = false, className, ...rest }: InputProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={cx(
        FIELD_BASE_CLASSES,
        FIELD_SIZE_CLASSES[size],
        invalid ? FIELD_STATE_CLASSES.invalid : FIELD_STATE_CLASSES.default,
        className,
      )}
      {...rest}
    />
  );
}
