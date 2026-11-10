import { Slot } from '@radix-ui/react-slot';
import type { ComponentPropsWithRef } from 'react';

import { cx } from './internal/cx';

export type EyebrowTone = 'default' | 'inverse';

export interface EyebrowProps extends ComponentPropsWithRef<'p'> {
  /**
   * `inverse` on the inverse surfaces (`bg-inverse`, plum bands): sage-light, 8.34:1 on teal.
   * @default 'default'
   */
  tone?: EyebrowTone;
  /**
   * Render onto a single child element instead of a `<p>` — e.g. a `<span>` inside a link.
   * Keep it out of the heading outline: never an `<h*>`.
   */
  asChild?: boolean;
}

const TONE_CLASSES: Record<EyebrowTone, string> = {
  default: 'text-eyebrow',
  inverse: 'text-label-on-inverse',
};

/**
 * The small uppercase label above a section heading: it names the section, the heading makes the
 * point. Body family, `font.size.eyebrow`, bold, `letterSpacing.eyebrow`. `text-eyebrow` is the
 * colour utility (brand.eyebrow); the size is set through the token directly because Tailwind
 * serves `text-*` for both colour and size and `eyebrow` exists in both namespaces.
 */
const BASE_CLASSES =
  'm-0 font-body font-bold uppercase tracking-eyebrow [font-size:var(--embr-font-size-eyebrow)]';

export function Eyebrow({ tone = 'default', asChild = false, className, ...rest }: EyebrowProps) {
  const Comp = asChild ? Slot : 'p';
  return <Comp className={cx(BASE_CLASSES, TONE_CLASSES[tone], className)} {...rest} />;
}
