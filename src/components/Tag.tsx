import type { ComponentPropsWithRef } from 'react';

import { resolveAsChildButton } from './internal/asChildButton';
import { cx } from './internal/cx';

export interface TagProps extends ComponentPropsWithRef<'button'> {
  /** Toggled on/off, like a filter chip. Controlled by the consumer — Tag holds no state. */
  selected?: boolean;
  /** Render onto a single child (via Radix `Slot`) — e.g. a filter chip that's really a link. */
  asChild?: boolean;
}

/**
 * A clickable filter chip, not a passive label — that's Badge's job (`status` roles, no
 * interaction). Tag is always a real `<button>` (or a `Slot` target standing in for one) so it's
 * keyboard-operable and gets `aria-pressed` for free; `selected` never expresses itself in a
 * non-interactive tone like a status color.
 */
const BASE_CLASSES =
  'inline-flex items-center gap-1 rounded-full border px-3 py-1 font-body text-sm font-medium ' +
  'transition-colors disabled:pointer-events-none disabled:opacity-50';

const STATE_CLASSES = {
  unselected: 'border-border bg-page text-ink hover:bg-subtle',
  selected: 'border-transparent bg-brand text-on-brand hover:bg-brand-strong',
};

export function Tag({ selected = false, asChild = false, className, type, ...rest }: TagProps) {
  const { Comp, type: resolvedType } = resolveAsChildButton(asChild, type);

  return (
    <Comp
      aria-pressed={selected}
      className={cx(
        BASE_CLASSES,
        selected ? STATE_CLASSES.selected : STATE_CLASSES.unselected,
        className,
      )}
      type={resolvedType}
      {...rest}
    />
  );
}
