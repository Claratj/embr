import { createContext, useContext } from 'react';

export interface RadioGroupContextValue {
  name: string;
  /** Present only when the group is controlled. */
  value: string | undefined;
  defaultValue: string | undefined;
  onValueChange: ((value: string) => void) | undefined;
  required: boolean;
  invalid: boolean;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

/** A Radio outside a RadioGroup has no name and no group semantics — a usage error, thrown. */
export function useRadioGroupContext(): RadioGroupContextValue {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) throw new Error('<Radio> must be rendered inside a <RadioGroup>.');
  return ctx;
}
