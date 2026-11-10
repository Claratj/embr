import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ThemeToggle } from './ThemeToggle';

/** jsdom has no matchMedia; this stub answers the two queries ThemeToggle asks. */
function mockMedia({ dark = false, reduce = true } = {}) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes('prefers-color-scheme: dark')
        ? dark
        : query.includes('reduced-motion')
          ? reduce
          : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    window.localStorage.clear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('follows the device on mount when nothing is stored', () => {
    mockMedia({ dark: true });
    render(<ThemeToggle />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toBeInTheDocument();
  });

  it('a stored choice wins over the device', () => {
    mockMedia({ dark: true });
    window.localStorage.setItem('embr-theme', 'light');
    render(<ThemeToggle />);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('stores only a choice that differs from the device, and clears it when it matches again', async () => {
    mockMedia({ dark: false });
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ThemeToggle onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(window.localStorage.getItem('embr-theme')).toBe('dark');
    expect(onChange).toHaveBeenLastCalledWith('dark');

    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(window.localStorage.getItem('embr-theme')).toBeNull();
  });

  it('respects a custom storage key and labels', async () => {
    mockMedia({ dark: false });
    const user = userEvent.setup();
    render(
      <ThemeToggle storageKey="acme" labels={{ toDark: 'Modo oscuro', toLight: 'Modo claro' }} />,
    );
    await user.click(screen.getByRole('button', { name: 'Modo oscuro' }));
    expect(window.localStorage.getItem('acme')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Modo claro' })).toBeInTheDocument();
  });
});
