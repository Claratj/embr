import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ThemeToggle } from './ThemeToggle';

const meta = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  args: { storageKey: 'embr-storybook-theme', onChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'The light/dark switch. Embr’s dark mode is a token mode (`data-theme="dark"` on ' +
          '`<html>`); this is the one control that sets it. It follows the device until the ' +
          'person picks, and stores only a choice that differs from the device. To avoid a flash ' +
          'on load, run a pre-paint script that reads the same `storageKey` before your ' +
          'stylesheet.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Switches: Story = {
  name: 'Switches the token mode',
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const root = document.documentElement;
    const before = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = before === 'dark' ? 'light' : 'dark';

    const button = canvas.getByRole('button', {
      name: before === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
    });
    await userEvent.click(button);

    await expect(args.onChange).toHaveBeenCalledWith(next);
    // With View Transitions the switch lands in the transition callback, a frame later.
    await waitFor(() => expect(root.getAttribute('data-theme')).toBe(next));
    await waitFor(() =>
      expect(
        canvas.getByRole('button', {
          name: next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        }),
      ).toBeInTheDocument(),
    );

    // Leave the document as the next story expects it.
    await userEvent.click(canvas.getByRole('button'));
    await waitFor(() => expect(root.getAttribute('data-theme')).toBe(before));
    window.localStorage.removeItem('embr-storybook-theme');
  },
};

export const CustomLabels: Story = {
  args: { labels: { toDark: 'Modo oscuro', toLight: 'Modo claro' } },
};

export const Dark: Story = { globals: { theme: 'dark' } };
