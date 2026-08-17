import type { Meta, StoryObj } from '@storybook/react-vite';

import { tokens, type EmbrToken } from '../../tokens/generated/tokens';

const spaceTokens: EmbrToken[] = Object.values(tokens)
  .filter((token) => token.path[0] === 'space')
  .sort((a, b) => Number(a.path.at(-1)) - Number(b.path.at(-1)));

function Row({ token }: { token: EmbrToken }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-8 shrink-0 font-mono text-sm text-ink-muted">{token.path.at(-1)}</span>
      <div className="h-6 shrink-0 rounded-sm bg-brand" style={{ width: `var(${token.cssVar})` }} />
      <code className="text-sm text-ink-muted">{token.value}</code>
    </div>
  );
}

function Spacing() {
  return (
    <div className="flex min-h-screen flex-col gap-6 bg-page p-6 font-body">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-ink">Spacing</h1>
        <p className="max-w-prose text-ink-muted">
          Nine steps, `space-0` through `space-8`. Tailwind&rsquo;s default spacing scale is unset
          (see ADR 0003), so these are the only `p-*`/`gap-*`/`m-*` values that compile.
        </p>
      </header>
      <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 shadow-sm">
        {spaceTokens.map((token) => (
          <Row key={token.name} token={token} />
        ))}
      </section>
    </div>
  );
}

const meta = {
  title: 'Foundations/Spacing',
  component: Spacing,
  parameters: {
    docs: {
      description: {
        component: 'The spacing scale that backs every `p-*`, `gap-*`, and `m-*` utility.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Spacing>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {};

export const Dark: Story = {
  globals: { theme: 'dark' },
};
