import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge, type BadgeStatus, type BadgeVariant } from './Badge';

const STATUSES: BadgeStatus[] = ['neutral', 'info', 'success', 'warning', 'danger'];

function Row({ variant }: { variant: BadgeVariant }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {STATUSES.map((status) => (
        <Badge key={status} status={status} variant={variant}>
          {status}
        </Badge>
      ))}
    </div>
  );
}

function AllVariants() {
  return (
    <div className="flex flex-col gap-6 bg-page p-6 font-body">
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold text-ink">Solid</h2>
        <Row variant="solid" />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold text-ink">Soft</h2>
        <Row variant="soft" />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold text-ink">Outline</h2>
        <Row variant="outline" />
      </section>
    </div>
  );
}

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    docs: {
      description: {
        component:
          'Generic status roles (neutral/info/success/warning/danger) — no business meaning. A ' +
          'consuming app maps its own states onto these. Three treatments: solid (fill + ' +
          '`text-on-brand`), soft (`*Subtle` fill + `on*` text), outline (transparent + ' +
          '`*Border` + `on*` text, measured against the page — never stacked on the Subtle fill).',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Solid: Story = { args: { variant: 'solid', status: 'info', children: 'Info' } };
export const Soft: Story = { args: { variant: 'soft', status: 'info', children: 'Info' } };
export const Outline: Story = { args: { variant: 'outline', status: 'info', children: 'Info' } };

export const AllStatuses: Story = {
  render: () => <AllVariants />,
};

export const Dark: Story = {
  render: () => <AllVariants />,
  globals: { theme: 'dark' },
};
