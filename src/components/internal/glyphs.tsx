import type { ComponentPropsWithRef } from 'react';

/**
 * The few glyphs the form controls draw themselves. Inline SVG rather than an icon library: the
 * Icon component (Lucide) is its own roadmap phase, and a checkbox can't wait for it. The path
 * coordinates are geometry inside a 16×16 viewBox, not design values — the rendered size and
 * colour always come from tokens via `className` (`size-*`, `text-*`), and strokes use
 * `currentColor`.
 *
 * All are `aria-hidden`: the state they draw is already exposed by the native control itself.
 */
type GlyphProps = Omit<ComponentPropsWithRef<'svg'>, 'children'>;

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

export function CheckGlyph(props: GlyphProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      {...STROKE}
      strokeWidth={2}
      {...props}
    >
      <path d="M4 8.5 6.75 11.25 12 5.5" />
    </svg>
  );
}

export function DashGlyph(props: GlyphProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      {...STROKE}
      strokeWidth={2}
      {...props}
    >
      <path d="M4.5 8h7" />
    </svg>
  );
}

export function ChevronDownGlyph(props: GlyphProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      {...STROKE}
      strokeWidth={1.5}
      {...props}
    >
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}
