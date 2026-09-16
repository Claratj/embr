---
'embr-ui': minor
---

New easing token `motion.easing.default` — CSS's own `ease` curve, `cubic-bezier(0.25, 0.1, 0.25, 1)` — exposed as `--embr-motion-easing-default` and the Tailwind utility `ease-default`. The system had exactly one curve, `motion.easing.out`, so every transition used it regardless of what it was doing; `ease-out` belongs to entrances, exits and press feedback, while a pure colour change wants the gentler `ease`.

Applied to one place only: `Input` and `Textarea` (via the shared `FIELD_BASE_CLASSES`), whose transition is border-colour alone and never mixes in movement. `Button`, `Tag` and `FormFieldError` deliberately stay on `ease-out` — their transitions combine colour with a `scale`/`translate`, and splitting one Tailwind transition utility into two differently-eased properties isn't worth it for a subtle curve change.

`motion.easing.out` is unchanged. Verified by reading computed `transition-timing-function` off each rendered component: `Input`/`Textarea` now report `cubic-bezier(0.25, 0.1, 0.25, 1)`, `Button`/`Tag`/`FormFieldError` still report `cubic-bezier(0.22, 1, 0.36, 1)`.
