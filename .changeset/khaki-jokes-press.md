---
'embr-ui': patch
---

`Button` now responds to being pressed: `active:scale-[0.97]`, eased over `duration-fast` with `ease-out`, matching `Tag`. It was the one interactive primitive with a hover treatment but no press feedback — clicking gave no tactile response before `onClick` fired. Disabled buttons never scale (`disabled:pointer-events-none` keeps `:active` from engaging).

Also fixes the press on `Tag`, which had the same defect since its press feedback was added: **the transition must list `scale`, not `transform`.** Tailwind v4's `scale-*` utility compiles to the standalone `scale:` property, which CSS animates independently of `transform`, so `transition-[…,transform]` left the press snapping to 0.97 with no easing at all. Measured in a real browser by sampling computed `scale` across the press — before: one value (`0.97`, instant); after: a full ease-out ramp (`1 → 0.986 → 0.978 → 0.974 → … → 0.97`) over ~140ms.

Reduced motion is unaffected by this: both components' `motion-reduce:` override is the base list minus `scale`, so the colour fade survives and only the press becomes instant.
