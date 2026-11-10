import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Checkbox } from './Checkbox';
import { FormField, FormFieldError } from './FormField';

describe('Checkbox', () => {
  it('toggles from its label and reports through onChange (uncontrolled)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox onChange={onChange}>Notify me</Checkbox>);

    await user.click(screen.getByText('Notify me'));

    expect(screen.getByRole('checkbox', { name: 'Notify me' })).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('follows `checked` when controlled', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [checked, setChecked] = useState(false);
      return (
        <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)}>
          Notify me
        </Checkbox>
      );
    }
    render(<Controlled />);
    const box = screen.getByRole('checkbox');

    await user.click(box);
    expect(box).toBeChecked();
    await user.click(box);
    expect(box).not.toBeChecked();
  });

  it('sets the indeterminate DOM property and re-asserts it on the next render', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Checkbox indeterminate>All</Checkbox>);
    const box = screen.getByRole<HTMLInputElement>('checkbox');
    expect(box.indeterminate).toBe(true);

    // The browser clears it on click, without any React render...
    await user.click(box);
    expect(box.indeterminate).toBe(false);

    // ...so the prop, still true, must win again on the next one instead of drifting.
    rerender(<Checkbox indeterminate>All</Checkbox>);
    expect(box.indeterminate).toBe(true);

    rerender(<Checkbox>All</Checkbox>);
    expect(box.indeterminate).toBe(false);
  });

  it('forwards the consumer ref to the input while keeping its own', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Checkbox ref={ref} indeterminate>
        All
      </Checkbox>,
    );
    expect(ref.current).toBe(screen.getByRole('checkbox'));
    expect(ref.current?.indeterminate).toBe(true);
  });

  it('picks up FormField wiring: invalid from the error, required, described by the error', () => {
    render(
      <FormField required>
        <Checkbox>I accept</Checkbox>
        <FormFieldError>Required.</FormFieldError>
      </FormField>,
    );
    const box = screen.getByRole('checkbox', { name: 'I accept' });
    expect(box).toBeRequired();
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toHaveAccessibleDescription('Required.');
  });

  it('submits its value under its name when checked', () => {
    render(
      <form data-testid="form">
        <Checkbox name="sites" value="madrid" defaultChecked>
          Madrid
        </Checkbox>
        <Checkbox name="sites" value="sevilla">
          Sevilla
        </Checkbox>
      </form>,
    );
    const data = new FormData(screen.getByTestId<HTMLFormElement>('form'));
    expect(data.getAll('sites')).toEqual(['madrid']);
  });
});
