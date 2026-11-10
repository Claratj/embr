import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Mark } from './Mark';

describe('Mark', () => {
  it('is hidden from assistive tech without a label', () => {
    const { container } = render(<Mark />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).not.toHaveAttribute('role');
  });

  it('becomes a named image with a label', () => {
    render(<Mark label="Clara Toloba logo" size={120} />);
    const img = screen.getByRole('img', { name: 'Clara Toloba logo' });
    expect(img).toHaveAttribute('width', '120');
  });
});
