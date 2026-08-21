/**
 * Minimal class-name joiner. Not a public export — components use it internally to combine
 * their own variant classes with a consumer-supplied `className` without pulling in `clsx`
 * for what is, here, string concatenation with falsy filtering.
 */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
