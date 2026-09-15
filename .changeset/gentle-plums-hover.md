---
'embr-ui': patch
---

Gate `Button` and `Tag`'s `hover:bg-*` classes behind a new `can-hover:` variant (`@media (hover: hover) and (pointer: fine)`). Plain `hover:` fires on tap on touch devices with no pointer move to clear it, so a tapped button or tag could stay visually stuck in its hover color until the user tapped elsewhere. Mouse-hover behavior on desktop is unchanged.

`can-hover` is a new, reusable `@custom-variant` in `src/css/theme.css` — any future component that adds a hover treatment should stack it the same way (`can-hover:hover:...`).
