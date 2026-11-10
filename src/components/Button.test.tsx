import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Button } from './Button';

const Icon = () => <svg data-testid="icon" />;

describe('Button', () => {
  it('renders icon slots as decorative, around the label', () => {
    render(
      <Button iconLeft={<Icon />} iconRight={<Icon />}>
        Download CV
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Download CV' });
    const icons = screen.getAllByTestId('icon');
    expect(icons).toHaveLength(2);
    for (const icon of icons) expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(button.firstElementChild).toBe(icons[0]?.parentElement);
    expect(button.lastElementChild).toBe(icons[1]?.parentElement);
  });

  it('with asChild, the child receives the styling and the icons land inside it', () => {
    render(
      <Button asChild variant="outline" iconRight={<Icon />}>
        <a href="/cv.pdf">CV</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'CV' });
    expect(link.className).toContain('text-brand-text');
    expect(link).toContainElement(screen.getByTestId('icon'));
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('inverse variants switch the focus ring to the inverse token', () => {
    render(<Button variant="inverse-solid">Email me</Button>);
    expect(screen.getByRole('button').className).toContain(
      'focus-visible:outline-focus-on-inverse',
    );
  });
});
