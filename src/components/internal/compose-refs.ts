import { useCallback } from 'react';
import type { Ref, RefCallback } from 'react';

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

/**
 * One callback ref that feeds two refs: a component's own (to reach the DOM node, e.g. to
 * set `indeterminate`, which has no HTML attribute) plus the consumer's `ref` prop. Memoised on
 * the refs themselves, so React doesn't detach and re-attach the node on every render.
 *
 * Hand-rolled rather than importing `@radix-ui/react-compose-refs`: that package only reaches us
 * transitively through react-slot, and depending on a transitive package is depending on an
 * implementation detail of another one.
 */
export function useComposedRefs<T>(a: Ref<T> | undefined, b: Ref<T> | undefined): RefCallback<T> {
  return useCallback(
    (node: T | null) => {
      assignRef(a, node);
      assignRef(b, node);
    },
    [a, b],
  );
}
