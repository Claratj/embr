import type { CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Mark } from './Mark';

const meta = {
  title: 'Components/Mark',
  component: Mark,
  parameters: {
    docs: {
      description: {
        component:
          'Clara Toloba’s monogram as themeable inline SVG. Decorative by default; give it a ' +
          '`label` only when nothing next to it names it. Sizes in use: 46px header, 34px footer, ' +
          'up to 170px as a feature. Below 24px the signature stops reading.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Mark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithWordmark: Story = {
  render: (args) => (
    <a
      href="#top"
      aria-label="Clara Toloba, home"
      className="inline-flex items-center gap-3 text-heading"
    >
      <Mark {...args} />
      <b className="font-heading font-extrabold">Clara Toloba</b>
    </a>
  ),
};

export const Labelled: Story = { args: { size: 120, label: 'Clara Toloba logo' } };

/**
 * On the inverse block the frame takes `brand.decor` (sage) and the signature `brand.labelOnInverse`
 * (sage-light), set through the two custom properties on a parent.
 */
export const OnInverse: Story = {
  args: { size: 120, label: 'Clara Toloba logo' },
  decorators: [
    (Story) => (
      <div
        className="bg-inverse p-6"
        style={
          {
            '--embr-mark-frame': 'var(--embr-brand-decor)',
            '--embr-mark-script': 'var(--embr-brand-label-on-inverse)',
          } as CSSProperties
        }
      >
        <Story />
      </div>
    ),
  ],
};

export const Dark: Story = { globals: { theme: 'dark' } };
