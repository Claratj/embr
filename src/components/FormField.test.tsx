import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FormField, FormFieldDescription, FormFieldError, FormFieldLabel } from './FormField';
import { Input } from './Input';

describe('FormField', () => {
  it('focuses the control when its label is clicked', async () => {
    const user = userEvent.setup();
    render(
      <FormField>
        <FormFieldLabel>Study name</FormFieldLabel>
        <Input />
      </FormField>,
    );

    await user.click(screen.getByText('Study name'));

    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('resolves aria-describedby to the rendered description and error nodes, error first', () => {
    render(
      <FormField>
        <FormFieldLabel>Monitor email</FormFieldLabel>
        <FormFieldDescription>Must be the corporate domain.</FormFieldDescription>
        <Input defaultValue="clara@" />
        <FormFieldError>Missing the domain.</FormFieldError>
      </FormField>,
    );

    const input = screen.getByRole('textbox');
    const description = screen.getByText('Must be the corporate domain.');
    const error = screen.getByText('Missing the domain.');

    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBe(`${error.id} ${description.id}`);
  });

  it('only describes by the description id when no error is present', () => {
    render(
      <FormField>
        <FormFieldLabel>Monitor email</FormFieldLabel>
        <FormFieldDescription>Must be the corporate domain.</FormFieldDescription>
        <Input />
      </FormField>,
    );

    const input = screen.getByRole('textbox');
    const description = screen.getByText('Must be the corporate domain.');
    expect(input.getAttribute('aria-describedby')).toBe(description.id);
  });

  it('sets aria-invalid on the control when a FormFieldError is present, and not otherwise', () => {
    const { rerender } = render(
      <FormField>
        <FormFieldLabel>Protocol code</FormFieldLabel>
        <Input defaultValue="EMB-0" />
      </FormField>,
    );
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid', 'true');

    rerender(
      <FormField>
        <FormFieldLabel>Protocol code</FormFieldLabel>
        <Input defaultValue="EMB-0" />
        <FormFieldError>Missing three digits.</FormFieldError>
      </FormField>,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('blocks input when the control is disabled', async () => {
    const user = userEvent.setup();
    render(
      <FormField>
        <FormFieldLabel>Principal investigator</FormFieldLabel>
        <Input disabled defaultValue="Assigned once approved" />
      </FormField>,
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'more text');

    expect(input).toHaveValue('Assigned once approved');
    expect(input).toBeDisabled();
  });

  it('applies the native required attribute and a visible, aria-hidden marker on the label', () => {
    render(
      <FormField required>
        <FormFieldLabel>Site name</FormFieldLabel>
        <Input />
      </FormField>,
    );

    expect(screen.getByRole('textbox')).toBeRequired();
    const marker = screen.getByText('*');
    expect(marker).toHaveAttribute('aria-hidden', 'true');
  });

  it('throws when a sub-component is rendered outside a FormField', () => {
    expect(() => render(<FormFieldLabel>Orphan</FormFieldLabel>)).toThrow(
      /must be rendered inside a <FormField>/,
    );
  });
});
