import type { Meta, StoryObj } from '@storybook/react-vite';

import { tokens, type EmbrToken } from '../../tokens/generated/tokens';

const radiusTokens: EmbrToken[] = Object.values(tokens).filter(
  (token) => token.path[0] === 'radius',
);

function Sample({ token }: { token: EmbrToken }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="size-8 border-2 border-brand bg-subtle"
        style={{ borderRadius: `var(${token.cssVar})` }}
      />
      <span className="font-mono text-sm text-ink-muted">{token.path.at(-1)}</span>
      <code className="text-xs text-ink-muted">{token.value}</code>
    </div>
  );
}

function Radii() {
  return (
    <div className="flex min-h-screen flex-col gap-6 bg-page p-6 font-body">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-ink">Radii</h1>
        <p className="max-w-prose text-ink-muted">
          Four steps. `full` is a pill sentinel (`9999px`), not a measurement — it is excluded from
          the px→rem conversion the rest of the scale gets.
        </p>
      </header>
      <section className="flex flex-wrap gap-8 rounded-lg border border-border bg-surface p-5 shadow-sm">
        {radiusTokens.map((token) => (
          <Sample key={token.name} token={token} />
        ))}
      </section>
    </div>
  );
}

const meta = {
  title: 'Foundations/Radii',
  component: Radii,
  parameters: {
    docs: {
      description: { component: 'The border-radius scale behind `rounded-*`.' },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Radii>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {};

export const Dark: Story = {
  globals: { theme: 'dark' },
};
