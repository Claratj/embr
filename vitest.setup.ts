import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// React Testing Library's automatic afterEach cleanup only self-registers when it detects Jest's
// globals; explicit here since this project doesn't set `test.globals: true`.
afterEach(() => {
  cleanup();
});
