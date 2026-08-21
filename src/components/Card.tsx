import type { ComponentPropsWithRef } from 'react';

import { cx } from './internal/cx';

export type CardProps = ComponentPropsWithRef<'div'>;
export type CardHeaderProps = ComponentPropsWithRef<'div'>;
export type CardTitleProps = ComponentPropsWithRef<'h3'>;
export type CardDescriptionProps = ComponentPropsWithRef<'p'>;
export type CardContentProps = ComponentPropsWithRef<'div'>;
export type CardFooterProps = ComponentPropsWithRef<'div'>;

/**
 * Card is a static container, not a control: no `onClick`, no hover affordance, no focus ring,
 * and no `asChild` — there's no interactive target to swap in, since Card was never one itself.
 * A card that *acts* like a button (a clickable product tile, say) gets its interactivity from a
 * `Button`/`Slot` placed inside or around it — Card itself never grows an `onClick` prop for that.
 */
export function Card({ className, ...rest }: CardProps) {
  return (
    <div
      className={cx('rounded-lg border border-border bg-surface shadow-sm', className)}
      {...rest}
    />
  );
}

/** `-mb-5` collapses its own bottom padding when a `CardContent` follows, so the pair reads as
 * one `space-5` gap instead of two stacked ones — `CardContent` no longer needs to know what
 * precedes it. */
export function CardHeader({ className, ...rest }: CardHeaderProps) {
  return <div className={cx('flex flex-col gap-1 p-5 -mb-5', className)} {...rest} />;
}

export function CardTitle({ className, ...rest }: CardTitleProps) {
  return (
    <h3 className={cx('font-heading text-lg font-semibold text-heading', className)} {...rest} />
  );
}

export function CardDescription({ className, ...rest }: CardDescriptionProps) {
  return <p className={cx('text-sm text-ink-muted', className)} {...rest} />;
}

/** Standalone-safe: full padding on every side. `CardHeader` collapses the gap between the two
 * with its own negative bottom margin, so a Header+Content pair isn't double-spaced. */
export function CardContent({ className, ...rest }: CardContentProps) {
  return <div className={cx('p-5', className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: CardFooterProps) {
  return <div className={cx('flex items-center gap-3 p-5 pt-0', className)} {...rest} />;
}
