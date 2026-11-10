import { useState } from 'react';
import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { FormField, FormFieldDescription, FormFieldError, FormFieldLabel } from './FormField';
import { Select } from './Select';

const OPTIONS = (
  <>
    <option value="draft">Draft</option>
    <option value="recruiting">Recruiting</option>
    <option value="active">Active</option>
    <option value="closed">Closed</option>
  </>
);

/** Same as Input's stories: a real `<label>` around every control, never a placeholder alone. */
function Labeled({ label, ...props }: { label: string } & ComponentProps<typeof Select>) {
  return (
    <label className="flex max-w-field flex-col gap-2 font-body text-sm font-medium text-ink">
      {label}
      <Select {...props} />
    </label>
  );
}

const meta = {
  title: 'Components/Select',
  component: Select,
  render: (args) => <Labeled label="Status" {...args} />,
  args: { placeholder: 'Choose a status', children: OPTIONS },
  parameters: {
    docs: {
      description: {
        component:
          'A native `<select>` (docs/adr/0007), painted with the same field classes as Input. ' +
          'The open list is the platform’s own — on touch devices that means the OS picker. ' +
          'Single choice only: few options → Checkbox group, many → a future Combobox.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByRole<HTMLSelectElement>('combobox', {
      name: 'Status',
    });
    await expect(select.value).toBe('');
    await userEvent.selectOptions(select, 'active');
    await expect(select.value).toBe('active');
    // The placeholder can't be chosen back.
    await expect(within(select).getByRole('option', { name: 'Choose a status' })).toBeDisabled();
  },
};

export const WithValue: Story = { args: { defaultValue: 'recruiting' } };
export const Invalid: Story = { args: { invalid: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'closed' } };
export const Small: Story = { args: { size: 'sm', defaultValue: 'active' } };
export const Medium: Story = { args: { size: 'md', defaultValue: 'active' } };

export const InFormField: Story = {
  name: 'In FormField (required, with error)',
  render: (args) => (
    <FormField required className="max-w-field">
      <FormFieldLabel>Status</FormFieldLabel>
      <FormFieldDescription>Only active studies send reminders.</FormFieldDescription>
      <Select {...args} />
      <FormFieldError>Choose a status.</FormFieldError>
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByRole('combobox', { name: /Status/ });
    await expect(select).toBeRequired();
    await expect(select).toHaveAttribute('aria-invalid', 'true');
    await expect(select).toHaveAccessibleDescription(
      'Choose a status. Only active studies send reminders.',
    );
  },
};

export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('draft');
    return (
      <div className="flex max-w-field flex-col gap-3">
        <Labeled
          label="Status"
          {...args}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <p className="m-0 font-body text-sm text-ink-muted">Value: {value}</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByRole('combobox', { name: 'Status' }), 'closed');
    await expect(canvas.getByText('Value: closed')).toBeInTheDocument();
  },
};

export const Dark: Story = {
  render: (args) => (
    <div className="flex max-w-field flex-col gap-3">
      <Labeled label="Placeholder" {...args} />
      <Labeled label="With value" {...args} defaultValue="active" />
      <Labeled label="Invalid" {...args} invalid />
      <Labeled label="Disabled" {...args} disabled defaultValue="closed" />
    </div>
  ),
  globals: { theme: 'dark' },
};
