import { Slot } from '@radix-ui/react-slot';
import type { ComponentPropsWithRef } from 'react';

import { cx } from './internal/cx';

export type ButtonVariant = 'solid' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  /** Visual treatment. @default 'solid' */
  variant?: ButtonVariant;
  /** @default 'md' */
  size?: ButtonSize;
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

/** Two sizes, four padding values, all from the integer spacing scale — no `.5` step exists. */
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'gap-1 px-3 py-1 text-xs',
  md: 'gap-2 px-4 py-2 text-sm',
};

/**
 * `disabled:pointer-events-none` keeps the button from ever firing hover/active styles or
 * click handlers once disabled — the same effect `disabled` gives a native `<button>`, made
 * explicit here because `asChild` can put this className onto an element with no such default.
 * `motion-reduce:transition-none` respects `prefers-reduced-motion` without needing a JS check.
 */
const BASE_CLASSES =
  'inline-flex items-center justify-center rounded-full font-body font-medium transition-colors ' +
  'duration-fast ease-out motion-reduce:transition-none disabled:pointer-events-none ' +
  'disabled:opacity-disabled';

type NativeButtonType = ComponentPropsWithRef<'button'>['type'];

/** No `forwardRef` — React 19 accepts `ref` as a regular prop. */
export function Button({
  variant = 'solid',
  size = 'md',
  asChild = false,
  className,
  type,
  ...rest
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  // A native `<button>` defaults to `type="submit"` — a footgun inside a `<form>` — so default
  // to `type="button"` only on that path. `asChild`'s target may not be a button at all (an
  // `<a>`, for instance), so `type` isn't applicable there and is left to the consumer.
  const resolvedType: NativeButtonType = asChild ? type : (type ?? 'button');

  return (
    <Comp
      className={cx(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      type={resolvedType}
      {...rest}
    />
  );
}
