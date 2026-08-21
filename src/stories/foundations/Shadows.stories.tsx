import type { Meta, StoryObj } from '@storybook/react-vite';

import { tokens, type EmbrToken } from '../../tokens/generated/tokens';

const shadowTokens: EmbrToken[] = Object.values(tokens).filter(
  (token) => token.path[0] === 'shadow',
);

function Sample({ token }: { token: EmbrToken }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="size-8 rounded-sm bg-surface" style={{ boxShadow: `var(${token.cssVar})` }} />
      <span className="font-mono text-sm text-ink-muted">{token.path.at(-1)}</span>
    </div>
  );
}

function Shadows() {
  return (
    <div className="flex min-h-screen flex-col gap-6 bg-page p-6 font-body">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-ink">Shadows</h1>
        <p className="max-w-prose text-ink-muted">
          Two steps: a 1px hairline for resting elevation, a 12px blur for anything that floats
          above the page (menus, dialogs). The shadow color itself is not re-tuned per theme — a
          dark, translucent tint reads as elevation on a light surface, but is close to invisible
          against a dark one. That&rsquo;s a known limit of a single shadow token per theme, worth
          revisiting if a component genuinely needs a felt shadow in dark mode.
        </p>
      </header>
      <section className="flex flex-wrap gap-8 rounded-lg border border-border bg-page p-5">
        {shadowTokens.map((token) => (
          <Sample key={token.name} token={token} />
        ))}
      </section>
    </div>
  );
}

const meta = {
  title: 'Foundations/Shadows',
  component: Shadows,
  parameters: {
    docs: {
      description: { component: 'The elevation scale behind `shadow-*`.' },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Shadows>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {};

export const Dark: Story = {
  globals: { theme: 'dark' },
};
