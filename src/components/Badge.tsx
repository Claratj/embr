import type { ComponentPropsWithRef } from 'react';

import { cx } from './internal/cx';

export type BadgeStatus = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export type BadgeVariant = 'solid' | 'soft' | 'outline';

/**
 * No `asChild`: Badge is a passive status label rendered as a `<span>`, never the interactive
 * target of a click — that's `Tag`'s job. There's no case where swapping its element for a
 * consumer-supplied one (Slot's purpose) is useful, so the polymorphism CLAUDE.md asks
 * components to consider "where it makes sense" doesn't apply here.
 */
export interface BadgeProps extends ComponentPropsWithRef<'span'> {
  /** Generic status role — no business meaning. Consumers map their own states onto these. */
  status?: BadgeStatus;
  /** @default 'soft' */
  variant?: BadgeVariant;
}

/**
 * Every class below is a literal string, not `` `bg-${status}` `` — Tailwind's scanner only
 * picks up class names it can see whole in source, so a template-built name would silently fail
 * to generate. Three treatments, matching tokens/color.semantic.json's contract exactly:
 * solid pairs the flat `status.<name>` fill with `text-on-brand` (white, already AA on any of
 * them); soft pairs `<name>Subtle` with `on<Name>`; outline is transparent + `<name>Border` +
 * `on<Name>` text, measured against the page — never against the Subtle fill. No variant here
 * stacks Border on top of Subtle; see the token file for why that pair fails contrast.
 */
const STATUS_VARIANT_CLASSES: Record<BadgeVariant, Record<BadgeStatus, string>> = {
  solid: {
    neutral: 'bg-neutral text-on-brand',
    info: 'bg-info text-on-brand',
    success: 'bg-success text-on-brand',
    warning: 'bg-warning text-on-brand',
    danger: 'bg-danger text-on-brand',
  },
  soft: {
    neutral: 'bg-neutral-subtle text-on-neutral',
    info: 'bg-info-subtle text-on-info',
    success: 'bg-success-subtle text-on-success',
    warning: 'bg-warning-subtle text-on-warning',
    danger: 'bg-danger-subtle text-on-danger',
  },
  outline: {
    neutral: 'bg-transparent border border-neutral-border text-on-neutral',
    info: 'bg-transparent border border-info-border text-on-info',
    success: 'bg-transparent border border-success-border text-on-success',
    warning: 'bg-transparent border border-warning-border text-on-warning',
    danger: 'bg-transparent border border-danger-border text-on-danger',
  },
};

/**
 * `px-2 py-1`, not the more usual `px-2.5 py-0.5` — the space scale only defines integer steps
 * (`--spacing-1`…`--spacing-8`), so a `.5` step compiles to no rule at all under this theme's
 * reset `@theme` layer. See tokens/core.json's `space` scale for the full step list.
 */
const BASE_CLASSES =
  'inline-flex items-center gap-1 rounded-full px-2 py-1 font-body text-xs font-medium';

export function Badge({ status = 'neutral', variant = 'soft', className, ...rest }: BadgeProps) {
  return (
    <span
      className={cx(BASE_CLASSES, STATUS_VARIANT_CLASSES[variant][status], className)}
      {...rest}
    />
  );
}
