---
'embr-ui': patch
---

Reduced motion now drops movement instead of every transition. `Button`, `Tag`, `Input`/`Textarea` and `FormFieldError` all guarded `prefers-reduced-motion` with `motion-reduce:transition-none`, which killed the whole transition — including plain colour and opacity fades that carry no motion-sickness risk. A reduced-motion user got an instant, jarring snap everywhere a motion-safe user got a smooth 140–240ms fade.

Two shapes of fix, depending on whether the transition included a `transform`:

- **`Button`, `Input`/`Textarea`** — colour-only transitions, so the guard was pure loss. Removed; the fade now runs under reduced motion too.
- **`Tag`, `FormFieldError`** — these do move (`active:scale-[0.97]` and a `-translate-y-1` entrance). The guard is now a narrower property list that repeats the base transition minus `transform`: `motion-reduce:transition-[background-color,border-color,color]` and `motion-reduce:transition-[opacity]`. Colour/opacity keep easing; the movement becomes instant.

Measured with Playwright against the built Storybook under both `prefers-reduced-motion` states, reading computed `transition-property` off the real rendered components: under `reduce` no component transitions a `transform`, every component still transitions colour or opacity, and motion-safe behaviour is unchanged.
