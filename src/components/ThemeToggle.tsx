'use client';

import { useEffect, useState, type ComponentPropsWithRef, type MouseEvent } from 'react';

import { cx } from './internal/cx';

export type Theme = 'light' | 'dark';

export interface ThemeToggleProps extends Omit<ComponentPropsWithRef<'button'>, 'onChange'> {
  /** localStorage key for a stored choice. Match it in your pre-paint script. @default 'embr-theme' */
  storageKey?: string;
  /** Accessible names for the two states. */
  labels?: { toDark?: string; toLight?: string };
  /** Called with the new theme after each switch. */
  onChange?: (theme: Theme) => void;
}

const DARK_QUERY = '(prefers-color-scheme: dark)';

const systemTheme = (): Theme => (window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light');

function readStored(key: string): Theme | null {
  try {
    const value = window.localStorage.getItem(key);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null; // storage blocked: behave as if nothing was chosen
  }
}

/** Store only a choice that differs from the device; choosing the device's theme clears it. */
function writeStored(key: string, theme: Theme) {
  try {
    if (theme === systemTheme()) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, theme);
  } catch {
    /* storage blocked: the choice lasts for this page view */
  }
}

/** Reads a motion token at run time, so the JS animation follows tokens/ like the CSS does. */
const cssToken = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/**
 * 40-ish px round (`p-3` around a 16px icon, plus the 1px control hairline). The border is
 * `border.default`, the 3:1 control boundary; hover takes the heading colour.
 */
const BASE_CLASSES =
  'inline-flex shrink-0 items-center justify-center rounded-full border border-border ' +
  'bg-transparent p-3 text-heading transition-[border-color] duration-fast ease-default ' +
  'can-hover:hover:border-heading [&>svg]:size-4';

/**
 * The light/dark switch for Embr's token mode: it writes `data-theme` on `<html>`, which is all
 * the dark theme needs. Until the person picks, it follows the device and its later changes;
 * picking the opposite of the device stores the choice, picking the device's theme clears it.
 * The icon shows the theme you will switch to. With View Transitions and motion allowed, the new
 * theme spreads from the button as a circle (motion.duration.slow, motion.easing.out).
 */
export function ThemeToggle({
  storageKey = 'embr-theme',
  labels,
  onChange,
  className,
  onClick,
  ...rest
}: ThemeToggleProps) {
  // Resolved once, on the first client render: a stored choice wins, otherwise the device.
  // (On the server there is no device to ask, so it renders the light icon.)
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window === 'undefined' ? 'light' : (readStored(storageKey) ?? systemTheme()),
  );

  // Keep the document in step with the state, and follow the device until the person picks.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY);
    const followDevice = () => {
      if (!readStored(storageKey)) setTheme(systemTheme());
    };
    media.addEventListener('change', followDevice);
    return () => media.removeEventListener('change', followDevice);
  }, [storageKey]);

  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      // Set the attribute here, synchronously: the view transition snapshots the DOM right
      // after this callback, before React would re-render and run the effect.
      document.documentElement.setAttribute('data-theme', next);
      writeStored(storageKey, next);
      setTheme(next);
    };

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof document.startViewTransition !== 'function') {
      apply();
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );
      void document.startViewTransition(apply).ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
          },
          {
            duration: parseFloat(cssToken('--embr-motion-duration-slow')),
            easing: cssToken('--embr-motion-easing-out'),
            pseudoElement: '::view-transition-new(root)',
          },
        );
      });
    }

    onChange?.(next);
  };

  const isDark = theme === 'dark';
  const text = { toDark: 'Switch to dark theme', toLight: 'Switch to light theme', ...labels };

  return (
    <button
      type="button"
      className={cx(BASE_CLASSES, className)}
      aria-label={isDark ? text.toLight : text.toDark}
      onClick={toggle}
      {...rest}
    >
      {isDark ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
        </svg>
      )}
    </button>
  );
}
