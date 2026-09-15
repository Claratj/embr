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
  solid: 'bg-brand text-on-brand can-hover:hover:bg-brand-strong',
  outline: 'border border-brand text-brand bg-transparent can-hover:hover:bg-subtle',
  ghost: 'text-ink bg-transparent can-hover:hover:bg-subtle',
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
 * The transition lists `scale`, NOT `transform`: Tailwind v4's `scale-*` utility compiles to the
 * standalone `scale:` property, which CSS animates independently of `transform` — listing
 * `transform` here makes the press snap with no easing at all. Measured, not assumed.
 *
 * `motion-reduce:transition-[background-color]` is that list minus `scale`: under reduced motion
 * the colour still fades, only the press becomes instant. `background-color` rather than
 * `transition-colors` because it's the only colour property any variant changes on hover —
 * `outline`'s border and every variant's text colour stay put.
 */
const BASE_CLASSES =
  'inline-flex items-center justify-center rounded-full font-body font-medium ' +
  'transition-[background-color,scale] duration-fast ease-out active:scale-[0.97] ' +
  'motion-reduce:transition-[background-color] disabled:pointer-events-none ' +
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
