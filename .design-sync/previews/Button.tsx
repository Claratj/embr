import * as React from 'react';
import * as S from "@ds-stories/src/components/Button.stories";

// The Dark story sets Storybook's per-story `globals: { theme: 'dark' }`, which drives the
// repo's global `withTheme` decorator (.storybook/preview.tsx). Compiled previews don't thread
// per-story globals through decorators (ctx.globals is a static {} — see compose() below), so
// this mirrors that decorator's effect (setting data-theme on the document root, same as the
// token CSS's `:root[data-theme='dark']` selector expects) for this one story only.
function DarkMode({ children }: { children: React.ReactNode }) {
  React.useLayoutEffect(() => {
    document.documentElement.dataset['theme'] = 'dark';
    return () => {
      delete document.documentElement.dataset['theme'];
    };
  }, []);
  return <>{children}</>;
}

function compose(S: any, key: string) {
  const meta: any = S.default ?? {};
  const st: any = S[key];
  const args: any = { ...(meta.args ?? {}), ...(st && st.args ? st.args : {}) };
  // Storybook resolves argTypes.mapping (control value -> real arg) before
  // rendering; mirror that so mapped args don't render raw.
  const at: any = { ...(meta.argTypes ?? {}), ...(st && st.argTypes ? st.argTypes : {}) };
  for (const k of Object.keys(args)) {
    const m = at[k] && at[k].mapping;
    if (m && typeof m === 'object' && args[k] in m) args[k] = m[args[k]];
  }
  const title: string = typeof meta.title === 'string' ? meta.title : '';
  const ctx: any = {
    args, name: key, title, kind: title, id: '', componentId: '',
    globals: {}, viewMode: 'story',
    parameters: (st && st.parameters) ?? meta.parameters ?? {},
  };
  let render: (() => any) | null = null;
  if (st && typeof st.render === 'function') render = () => st.render(args, ctx);
  else if (typeof st === 'function') render = () => st(args, ctx);
  else if (typeof meta.render === 'function') render = () => meta.render(args, ctx);
  else {
    const C = (st && st.component) || meta.component;
    if (C) render = () => React.createElement(C, args);
  }
  if (!render) return () => null;
  // [].concat: a single function is legal CSF decorator shorthand. A
  // decorator returning undefined (stubbed addon) falls through to the inner
  // render — otherwise one unrecognized addon blanks the cell silently.
  const decorators: any[] = ([] as any[]).concat((st && st.decorators) ?? []).concat(meta.decorators ?? []);
  return decorators.reduce((inner: any, dec: any) => () => {
    const out = dec(inner, ctx);
    return out === undefined ? inner() : out;
  }, render);
}

export const Solid = /* Solid */ compose(S, "Solid");
export const Outline = /* Outline */ compose(S, "Outline");
export const Ghost = /* Ghost */ compose(S, "Ghost");
export const Disabled = /* Disabled */ compose(S, "Disabled");
export const Small = /* Small */ compose(S, "Small");
export const Medium = /* Medium */ compose(S, "Medium");
export const AsChildLink = /* asChild (link) */ compose(S, "AsChildLink");
const DarkInner = /* Dark */ compose(S, "Dark");
export const Dark = () => <DarkMode>{DarkInner()}</DarkMode>;
