import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { tokens, type EmbrToken } from '../../tokens/generated/tokens';

const tokensUnder = (...pathPrefix: string[]): EmbrToken[] =>
  Object.values(tokens).filter((token) =>
    pathPrefix.every((segment, i) => token.path[i] === segment),
  );

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm">
      <header className="flex flex-col gap-1">
        <h2 className="font-heading text-xl font-semibold text-ink">{title}</h2>
        <p className="max-w-prose text-sm text-ink-muted">{description}</p>
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function TokenLabel({ token }: { token: EmbrToken }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-medium text-ink">{token.name}</span>
      <code className="text-sm text-ink-muted">{String(token.value)}</code>
    </div>
  );
}

function Typography() {
  const families = tokensUnder('font', 'family');
  const sizes = tokensUnder('font', 'size');
  const weights = tokensUnder('font', 'weight');

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-page p-6 font-body">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-ink">Typography</h1>
        <p className="max-w-prose text-ink-muted">
          Two families — Montserrat for headings, Mulish for body copy — plus a fixed size and
          weight scale. There is no in-between size or weight: components pick from these.
        </p>
      </header>

      <Section title="Family" description="The two typefaces Embr ships. Nothing else compiles.">
        {families.map((token) => (
          <div key={token.name}>
            <TokenLabel token={token} />
            <p className="mt-1 text-2xl text-ink" style={{ fontFamily: `var(${token.cssVar})` }}>
              Aa Embr — the quick brown fox jumps over the lazy dog
            </p>
          </div>
        ))}
      </Section>

      <Section
        title="Size scale"
        description="xs → 4xl. Every step is a token; off-scale sizes do not compile."
      >
        {sizes.map((token) => (
          <div key={token.name} className="grid grid-cols-[3rem_1fr] items-baseline gap-4">
            <span className="font-mono text-xs text-ink-muted">{token.path.at(-1)}</span>
            <p className="text-ink" style={{ fontSize: `var(${token.cssVar})` }}>
              The quick brown fox
            </p>
          </div>
        ))}
      </Section>

      <Section title="Weight" description="regular / medium / semibold / bold.">
        {weights.map((token) => (
          <div key={token.name} className="grid grid-cols-[5rem_1fr] items-baseline gap-4">
            <span className="font-mono text-xs text-ink-muted">{token.path.at(-1)}</span>
            <p className="text-lg text-ink" style={{ fontWeight: `var(${token.cssVar})` }}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        ))}
      </Section>
    </div>
  );
}

const meta = {
  title: 'Foundations/Typography',
  component: Typography,
  parameters: {
    docs: {
      description: {
        component: 'The type scale: two families, a fixed size scale, and a fixed weight scale.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {};

export const Dark: Story = {
  globals: { theme: 'dark' },
};
