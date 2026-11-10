import { Children, isValidElement, useId } from 'react';
import type { ComponentPropsWithRef, FocusEvent, ReactNode } from 'react';

import {
  CHOICE_BOX_CLASSES,
  CHOICE_BOX_SLOT_CLASSES,
  CHOICE_INPUT_BASE_CLASSES,
  CHOICE_ROW_CLASSES,
  CHOICE_STATE_CLASSES,
} from './internal/choice-classes';
import { cx } from './internal/cx';
import { FormFieldContext } from './internal/form-field-context';
import { RadioGroupContext, useRadioGroupContext } from './internal/radio-group-context';
import { FormFieldDescription, FormFieldError } from './FormField';

export type RadioGroupOrientation = 'vertical' | 'horizontal';

export interface RadioGroupProps extends Omit<
  ComponentPropsWithRef<'fieldset'>,
  'onChange' | 'defaultValue'
> {
  /** The group's label. Mandatory, like FormFieldLabel: a radio group with no name is a bug. */
  legend: ReactNode;
  /** Visually hide the legend while keeping it as the group's accessible name. @default false */
  legendSrOnly?: boolean;
  /** Shared by every Radio. Generated when omitted; pass one when the form is submitted natively. */
  name?: string;
  /** Controlled selection. Pair with `onValueChange`. */
  value?: string;
  /** Uncontrolled initial selection. */
  defaultValue?: string;
  /** Called with the Radio's `value` when the user selects it. */
  onValueChange?: (value: string) => void;
  /** Native `required` on every Radio, plus a visible (`aria-hidden`) marker on the legend. */
  required?: boolean;
  /**
   * Forces the invalid look. Usually unnecessary: a `FormFieldError` child sets it, the same
   * way it does inside FormField.
   */
  invalid?: boolean;
  /** @default 'vertical' */
  orientation?: RadioGroupOrientation;
}

/**
 * A `<fieldset role="radiogroup">` of native radios (docs/adr/0007). The browser does the hard
 * parts: one tab stop for the group, arrow keys move and select, `name` ties the inputs together
 * for form submission and `required` validation. Native `disabled` on the fieldset disables every
 * Radio in it.
 *
 * `role="radiogroup"` on the fieldset (allowed by ARIA in HTML) is what makes `aria-invalid` and
 * `aria-required` valid here — neither is supported on a plain group or on a single radio.
 *
 * Description and error reuse FormField's sub-components: drop `FormFieldDescription` and
 * `FormFieldError` in as children, in any order. They render below the legend and below the
 * options respectively, and wire `aria-describedby` on the group, error first — the same rules
 * as FormField, so there is one way to describe a control in Embr, not two.
 *
 * `onBlur` fires when focus leaves the group, not on every move between its radios — that is
 * what "touched" means to a form library.
 */
export function RadioGroup({
  legend,
  legendSrOnly = false,
  name,
  value,
  defaultValue,
  onValueChange,
  required = false,
  invalid = false,
  orientation = 'vertical',
  onBlur,
  className,
  children,
  ...rest
}: RadioGroupProps) {
  const baseId = useId();
  const legendId = `${baseId}-legend`;
  const descriptionId = `${baseId}-description`;
  const errorId = `${baseId}-error`;

  const descriptions: ReactNode[] = [];
  const errors: ReactNode[] = [];
  const options: ReactNode[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === FormFieldDescription) descriptions.push(child);
    else if (isValidElement(child) && child.type === FormFieldError) errors.push(child);
    else options.push(child);
  });

  const isInvalid = invalid || errors.length > 0;
  const describedByIds: string[] = [];
  if (errors.length) describedByIds.push(errorId);
  if (descriptions.length) describedByIds.push(descriptionId);

  function handleBlur(event: FocusEvent<HTMLFieldSetElement>) {
    if (event.currentTarget.contains(event.relatedTarget)) return;
    onBlur?.(event);
  }

  return (
    <RadioGroupContext.Provider
      value={{
        name: name ?? `${baseId}-name`,
        value,
        defaultValue,
        onValueChange,
        required,
        invalid: isInvalid,
      }}
    >
      {/* Only FormFieldDescription/Error read this context — Radio deliberately never does. */}
      <FormFieldContext.Provider
        value={{
          controlId: `${baseId}-group`,
          descriptionId,
          errorId,
          describedBy: undefined,
          invalid: isInvalid,
          required,
        }}
      >
        <fieldset
          role="radiogroup"
          aria-labelledby={legendId}
          aria-describedby={describedByIds.length ? describedByIds.join(' ') : undefined}
          aria-invalid={isInvalid || undefined}
          aria-required={required || undefined}
          onBlur={handleBlur}
          className={cx('m-0 flex min-w-0 flex-col gap-2 border-0 p-0', className)}
          {...rest}
        >
          <legend
            id={legendId}
            className={cx(
              'mb-2 p-0 font-body text-sm font-medium text-ink',
              legendSrOnly && 'sr-only',
            )}
          >
            {legend}
            {required && (
              <span aria-hidden="true" className="text-on-danger">
                {' '}
                *
              </span>
            )}
          </legend>
          {descriptions}
          <div
            className={cx(
              'flex',
              orientation === 'vertical' ? 'flex-col gap-2' : 'flex-row flex-wrap gap-x-5 gap-y-2',
            )}
          >
            {options}
          </div>
          {errors}
        </fieldset>
      </FormFieldContext.Provider>
    </RadioGroupContext.Provider>
  );
}

/**
 * `'type'`, `'name'`, `'checked'`, `'defaultChecked'` and `'required'` belong to the group;
 * `'value'` is re-declared as required. `'size'` is the native character width — meaningless.
 */
export interface RadioProps extends Omit<
  ComponentPropsWithRef<'input'>,
  'type' | 'name' | 'value' | 'checked' | 'defaultChecked' | 'required' | 'size' | 'children'
> {
  /** What the group's `value` / `onValueChange` / form submission carry for this option. */
  value: string;
  /** The visible label, beside the circle. */
  children: ReactNode;
}

/**
 * One option of a RadioGroup — throws outside one. Same painted native input as Checkbox, at
 * `rounded-full`, with an `on-brand` dot instead of a tick. Never reads FormField's context: the
 * group is the described, validated control, not each option.
 */
export function Radio({ value, children, className, onChange, ...rest }: RadioProps) {
  const group = useRadioGroupContext();
  const controlled = group.value !== undefined;

  return (
    <label className={cx(CHOICE_ROW_CLASSES, className)}>
      <span className={CHOICE_BOX_SLOT_CLASSES}>
        <span className={CHOICE_BOX_CLASSES}>
          <input
            type="radio"
            name={group.name}
            value={value}
            checked={controlled ? group.value === value : undefined}
            defaultChecked={
              !controlled && group.defaultValue !== undefined
                ? group.defaultValue === value
                : undefined
            }
            required={group.required}
            onChange={(event) => {
              onChange?.(event);
              if (event.currentTarget.checked) group.onValueChange?.(value);
            }}
            className={cx(
              CHOICE_INPUT_BASE_CLASSES,
              'rounded-full',
              group.invalid ? CHOICE_STATE_CLASSES.invalid : CHOICE_STATE_CLASSES.default,
            )}
            {...rest}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 m-auto size-2 rounded-full bg-on-brand opacity-0 peer-checked:opacity-100"
          />
        </span>
      </span>
      <span>{children}</span>
    </label>
  );
}
