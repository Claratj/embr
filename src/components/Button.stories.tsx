import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Button', onClick: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'Five treatments over the same shape: solid, outline and ghost on the page; inverse and ' +
          'inverse-solid on the inverse block. `asChild` renders the styling onto a single ' +
          'child (via Radix `Slot`) instead of a `<button>` — for an `<a>` that must look like a ' +
          'button while keeping link semantics.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Solid: Story = { args: { variant: 'solid' } };
export const Outline: Story = { args: { variant: 'outline' } };
export const Ghost: Story = { args: { variant: 'ghost' } };

export const Disabled: Story = {
  args: { variant: 'solid', disabled: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Button' });

    await expect(button).toBeDisabled();

    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Small: Story = {
  args: { size: 'sm' },
  parameters: {
    docs: {
      description: {
        story:
          'Dense desktop contexts only — toolbars, table rows, filter bars. Not for primary ' +
          'touch actions: at 26px tall it clears the WCAG 2.2 SC 2.5.8 minimum (24×24px) by just ' +
          '2px. Its real consumer is the DataGrid toolbar, coming in a later phase.',
      },
    },
  },
};
export const Medium: Story = { args: { size: 'md' } };
export const Large: Story = {
  args: { size: 'lg', children: 'See experience' },
  parameters: {
    docs: { description: { story: 'Hero and closing calls. Never more than one per view.' } },
  },
};

const DownloadIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 4v12M6 11l6 6 6-6M5 20h14" />
  </svg>
);

export const WithIcon: Story = {
  name: 'With icon',
  args: { variant: 'outline', iconRight: <DownloadIcon />, children: 'CV' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The icon is decorative: the accessible name is the label alone.
    await expect(canvas.getByRole('button', { name: 'CV' })).toBeInTheDocument();
  },
};

const onInverse: Story['decorators'] = [
  (Story) => (
    <div className="flex gap-3 bg-inverse p-6">
      <Story />
    </div>
  ),
];

export const Inverse: Story = {
  args: { variant: 'inverse', children: 'LinkedIn' },
  decorators: onInverse,
};
export const InverseSolid: Story = {
  name: 'Inverse solid',
  args: { variant: 'inverse-solid', size: 'lg', children: 'Email me' },
  decorators: onInverse,
};

export const AsChildLink: Story = {
  name: 'asChild (link)',
  args: {
    asChild: true,
    children: <a href="#storybook">Button-styled link</a>,
  },
};

export const Dark: Story = {
  args: { variant: 'solid' },
  globals: { theme: 'dark' },
};
