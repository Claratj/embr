import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * Golden rule 2: a visible focus ring on everything interactive, everywhere — see
 * src/css/base.css's `:focus-visible` rule. No component may remove it; they may only restyle it
 * via the `focus.ring` token. `autoFocus` puts the ring on screen without requiring a real Tab
 * press, so the story (and its Chromatic snapshot) shows the actual browser-rendered outline
 * rather than a simulated one.
 */
function Focus() {
  return (
    <div className="flex min-h-screen flex-col gap-6 bg-page p-6 font-body">
      <header className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-ink">Focus ring</h1>
        <p className="max-w-prose text-ink-muted">
          Every interactive element gets this outline on keyboard focus, from a single token
          (`focus.ring`) and a single global rule. The button below is focused on load — tab away
          and back to see it trigger normally.
        </p>
        <p className="max-w-prose text-sm text-ink-muted">
          In dark mode, `focus.ring` measures 4.30:1 against `bg.page` and 3.59:1 against
          `bg.surface` — both clear WCAG 2.4.11&rsquo;s 3:1 floor, but the `bg.surface` case has
          only a 0.59 margin. Any component whose ring sits on a surface (an input inside a card,
          for instance) is close enough to the floor that darkening `bg.surface` even slightly in a
          future phase could fail it silently. If this number changes, re-check it here first.
        </p>
      </header>
      <section className="flex flex-wrap items-center gap-6 rounded-lg border border-border bg-surface p-5 shadow-sm">
        <button
          type="button"
          autoFocus
          className="rounded-md bg-brand px-4 py-2 font-medium text-on-brand"
        >
          Focused button
        </button>
        <a href="#" className="font-medium text-link underline">
          Focused-on-tab link
        </a>
        <input
          type="text"
          placeholder="Focused-on-tab input"
          className="rounded-md border border-border bg-page px-3 py-2 text-ink"
        />
      </section>
    </div>
  );
}

const meta = {
  title: 'Foundations/Focus',
  component: Focus,
  parameters: {
    docs: {
      description: {
        component:
          'The focus ring is not optional per component — it is one global rule, driven by the ' +
          '`focus.ring` token, applied to every focusable element by default.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Focus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ring: Story = {};

export const Dark: Story = {
  globals: { theme: 'dark' },
};
