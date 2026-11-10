---
'embr-ui': minor
---

New `ThemeToggle` (`'use client'`): the light/dark switch for the token mode. It writes `data-theme` on `<html>`, follows the device until the person picks, stores only a choice that differs from the device (`storageKey`, default `embr-theme`), and spreads the new theme from the button with a View Transition when motion is allowed (`motion.duration.slow`). Labels are configurable.
