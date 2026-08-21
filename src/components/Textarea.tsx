import type { ComponentPropsWithRef } from 'react';

import { cx } from './internal/cx';
import {
  FIELD_BASE_CLASSES,
  FIELD_SIZE_CLASSES,
  FIELD_STATE_CLASSES,
} from './internal/field-classes';
import type { FieldSize } from './internal/field-classes';

export type TextareaSize = FieldSize;

/**
 * No `asChild`: a textarea is not a link and has no child to render as — same reasoning as
 * Input.
 */
export interface TextareaProps extends ComponentPropsWithRef<'textarea'> {
  /** @default 'md' */
  size?: TextareaSize;
  /**
   * Border switches to `border-2 border-danger` and `aria-invalid` is set. Colour is never the
   * only signal — pair this with FormField's error text, which carries the actual meaning.
   */
  invalid?: boolean;
}

/**
 * No `min-height` (EMBR-PHASE-4.md STOP 4, accepted as known debt): expressing "at least as
 * tall as Input md" needs either a literal pixel value (Input md measures 39px — see
 * field-classes.ts — but that number isn't a token) or a new height token, and neither is
 * available this session. A 3-row textarea is comfortably taller than 39px on its own in
 * practice, so the visible risk is low, but nothing here enforces it. Revisit once a height
 * token exists.
 */

/** No `forwardRef` — React 19 accepts `ref` as a regular prop. */
export function Textarea({
  size = 'md',
  invalid = false,
  rows = 3,
  className,
  ...rest
}: TextareaProps) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cx(
        FIELD_BASE_CLASSES,
        'resize-y',
        FIELD_SIZE_CLASSES[size],
        invalid ? FIELD_STATE_CLASSES.invalid : FIELD_STATE_CLASSES.default,
        className,
      )}
      {...rest}
    />
  );
}
