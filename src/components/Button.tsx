import type { ComponentPropsWithRef } from 'react';

import { resolveAsChildButton } from './internal/asChildButton';
import { cx } from './internal/cx';

export type ButtonVariant = 'solid' | 'outline' | 'ghost';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  /** Visual treatment. @default 'solid' */
  variant?: ButtonVariant;
  /**
   * Render the styling onto a single child element (via Radix `Slot`) instead of a `<button>` —
   * for example an `<a>` that needs to look like a button while keeping its own semantics.
   */
  asChild?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  solid: 'bg-brand text-on-brand hover:bg-brand-strong',
  outline: 'border border-brand text-brand bg-transparent hover:bg-subtle',
  ghost: 'text-ink bg-transparent hover:bg-subtle',
};

/**
 * `disabled:pointer-events-none` keeps the button from ever firing hover/active styles or
 * click handlers once disabled — the same effect `disabled` gives a native `<button>`, made
 * explicit here because `asChild` can put this className onto an element with no such default.
 */
const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 font-body text-sm ' +
  'font-medium transition-colors disabled:pointer-events-none disabled:opacity-50';

/**
 * No `forwardRef` — React 19 accepts `ref` as a regular prop. No size prop: Phase 2 batch 1
 * only asked for variants + states, and one size keeps the token surface (`px-4 py-2`, `text-sm`)
 * unambiguous until a real second size is needed.
 */
export function Button({
  variant = 'solid',
  asChild = false,
  className,
  type,
  ...rest
}: ButtonProps) {
  const { Comp, type: resolvedType } = resolveAsChildButton(asChild, type);

  return (
    <Comp
      className={cx(BASE_CLASSES, VARIANT_CLASSES[variant], className)}
      type={resolvedType}
      {...rest}
    />
  );
}
