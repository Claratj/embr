import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Tag } from './Tag';

const meta = {
  title: 'Components/Tag',
  component: Tag,
  args: { children: 'Filter' },
  parameters: {
    docs: {
      description: {
        component:
          'A clickable filter chip — not a passive label; that role belongs to `Badge`. Tag ' +
          'holds no state of its own: `selected` is controlled by whoever renders it, and the ' +
          'component exposes `aria-pressed` for free because it always renders a real `<button>`.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unselected: Story = { args: { selected: false } };
export const Selected: Story = { args: { selected: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Small: Story = { args: { size: 'sm' } };
export const Medium: Story = { args: { size: 'md' } };

/** `selected` is consumer state — this story owns it locally to demonstrate the toggle. */
function ToggleableTag() {
  const [selected, setSelected] = useState(false);
  return (
    <Tag selected={selected} onClick={() => setSelected((value) => !value)}>
      Filter
    </Tag>
  );
}

export const Toggle: Story = {
  render: () => <ToggleableTag />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tag = canvas.getByRole('button', { name: 'Filter' });

    await expect(tag).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(tag);
    await expect(tag).toHaveAttribute('aria-pressed', 'true');
  },
};

export const Dark: Story = {
  args: { selected: true },
  globals: { theme: 'dark' },
};
