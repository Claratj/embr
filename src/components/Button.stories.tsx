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
          'Three treatments over the same shape. `asChild` renders the styling onto a single ' +
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
