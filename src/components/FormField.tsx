import { Children, isValidElement, useId } from 'react';
import type { ComponentPropsWithRef } from 'react';

import { cx } from './internal/cx';
import { FormFieldContext, useFormFieldContext } from './internal/form-field-context';

/**
 * No `asChild`: FormField is a layout wrapper, not a link and has no single child to render as.
 */
export interface FormFieldProps extends ComponentPropsWithRef<'div'> {
  /**
   * Native `required` on the control, plus a visible (`aria-hidden`) marker on
   * `FormFieldLabel` — the native attribute already announces it, so an asterisk read aloud
   * would be noise.
   */
  required?: boolean;
}

/**
 * The accessibility component — Input/Textarea are just styled controls; this is what wires
 * label, description, and error to them by id, via context + `useId`, never by cloning children
 * or asking the consumer to pass matching ids themselves.
 *
 * `invalid` is derived, not a prop: it's true whenever a `FormFieldError` child is present, so a
 * consumer never has to set `invalid` AND separately render the error — rendering the error IS
 * setting invalid. Order of the sub-components doesn't matter for this derivation; `aria-
 * describedby` always lists the error before the description regardless of render order, per
 * EMBR-PHASE-4.md ("the error does NOT replace the description").
 *
 * Compose: `<FormField><FormFieldLabel/><FormFieldDescription/><Input/><FormFieldError/></FormField>`
 */
export function FormField({ required = false, className, children, ...rest }: FormFieldProps) {
  const baseId = useId();
  const controlId = `${baseId}-control`;
  const descriptionId = `${baseId}-description`;
  const errorId = `${baseId}-error`;

  const childArray = Children.toArray(children);
  const hasDescription = childArray.some(
    (child) => isValidElement(child) && child.type === FormFieldDescription,
  );
  const hasError = childArray.some(
    (child) => isValidElement(child) && child.type === FormFieldError,
  );

  const describedByIds: string[] = [];
  if (hasError) describedByIds.push(errorId);
  if (hasDescription) describedByIds.push(descriptionId);

  return (
    <FormFieldContext.Provider
      value={{
        controlId,
        descriptionId,
        errorId,
        describedBy: describedByIds.length ? describedByIds.join(' ') : undefined,
        invalid: hasError,
        required,
      }}
    >
      <div className={cx('flex flex-col gap-2', className)} {...rest}>
        {children}
      </div>
    </FormFieldContext.Provider>
  );
}

export interface FormFieldLabelProps extends ComponentPropsWithRef<'label'> {
  /** Visually hide the label while keeping it in the accessibility tree. @default false */
  srOnly?: boolean;
}

/**
 * Label is mandatory on every FormField — a FormField with no label is a bug, not a variant.
 * `srOnly` is the only sanctioned way to hide it visually; there is no "no label" mode.
 */
export function FormFieldLabel({
  srOnly = false,
  className,
  children,
  ...rest
}: FormFieldLabelProps) {
  const field = useFormFieldContext('FormFieldLabel');
  return (
    <label
      htmlFor={field.controlId}
      className={cx('font-body text-sm font-medium text-ink', srOnly && 'sr-only', className)}
      {...rest}
    >
      {children}
      {field.required && (
        <span aria-hidden="true" className="text-on-danger">
          {' '}
          *
        </span>
      )}
    </label>
  );
}

export function FormFieldDescription({ className, ...rest }: ComponentPropsWithRef<'p'>) {
  const field = useFormFieldContext('FormFieldDescription');
  return (
    <p id={field.descriptionId} className={cx('text-sm text-ink-muted', className)} {...rest} />
  );
}

/**
 * `text-on-danger`, not `text-danger`: status.danger as text fails the 4.5:1 floor in dark
 * (2.89:1 on bg.page, 2.41:1 on bg.surface). status.on-danger clears the floor on both surfaces
 * in both themes (light 6.16–6.49:1, dark 5.92–7.10:1 — measured with `npm run verify:contrast`)
 * and matches the token Badge already uses for the same danger status as text.
 */
export function FormFieldError({ className, ...rest }: ComponentPropsWithRef<'p'>) {
  const field = useFormFieldContext('FormFieldError');
  return (
    <p
      id={field.errorId}
      className={cx(
        'text-sm font-medium text-on-danger transition-[opacity,transform] duration-base ' +
          'ease-out starting:opacity-0 starting:-translate-y-1 motion-reduce:transition-none',
        className,
      )}
      {...rest}
    />
  );
}
