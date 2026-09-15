---
'embr-ui': patch
---

Fix the `text.caption` regression left as accepted debt from the Palette D rebase (`silly-pumas-listen`). The new, slightly darker `cream` (`#F7F2F5`) undercut the previous 60% ink alpha — 4.33:1 on `bg.page`, 4.48:1 on `bg.surface`, both under the 4.5:1 floor for placeholder text in Input/Textarea. `inkCaption` moves to 63%: 4.76:1 on `bg.page`, 4.94:1 on `bg.surface`, verified against the compiled CSS with `verify:contrast` — which is now fully green for the first time this session, both themes.
