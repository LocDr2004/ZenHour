# Testing Guide - ZenHours

Professional testing documentation following FAANG standards.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [Coverage Requirements](#coverage-requirements)

## Overview

ZenHours uses **Vitest** as the primary testing framework with **React Testing Library** for component testing. This setup provides:

- ⚡ Fast test execution with native ESM support
- 🎯 DOM testing with happy-dom (lightweight jsdom alternative)
- 📊 Built-in coverage reporting
- 🔧 First-class TypeScript support
- 🚀 Vite-native configuration

## Tech Stack

| Tool | Purpose | Version |
|------|---------|---------|
| Vitest | Test Runner & Assertion | ^3.2.4 |
| @testing-library/react | React Component Testing | ^16.3.0 |
| @testing-library/user-event | User Interaction Simulation | ^14.6.1 |
| @testing-library/jest-dom | Custom Jest Matchers | ^6.6.3 |
| happy-dom | DOM Environment | ^17.6.3 |
| @vitest/coverage-v8 | Code Coverage | ^3.2.4 |

## Test Structure

```
src/
├── components/
│   ├── Timer.tsx
│   ├── Timer.test.tsx        # Component tests
│   ├── TaskManager.tsx
│   ├── TaskManager.test.tsx  # Component tests
│   └── ...
├── lib/
│   ├── utils.ts
│   ├── utils.test.ts         # Utility function tests
│   ├── storage.ts
│   └── storage.test.ts       # Storage layer tests
├── types.ts
├── types.test.ts             # Type constant tests
└── test/
    └── setup.ts              # Global test configuration
```

## Running Tests

### Basic Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with UI (experimental)
npm run test:ui
```

### Filtering Tests

```bash
# Run specific test file
npx vitest src/lib/utils.test.ts

# Run tests matching pattern
npx vitest -t "should format"

# Run tests in specific directory
npx vitest src/components/
```

## Writing Tests

### Unit Test Example (utils.test.ts)

```typescript
import { describe, it, expect } from 'vitest';
import { formatDuration } from './utils';

describe('formatDuration', () => {
  it('should format minutes and seconds', () => {
    expect(formatDuration(90)).toBe('1m 30s');
  });

  it('should format hours', () => {
    expect(formatDuration(3600)).toBe('1h 0m');
  });
});
```

### Component Test Example (Timer.test.tsx)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import Timer from './Timer';

describe('Timer', () => {
  it('should start and pause timer', () => {
    render(<Timer {...props} />);
    
    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);
    
    expect(screen.getByRole('button', { name: /pause/i }))
      .toBeInTheDocument();
  });
});
```

### Mocking Modules

```typescript
import { vi } from 'vitest';

// Mock entire module
vi.mock('../lib/storage', () => ({
  storage: {
    addSession: vi.fn(),
    updateTask: vi.fn(),
  },
}));

// Mock timers
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
```

## Best Practices

### ✅ DO

1. **Use descriptive test names**
   ```typescript
   it('should save session when work mode completes', () => {});
   ```

2. **Test behavior, not implementation**
   ```typescript
   // ✅ Good
   expect(screen.getByText(/success/i)).toBeInTheDocument();
   
   // ❌ Avoid
   expect(component.state.status).toBe('success');
   ```

3. **Use beforeEach for setup**
   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
     localStorage.clear();
   });
   ```

4. **Test edge cases**
   - Empty inputs
   - Null/undefined values
   - Boundary conditions

5. **Keep tests independent**
   - No shared state between tests
   - Each test should pass in isolation

### ❌ DON'T

1. Don't test implementation details
2. Don't skip tests in production
3. Don't use `any` type in tests
4. Don't write tests that depend on execution order

## Coverage Requirements

### Thresholds

| Metric | Minimum | Target |
|--------|---------|--------|
| Lines | 70% | 80%+ |
| Branches | 70% | 80%+ |
| Functions | 70% | 80%+ |
| Statements | 70% | 80%+ |

### Generating Coverage Report

```bash
npm run test:coverage
```

Reports are generated in:
- `coverage/index.html` - Interactive HTML report
- `coverage/coverage-final.json` - JSON report for CI/CD

### Excluded from Coverage

- `node_modules/`
- `src/test/` (test utilities)
- `*.d.ts` (type definitions)
- Configuration files

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test:coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Debugging Tests

### VS Code Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Vitest",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["vitest", "run", "--no-threads"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    }
  ]
}
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Test hangs | Check for uncleared intervals/timers |
| False positives | Ensure assertions are awaited |
| Flaky tests | Remove timing dependencies |
| Memory leaks | Cleanup in afterEach |

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Vitest Best Practices](https://vitest.dev/guide/best-practices)

---

*Last updated: 2026*
