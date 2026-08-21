import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from './Input';

/**
 * Wraps every story in a real `<label>` — nesting associates it with the input implicitly, no
 * `id`/`htmlFor` needed. A placeholder is never a label substitute; every story proves it has a
 * real one.
 */
function Labeled({ label, ...props }: { label: string } & ComponentProps<typeof Input>) {
  return (
    <label className="flex max-w-sm flex-col gap-2 font-body text-sm font-medium text-ink">
      {label}
      <Input {...props} />
    </label>
  );
}

const meta = {
  title: 'Components/Input',
  component: Input,
  render: (args) => <Labeled label="Field label" {...args} />,
  args: { placeholder: 'Type here' },
  parameters: {
    docs: {
      description: {
        component:
          'A single-line text field. No adornments, icons, or prefix/suffix in this session — ' +
          'real features with real layout consequences, not needed yet. No `asChild`: an input ' +
          'is not a link and has no child to render as.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Invalid: Story = { args: { invalid: true, defaultValue: 'EMB-0' } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'Cannot edit' } };
export const InvalidDisabled: Story = {
  name: 'Invalid + Disabled',
  args: { invalid: true, disabled: true, defaultValue: 'EMB-0' },
};
export const Small: Story = { args: { size: 'sm' } };
export const Medium: Story = { args: { size: 'md' } };

export const Dark: Story = {
  args: { defaultValue: 'Fase 3 — oncología' },
  globals: { theme: 'dark' },
};
