---
'embr-ui': patch
---

`FormFieldError`'s entrance slide now actually animates. It declared `transition-[opacity,transform]` alongside a `@starting-style` `-translate-y-1`, but Tailwind v4's `translate-*` utility compiles to the standalone `translate:` property, which CSS animates independently of `transform` — so the movement was never transitioned and the error text simply appeared at its final position while only the opacity faded. The list is now `transition-[opacity,translate]`.

Third and last instance of the same trap, after `scale` on `Button` and `Tag` in the previous release note. Measured by mounting the real class string and sampling computed `translate` across the entrance: before, a single value (`none`); after, a full ease-out ramp from `-4px` to `0`.

Reduced motion is unchanged and still correct: `motion-reduce:transition-[opacity]` is the list minus `translate`, so under `prefers-reduced-motion: reduce` the error fades in without travelling — verified in the same measurement.
