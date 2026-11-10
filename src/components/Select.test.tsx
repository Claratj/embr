import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FormField, FormFieldError, FormFieldLabel } from './FormField';
import { Select } from './Select';

const OPTIONS = (
  <>
    <option value="draft">Draft</option>
    <option value="active">Active</option>
  </>
);

describe('Select', () => {
  it('shows the placeholder first, disabled, when nothing is chosen', () => {
    render(
      <Select aria-label="Status" placeholder="Choose">
        {OPTIONS}
      </Select>,
    );
    const select = screen.getByRole<HTMLSelectElement>('combobox');
    expect(select.value).toBe('');
    expect(screen.getByRole('option', { name: 'Choose' })).toBeDisabled();
  });

  it('respects defaultValue over the placeholder', () => {
    render(
      <Select aria-label="Status" placeholder="Choose" defaultValue="active">
        {OPTIONS}
      </Select>,
    );
    expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('active');
  });

  it('reports changes through onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select aria-label="Status" onChange={onChange}>
        {OPTIONS}
      </Select>,
    );
    await user.selectOptions(screen.getByRole('combobox'), 'active');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('picks up FormField wiring', () => {
    render(
      <FormField required>
        <FormFieldLabel>Status</FormFieldLabel>
        <Select>{OPTIONS}</Select>
        <FormFieldError>Choose one.</FormFieldError>
      </FormField>,
    );
    const select = screen.getByRole('combobox', { name: /Status/ });
    expect(select).toBeRequired();
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAccessibleDescription('Choose one.');
  });

  it('puts className on the root wrapper, not the select', () => {
    const { container } = render(
      <Select aria-label="Status" className="max-w-sm">
        {OPTIONS}
      </Select>,
    );
    expect(container.firstElementChild).toHaveClass('max-w-sm');
    expect(screen.getByRole('combobox')).not.toHaveClass('max-w-sm');
  });
});
