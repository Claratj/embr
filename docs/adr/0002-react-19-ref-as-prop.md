# ADR 0002 — Target React 19, and take `ref` as a regular prop

- **Status:** Accepted
- **Date:** 2026-07-13
- **Phase:** 0 (constrains every component from Phase 2 on)

## Context

React 19 makes `ref` an ordinary prop on function components. `forwardRef` still works, but it is
no longer needed, and the React team has signalled it will be deprecated.

A library that supports React 18 must keep `forwardRef` everywhere. A library that targets React
19 exclusively can drop it — at the cost of excluding React 18 consumers.

## Decision

Declare `peerDependencies: { react: "^19", react-dom: "^19" }` and accept `ref` as a plain prop.
No `forwardRef` anywhere in Embr.

```tsx
// Yes
interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: 'primary' | 'secondary';
}
export function Button({ ref, variant = 'primary', ...props }: ButtonProps) { … }

// No — dead weight on React 19
export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => { … });
```

## Consequences

**Good**

- Every component is a plain function with plain props. No wrapper, no generic gymnastics, no
  `displayName` boilerplate. The public types are what they look like.
- This is a greenfield project with exactly one known consumer (Compass), which is also new. There
  is no React 18 user to strand.

**Costs / caveats**

- Embr cannot be adopted by a React 18 codebase. That is a deliberate trade, and it is encoded in
  `peerDependencies` so npm refuses the install rather than failing mysteriously at runtime.
- If a second consumer ever needs React 18, this is a breaking change and a major version — not a
  patch. The changelog is the contract.
