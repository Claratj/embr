import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { FormFieldDescription, FormFieldError } from './FormField';
import { Radio, RadioGroup } from './RadioGroup';

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  args: { legend: 'Visit type', onValueChange: fn() },
  render: (args) => (
    <RadioGroup {...args}>
      <Radio value="onsite">On site</Radio>
      <Radio value="remote">Remote</Radio>
      <Radio value="phone">Phone call</Radio>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        component:
          'A fieldset of native radios (docs/adr/0007): one tab stop, arrow keys move and select, ' +
          '`name` ties them for form submission. `FormFieldDescription` and `FormFieldError` ' +
          'work as children, wired to the group.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { defaultValue: 'onsite' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('radiogroup', { name: 'Visit type' })).toBeInTheDocument();
    const onsite = canvas.getByRole('radio', { name: 'On site' });
    await expect(onsite).toBeChecked();

    // Native roving focus: Tab lands on the checked radio, arrows move AND select.
    await userEvent.tab();
    await expect(onsite).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    const remote = canvas.getByRole('radio', { name: 'Remote' });
    await expect(remote).toHaveFocus();
    await expect(remote).toBeChecked();
    await expect(args.onValueChange).toHaveBeenLastCalledWith('remote');
  },
};

export const Horizontal: Story = { args: { orientation: 'horizontal' } };

export const WithDescriptionAndError: Story = {
  name: 'Required, with description and error',
  args: { required: true },
  render: (args) => (
    <RadioGroup {...args}>
      <FormFieldError>Choose how the visit will happen.</FormFieldError>
      <Radio value="onsite">On site</Radio>
      <Radio value="remote">Remote</Radio>
      <FormFieldDescription>It decides who receives the reminder.</FormFieldDescription>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const group = within(canvasElement).getByRole('radiogroup', { name: /Visit type/ });
    await expect(group).toHaveAttribute('aria-invalid', 'true');
    await expect(group).toHaveAttribute('aria-required', 'true');
    // Error first, whatever the children order — same rule as FormField.
    await expect(group).toHaveAccessibleDescription(
      'Choose how the visit will happen. It decides who receives the reminder.',
    );
  },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: 'remote' } };

/** The shape a form library binds to: `value` + `onValueChange` + `onBlur` (on leaving the group). */
export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('phone');
    return (
      <div className="flex flex-col gap-3">
        <RadioGroup
          {...args}
          value={value}
          onValueChange={(v) => {
            setValue(v);
            args.onValueChange?.(v);
          }}
        >
          <Radio value="onsite">On site</Radio>
          <Radio value="remote">Remote</Radio>
          <Radio value="phone">Phone call</Radio>
        </RadioGroup>
        <p className="m-0 font-body text-sm text-ink-muted">Value: {value}</p>
      </div>
    );
  },
  args: { onBlur: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('radio', { name: 'Remote' }));
    await expect(canvas.getByText('Value: remote')).toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown}');
    await expect(args.onBlur).not.toHaveBeenCalled();
    await userEvent.tab();
    await expect(args.onBlur).toHaveBeenCalledTimes(1);
  },
};

export const Dark: Story = {
  args: { defaultValue: 'remote', invalid: true },
  globals: { theme: 'dark' },
};
