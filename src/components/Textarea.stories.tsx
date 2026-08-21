import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Textarea } from './Textarea';

/**
 * Wraps every story in a real `<label>` — nesting associates it with the control implicitly, no
 * `id`/`htmlFor` needed. A placeholder is never a label substitute; every story proves it has a
 * real one.
 */
function Labeled({ label, ...props }: { label: string } & ComponentProps<typeof Textarea>) {
  return (
    <label className="flex max-w-sm flex-col gap-2 font-body text-sm font-medium text-ink">
      {label}
      <Textarea {...props} />
    </label>
  );
}

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  render: (args) => <Labeled label="Field label" {...args} />,
  args: { placeholder: 'Type here' },
  parameters: {
    docs: {
      description: {
        component:
          'Same tokens, same states, same size prop as Input — resize is vertical only, and ' +
          '`rows` defaults to 3.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Invalid: Story = { args: { invalid: true, defaultValue: 'Sin' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'Cannot edit' } };
export const InvalidDisabled: Story = {
  name: 'Invalid + Disabled',
  args: { invalid: true, disabled: true, defaultValue: 'Sin' },
};
export const Small: Story = { args: { size: 'sm' } };
export const Medium: Story = { args: { size: 'md' } };

export const Dark: Story = {
  args: { defaultValue: 'Qué se observó, en una o dos frases' },
  globals: { theme: 'dark' },
};
