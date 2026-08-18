---
'embr-ui': minor
---

Status color contract: subtle fill, foreground, and border per status role.

Each of `status.neutral`/`info`/`success`/`warning`/`danger` gains three new tokens, additive and
non-breaking — the existing flat `status.<name>` keeps working as the solid/emphasis fill, paired
with `text.onBrand`:

- `status.<name>Subtle` — a soft, low-contrast fill for a subtle badge treatment.
- `status.on<Name>` — the foreground color for text on that fill (also safe as text for an outline
  badge, since it's higher-contrast against the page than it needs to be against the fill).
- `status.<name>Border` — a border color for an outline badge, verified against the page background
  directly, not just the subtle fill.

Every one of the 10 new foreground/fill pairs is ≥4.5:1 (AA text) and every one of the 10 new
border/page pairs is ≥3:1 (WCAG 1.4.11), computed from the actual values, in both light and dark —
re-tuned per theme the same way the rest of the dark palette was. This was the one gap the Phase 1
release flagged as deferred: a single color per status role couldn't support anything but a solid
fill with white text. It now can.

New Tailwind utilities: `bg-{status}-subtle`, `text-on-{status}`, `border-{status}-border` for each
of the five roles, alongside the existing `bg-{status}`/`text-{status}`/`border-{status}`.
