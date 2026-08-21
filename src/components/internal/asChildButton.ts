import { Slot } from '@radix-ui/react-slot';
import type { ComponentPropsWithRef } from 'react';

type NativeButtonType = ComponentPropsWithRef<'button'>['type'];

/**
 * Shared by every component that supports `asChild` on top of a native `<button>` (Button, Tag):
 * picks `Slot` vs `'button'` as the element type, and only defaults `type="button"` on the
 * native path — a native `<button>` defaults to `type="submit"`, a footgun inside a `<form>`,
 * but `asChild`'s target may not be a button at all (an `<a>`, for instance), so `type` isn't
 * applicable there and is left to the consumer.
 */
export function resolveAsChildButton(asChild: boolean, type: NativeButtonType) {
  return {
    Comp: asChild ? Slot : ('button' as const),
    type: asChild ? type : (type ?? 'button'),
  };
}
