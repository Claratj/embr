import type { Meta, StoryObj } from '@storybook/react-vite';

import { Eyebrow } from './Eyebrow';

const meta = {
  title: 'Components/Eyebrow',
  component: Eyebrow,
  args: { children: 'Experience' },
  parameters: {
    docs: {
      description: {
        component:
          'The label above a section heading: it names the section, the heading makes the point. ' +
          'One per section, two or three words, no closing punctuation. Plum in light (13.2:1 on ' +
          'the page), light orange in dark; `tone="inverse"` is sage-light for the inverse block.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="flex flex-col gap-2 p-6">
        <Story />
        <h2 className="m-0 font-heading text-h2 text-heading">Where design and code had to meet</h2>
      </div>
    ),
  ],
} satisfies Meta<typeof Eyebrow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Inverse: Story = {
  args: { tone: 'inverse', children: 'Approach' },
  decorators: [
    (Story) => (
      <div className="bg-inverse p-6">
        <Story />
      </div>
    ),
  ],
};

export const AsChild: Story = {
  name: 'asChild (span)',
  args: { asChild: true, children: <span>Inside the system</span> },
};

export const Dark: Story = { globals: { theme: 'dark' } };
