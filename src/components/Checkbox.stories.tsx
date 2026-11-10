import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Checkbox } from './Checkbox';
import { FormField, FormFieldDescription, FormFieldError } from './FormField';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { children: 'Email me when a study changes phase', onChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'A native checkbox, painted with tokens (docs/adr/0007). The `children` label wraps the ' +
          'control, so the whole row is the target. Controlled (`checked` + `onChange`) or ' +
          'uncontrolled (`defaultChecked` + `name`); `indeterminate` is always controlled.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const box = within(canvasElement).getByRole('checkbox', {
      name: 'Email me when a study changes phase',
    });
    // Clicking the label text, not the box: the row is the target.
    await userEvent.click(within(canvasElement).getByText('Email me when a study changes phase'));
    await expect(box).toBeChecked();
    await expect(args.onChange).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(' ');
    await expect(box).not.toBeChecked();
  },
};

export const Checked: Story = { args: { defaultChecked: true } };

export const Indeterminate: Story = {
  args: { indeterminate: true },
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole<HTMLInputElement>('checkbox');
    await expect(box.indeterminate).toBe(true);
  },
};

export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = {
  name: 'Disabled + Checked',
  args: { disabled: true, defaultChecked: true },
};

export const LongLabel: Story = {
  args: {
    children:
      'I confirm the participant signed the current version of the informed consent form, and ' +
      'that a copy is filed in the investigator site file.',
  },
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
};

/** Inside a FormField: description and error wire to the box, and the error sets invalid. */
export const InFormField: Story = {
  name: 'In FormField (required, with error)',
  render: (args) => (
    <FormField required className="max-w-sm">
      <FormFieldDescription>You can change this later in settings.</FormFieldDescription>
      <Checkbox {...args}>I accept the data processing terms</Checkbox>
      <FormFieldError>Accept the terms to continue.</FormFieldError>
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox', {
      name: 'I accept the data processing terms',
    });
    await expect(box).toBeRequired();
    await expect(box).toHaveAttribute('aria-invalid', 'true');
    await expect(box).toHaveAccessibleDescription(
      'Accept the terms to continue. You can change this later in settings.',
    );
  },
};

const SITES = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla'];

/**
 * The select-all pattern, and the recommended multiselect for a handful of options: a fieldset of
 * checkboxes, all visible, no dropdown. `indeterminate` is derived from state on every render.
 */
export const SelectAll: Story = {
  name: 'Multiple selection (select all)',
  render: function Render() {
    const [selected, setSelected] = useState<string[]>(['Madrid']);
    const all = selected.length === SITES.length;
    return (
      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="mb-2 p-0 font-body text-sm font-medium text-ink">Sites</legend>
        <Checkbox
          checked={all}
          indeterminate={selected.length > 0 && !all}
          onChange={() => setSelected(all ? [] : SITES)}
        >
          All sites
        </Checkbox>
        <div className="flex flex-col gap-2 pl-5">
          {SITES.map((site) => (
            <Checkbox
              key={site}
              name="sites"
              value={site}
              checked={selected.includes(site)}
              onChange={(e) =>
                setSelected((prev) =>
                  e.target.checked ? [...prev, site] : prev.filter((s) => s !== site),
                )
              }
            >
              {site}
            </Checkbox>
          ))}
        </div>
      </fieldset>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const all = canvas.getByRole<HTMLInputElement>('checkbox', { name: 'All sites' });
    await expect(all.indeterminate).toBe(true);
    await userEvent.click(all);
    await expect(all).toBeChecked();
    await expect(all.indeterminate).toBe(false);
    for (const site of SITES)
      await expect(canvas.getByRole('checkbox', { name: site })).toBeChecked();
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Valencia' }));
    await expect(all.indeterminate).toBe(true);
  },
};

export const Dark: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <Checkbox {...args} />
      <Checkbox defaultChecked>Checked</Checkbox>
      <Checkbox indeterminate>Indeterminate</Checkbox>
      <Checkbox invalid>Invalid</Checkbox>
      <Checkbox disabled>Disabled</Checkbox>
    </div>
  ),
  globals: { theme: 'dark' },
};
