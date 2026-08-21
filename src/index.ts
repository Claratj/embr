/**
 * Embr — public entry point.
 *
 * The generated design tokens, plus components — exported from here one module at a time so
 * consumers can tree-shake down to what they actually import.
 *
 * Styles are *not* imported from JavaScript — that would make this module impure and break
 * `sideEffects: false`. Consumers import them explicitly:
 *
 *   @import "tailwindcss";
 *   @import "embr-ui/preset.css";   // tokens + Tailwind theme
 *   // or "embr-ui/styles.css"      // the above, plus Embr's base layer
 */
export { tokens, cssVar } from './tokens/generated/tokens';
export type { EmbrToken, TokenName } from './tokens/generated/tokens';

export { Button } from './components/Button';
export type { ButtonProps, ButtonVariant } from './components/Button';

export { Tag } from './components/Tag';
export type { TagProps } from './components/Tag';

export { Badge } from './components/Badge';
export type { BadgeProps, BadgeStatus, BadgeVariant } from './components/Badge';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './components/Card';
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
} from './components/Card';
