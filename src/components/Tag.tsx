import type { ComponentPropsWithRef } from 'react';

import { cx } from './internal/cx';

export type TagSize = 'sm' | 'md';

export interface TagProps extends ComponentPropsWithRef<'button'> {
  /** Toggled on/off, like a filter chip. Controlled by the consumer — Tag holds no state. */
  selected?: boolean;
  /** @default 'md' */
  size?: TagSize;
}

/**
 * A clickable filter chip, not a passive label — that's Badge's job (`status` roles, no
 * interaction). Tag is always a real `<button>`, never `asChild`: unlike Button, there's no
 * link-shaped use case for a toggle — a filter chip that navigates isn't a filter chip, it's a
 * link, and Button already owns rendering styling onto an `<a>`. Being a plain `<button>` is what
 * makes it keyboard-operable and gets it `aria-pressed` for free; `selected` never expresses
 * itself in a non-interactive tone like a status color.
 */
const BASE_CLASSES =
  'inline-flex items-center rounded-full border font-body font-medium transition-colors ' +
  'duration-fast ease-out motion-reduce:transition-none disabled:pointer-events-none ' +
  'disabled:opacity-disabled';

/** Two sizes, four padding values, all from the integer spacing scale — no `.5` step exists. */
const SIZE_CLASSES: Record<TagSize, string> = {
  sm: 'gap-1 px-2 py-1 text-xs',
  md: 'gap-1 px-3 py-1 text-sm',
};

const STATE_CLASSES = {
  unselected: 'border-border bg-page text-ink hover:bg-subtle',
  selected: 'border-transparent bg-brand text-on-brand hover:bg-brand-strong',
};

export function Tag({
  selected = false,
  size = 'md',
  className,
  type = 'button',
  ...rest
}: TagProps) {
  return (
    <button
      aria-pressed={selected}
      className={cx(
        BASE_CLASSES,
        SIZE_CLASSES[size],
        selected ? STATE_CLASSES.selected : STATE_CLASSES.unselected,
        className,
      )}
      type={type}
      {...rest}
    />
  );
}
