import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FormFieldError } from './FormField';
import { Radio, RadioGroup } from './RadioGroup';

function Options() {
  return (
    <>
      <Radio value="a">Alpha</Radio>
      <Radio value="b">Beta</Radio>
    </>
  );
}

describe('RadioGroup', () => {
  it('is a radiogroup named by its legend, and every radio shares one name', () => {
    render(
      <RadioGroup legend="Arm">
        <Options />
      </RadioGroup>,
    );
    screen.getByRole('radiogroup', { name: 'Arm' });
    const names = screen.getAllByRole<HTMLInputElement>('radio').map((radio) => radio.name);
    expect(names[0]).toBeTruthy();
    expect(new Set(names).size).toBe(1);
  });

  it('starts from defaultValue and selects on click (uncontrolled)', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RadioGroup legend="Arm" defaultValue="a" onValueChange={onValueChange}>
        <Options />
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'Alpha' })).toBeChecked();

    await user.click(screen.getByText('Beta'));

    expect(screen.getByRole('radio', { name: 'Beta' })).toBeChecked();
    expect(onValueChange).toHaveBeenCalledWith('b');
  });

  it('only moves when the controlled value changes', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <RadioGroup legend="Arm" value="a" onValueChange={onValueChange}>
        <Options />
      </RadioGroup>,
    );

    await user.click(screen.getByRole('radio', { name: 'Beta' }));
    expect(onValueChange).toHaveBeenCalledWith('b');
    expect(screen.getByRole('radio', { name: 'Alpha' })).toBeChecked();

    rerender(
      <RadioGroup legend="Arm" value="b" onValueChange={onValueChange}>
        <Options />
      </RadioGroup>,
    );
    expect(screen.getByRole('radio', { name: 'Beta' })).toBeChecked();
  });

  it('wires an error child to the group and marks it invalid and required', () => {
    render(
      <RadioGroup legend="Arm" required>
        <Options />
        <FormFieldError>Pick an arm.</FormFieldError>
      </RadioGroup>,
    );
    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(group).toHaveAttribute('aria-required', 'true');
    expect(group).toHaveAccessibleDescription('Pick an arm.');
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeRequired();
  });

  it('fires onBlur only when focus leaves the group', async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    function Form() {
      const [value, setValue] = useState('a');
      return (
        <>
          <RadioGroup legend="Arm" value={value} onValueChange={setValue} onBlur={onBlur}>
            <Options />
          </RadioGroup>
          <button type="button">Next</button>
        </>
      );
    }
    render(<Form />);

    await user.click(screen.getByRole('radio', { name: 'Alpha' }));
    await user.click(screen.getByRole('radio', { name: 'Beta' }));
    expect(onBlur).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('disables every radio through the native fieldset', () => {
    render(
      <RadioGroup legend="Arm" disabled>
        <Options />
      </RadioGroup>,
    );
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled();
  });

  it('throws when a Radio is used outside a RadioGroup', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Radio value="a">Alpha</Radio>)).toThrow(/inside a <RadioGroup>/);
  });
});
