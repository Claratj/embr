---
'embr-ui': major
---

Close the Tailwind namespaces Embr has no tokens for. `preset.css` no longer ships Tailwind's
default values for `max-w-*`/`w-*` named sizes, `blur-*`, `drop-shadow-*`, `inset-shadow-*`,
`text-shadow-*`, `aspect-*` or `perspective-*`; a test compiles the theme and fails if any of
them comes back.

New `size.container` tokens: `max-w-field` (24rem) and `max-w-tooltip` (40ch).

**Migration:** replace `max-w-sm` with `max-w-field` (same 24rem). Other default sizes have no
equivalent on purpose — add a role-named `size.container` token if a layout needs one.
Breakpoints (`sm:`, `md:` …) are unchanged for now.
