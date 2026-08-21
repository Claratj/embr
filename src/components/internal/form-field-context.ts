import { createContext, useContext } from 'react';

export interface FormFieldContextValue {
  controlId: string;
  descriptionId: string;
  errorId: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(null);

/**
 * FormFieldLabel/Description/Error only make sense inside a FormField, so a missing context here
 * is a real usage error — thrown, not silently defaulted.
 */
export function useFormFieldContext(componentName: string): FormFieldContextValue {
  const ctx = useContext(FormFieldContext);
  if (!ctx) throw new Error(`<${componentName}> must be rendered inside a <FormField>.`);
  return ctx;
}

/**
 * Input/Textarea call this to pick up ambient FormField wiring when nested inside one. Unlike
 * useFormFieldContext, standalone usage outside any FormField is entirely legitimate for a
 * control, so a missing context returns an empty object instead of throwing.
 */
export function useFormFieldControlContext(): Partial<FormFieldContextValue> {
  return useContext(FormFieldContext) ?? {};
}
