## Setup

Two lines, in order (React must already be on the page):

```html
<link rel="stylesheet" href="styles.css">
<script src="_ds_bundle.js"></script>
```

No wrapper/provider is required — none of Embr's 4 shipped components (`Badge`, `Button`, `Card`
+ its `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter` subparts, `Tag`) reads
React context. Mount into your own root node (`<div id="ds-root">`), not the host page's React
tree.

Dark mode is a token flip, not a prop: set `data-theme="dark"` on `<html>` (or any ancestor) and
every component re-resolves the same classes against dark values. There is no `dark:` variant
prefix in this system — never write one.

## Styling idiom — Tailwind utilities, but a closed set

Embr resets every Tailwind namespace to `initial` and re-adds only token-backed keys (see
`src/css/theme.css` in the source repo) — `bg-red-500`, `p-10`, `rounded-xl` etc. **do not exist**
and will silently fail to style. Only use classes from this list (verified present in the shipped
`_ds_bundle.css` — this is a pre-compiled stylesheet, not a live Tailwind build, so a
theoretically-valid-but-unused class will not render just because the token exists):

| Role | Classes |
|---|---|
| Surface bg | `bg-page` `bg-surface` `bg-subtle` `bg-transparent` |
| Text | `text-ink` `text-ink-muted` `text-heading` `text-on-brand` `text-on-{neutral,info,success,warning,danger}` |
| Border | `border-border` `border-brand` `border-transparent` `border-{neutral,info,success,warning,danger}-border` `border-2` |
| Brand | `bg-brand` `text-brand` `text-link` |
| Status fills | `bg-{neutral,info,success,warning,danger}` `bg-{neutral,info,success,warning,danger}-subtle` |
| Radius | `rounded-sm` `rounded-lg` `rounded-full` |
| Shadow | `shadow-sm` `shadow-md` |
| Type family/weight | `font-heading` `font-body` `font-medium` `font-semibold` `font-bold` |
| Type size | `text-xs` `text-sm` `text-lg` `text-xl` `text-2xl` `text-3xl` |
| Spacing (gap/pad) | `gap-1` `gap-2` `gap-3` `gap-4` `gap-6` `gap-8` `p-4` `p-5` `p-6` `pt-0` `px-2` `px-3` `px-4` `py-1` `py-2` |
| Layout | `flex-col` `flex-wrap` `items-center` `items-baseline` `justify-center` `min-w-0` `max-w-sm` `max-w-prose` |
| Motion | `duration-fast` `duration-base` `ease-out` `opacity-disabled` |

Focus rings are automatic (global `:focus-visible` rule using the `--embr-focus-ring` token) —
never add a manual focus-ring class to a component.

For any layout glue beyond this table (a page shell, a grid of cards), stay inside these
namespaces and the 8-step Tailwind default spacing scale is NOT available — only the `gap-*`/`p*`
values listed above compile.

## Where the truth lives

- `styles.css` — the one stylesheet to link; it `@import`s the Google Fonts webfont CSS, then
  `_ds_bundle.css` (all compiled component + utility styles).
- `components/<group>/<Name>/<Name>.prompt.md` — per-component usage doc with real prop tables
  and examples. Read this before composing a component you haven't used yet.
- `components/<group>/<Name>/<Name>.d.ts` — the typed prop contract.

## Example — composing Card, Button, Tag together

```jsx
const { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Button, Tag } =
  window.EmbrUi;

function Example() {
  return (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>A one-line description of what this card represents.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Tag selected>Filter</Tag>
        <Tag>Another filter</Tag>
      </CardContent>
      <CardFooter>
        <Button variant="solid">Confirm</Button>
        <Button variant="ghost">Cancel</Button>
      </CardFooter>
    </Card>
  );
}
```
