import { Slot, Slottable } from '@radix-ui/react-slot';
import type { ComponentPropsWithRef, ReactNode } from 'react';

import { cx } from './internal/cx';

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'inverse' | 'inverse-solid';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  /**
   * Visual treatment. `inverse` and `inverse-solid` are for the inverse surfaces only
   * (`bg-inverse`, plum bands): sage-light on the dark fill, with their own focus ring.
   * @default 'solid'
   */
  variant?: ButtonVariant;
  /** `lg` is the hero / closing-call size. @default 'md' */
  size?: ButtonSize;
  /** Decorative glyph before the label: rendered `aria-hidden`, sized to 1em, `currentColor`. */
  iconLeft?: ReactNode;
  /** Decorative glyph after the label (e.g. a download arrow). The label carries the meaning. */
  iconRight?: ReactNode;
  /**
   * Render the styling onto a single child element (via Radix `Slot`) instead of a `<button>` —
   * for example an `<a>` that needs to look like a button while keeping its own semantics.
   */
  asChild?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  solid: 'bg-brand text-on-brand can-hover:hover:bg-brand-strong',
  outline: 'border border-brand-text text-brand-text bg-transparent can-hover:hover:bg-subtle',
  ghost: 'text-ink bg-transparent can-hover:hover:bg-subtle',
  // Plum on teal is 1.35:1, so both inverse variants switch the ring to focus.ringOnInverse.
  inverse:
    'border border-inverse-action text-inverse-action bg-transparent ' +
    'can-hover:hover:bg-inverse-action can-hover:hover:text-on-inverse-action ' +
    'focus-visible:outline-focus-on-inverse',
  'inverse-solid':
    'bg-inverse-action text-on-inverse-action can-hover:hover:bg-inverse-action-hover ' +
    'focus-visible:outline-focus-on-inverse',
};

/** Two sizes, four padding values, all from the integer spacing scale — no `.5` step exists. */
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'gap-1 px-3 py-1 text-xs',
  md: 'gap-2 px-4 py-2 text-sm',
  lg: 'gap-2 px-6 py-3 text-md',
};

/** Icons follow the label's size and colour; `aria-hidden` because the label names the action. */
const ICON_CLASSES = 'inline-flex shrink-0 [&>svg]:size-[1em]';

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
  iconLeft,
  iconRight,
  className,
  type,
  children,
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
    >
      {iconLeft ? (
        <span aria-hidden="true" className={ICON_CLASSES}>
          {iconLeft}
        </span>
      ) : null}
      {/* Slottable: with `asChild`, the child element receives the styling and the icons land
          inside it, around its own children. */}
      <Slottable>{children}</Slottable>
      {iconRight ? (
        <span aria-hidden="true" className={ICON_CLASSES}>
          {iconRight}
        </span>
      ) : null}
    </Comp>
  );
}
