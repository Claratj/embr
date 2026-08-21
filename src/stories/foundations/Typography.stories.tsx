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
  const lineHeights = tokensUnder('font', 'lineHeight');
  const letterSpacings = tokensUnder('font', 'letterSpacing');

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-page p-6 font-body">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-ink">Typography</h1>
        <p className="max-w-prose text-ink-muted">
          Two families — Montserrat for headings, Mulish for body copy. Weight and the two
          type-detail scales below are fixed; the size scale isn't — `bodyLg` through `h1` are fluid
          `clamp()` expressions that respond to the viewport, not just the page, copied verbatim
          from MyWeb. `xs` through `4xl` stay fixed pixel steps. Either way, off-scale values do not
          compile.
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
        description="xs → 4xl are fixed steps. eyebrow/caption/body/bodyLg/h4/h3/h2/h1 are MyWeb's fluid scale — resize the viewport to see bodyLg and up respond."
      >
        {sizes.map((token) => (
          <div key={token.name} className="grid grid-cols-[5rem_1fr] items-baseline gap-4">
            <span className="font-mono text-xs text-ink-muted">{token.path.at(-1)}</span>
            <p className="text-ink" style={{ fontSize: `var(${token.cssVar})` }}>
              The quick brown fox
            </p>
          </div>
        ))}
      </Section>

      <Section title="Weight" description="regular / medium / semibold / bold / extrabold.">
        {weights.map((token) => (
          <div key={token.name} className="grid grid-cols-[5rem_1fr] items-baseline gap-4">
            <span className="font-mono text-xs text-ink-muted">{token.path.at(-1)}</span>
            <p className="text-lg text-ink" style={{ fontWeight: `var(${token.cssVar})` }}>
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        ))}
      </Section>

      <Section title="Line height" description="tight / snug / normal.">
        {lineHeights.map((token) => (
          <div key={token.name} className="grid grid-cols-[5rem_1fr] items-baseline gap-4">
            <span className="font-mono text-xs text-ink-muted">{token.path.at(-1)}</span>
            <p className="max-w-sm text-ink" style={{ lineHeight: `var(${token.cssVar})` }}>
              The quick brown fox jumps over the lazy dog near the bank of the river.
            </p>
          </div>
        ))}
      </Section>

      <Section title="Letter spacing" description="eyebrow / tight.">
        {letterSpacings.map((token) => (
          <div key={token.name} className="grid grid-cols-[5rem_1fr] items-baseline gap-4">
            <span className="font-mono text-xs text-ink-muted">{token.path.at(-1)}</span>
            <p className="text-ink" style={{ letterSpacing: `var(${token.cssVar})` }}>
              The quick brown fox
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
        component:
          'The type scale: two families, a fixed weight scale, and a size scale that mixes fixed steps with MyWeb’s fluid clamp() sizes.',
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
