# Client Package Unit Tests

This directory contains comprehensive unit tests for the Perceptacle Client Package, following **Kent C. Dodds' testing methodology and philosophy**.

## Testing Philosophy

Our tests adhere to Kent C. Dodds' core principles:

1. **Test the way software is used** - Focus on user behavior rather than implementation details
2. **Avoid testing implementation details** - Test outcomes, not internal mechanics
3. **Focus on behavior, not structure** - Verify what the software does, not how it does it
4. **Integration over isolation** - Prefer testing components in realistic contexts
5. **Maintainable and clear tests** - Write tests that are easy to understand and update

## Test Infrastructure

### Configuration

- **Test Runner**: Jest 29.7.0
- **Testing Library**: React Testing Library 16.2.0
- **TypeScript Support**: ts-jest 29.2.5
- **Test Environment**: jsdom (simulated browser environment)

### Setup Files

- `jest.config.js` - Jest configuration with TypeScript support and module path mapping
- `src/setupTests.ts` - Global test setup including:
  - @testing-library/jest-dom matchers
  - Window.matchMedia mock
  - IntersectionObserver mock
  - ResizeObserver mock

## Test Coverage

### Utility Functions (100% coverage)
- **cn.ts** (7 tests) - Class name merging utility
  - Conditional class handling
  - Tailwind CSS class merging
  - Edge cases (undefined, null, arrays, objects)

- **helpers.ts** (19 tests) - Helper functions for UI state
  - Status color mapping
  - Priority color mapping
  - Badge variant mapping
  - Case-insensitive handling

### Custom Hooks
- **use-toast.ts** (10 tests, 84% coverage) - Toast notification management
  - Adding/dismissing toasts
  - Toast limit enforcement
  - Toast updates
  - Unique ID generation

- **use-mobile.tsx** (6 tests, 92% coverage) - Responsive breakpoint detection
  - Mobile/desktop detection
  - Breakpoint boundaries
  - Window resize handling

### React Components
- **StatCard.tsx** (11 tests, 100% coverage) - Statistics display card
  - Label and value rendering
  - Progress bar display
  - Edge cases (0%, 100%)
  - Styling verification

- **ThemeToggle.tsx** (10 tests, 100% coverage) - Theme switcher component
  - Dropdown menu interaction
  - Theme selection (Light/Dark/System)
  - Accessibility features
  - User interaction flows

- **App.tsx** (5 tests, 100% coverage) - Main application component
  - Routing integration
  - Provider setup (Theme, QueryClient)
  - Navigation rendering

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Results

```
Test Suites: 7 passed, 7 total
Tests:       60 passed, 60 total
Time:        ~2.5s
```

## Writing New Tests

When adding new tests, follow these guidelines:

### 1. Test User Behavior
```tsx
// ✅ Good - Tests what users see and interact with
it('should display error message when form is invalid', async () => {
  render(<LoginForm />);
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
});

// ❌ Bad - Tests implementation details
it('should set error state to true', () => {
  const { result } = renderHook(() => useForm());
  act(() => result.current.setError(true));
  expect(result.current.error).toBe(true);
});
```

### 2. Use Accessible Queries
Prefer queries that reflect how users interact with the app:
- `getByRole` - Primary choice for most elements
- `getByLabelText` - For form inputs
- `getByText` - For text content
- `getByTestId` - Last resort when other queries don't work

### 3. Test Integration Over Isolation
```tsx
// ✅ Good - Tests component with its dependencies
it('should update theme when dropdown item is clicked', async () => {
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
  // Test full user flow
});

// ❌ Bad - Over-mocked, tests nothing meaningful
it('should call setTheme', () => {
  const mockSetTheme = jest.fn();
  render(<ThemeToggle setTheme={mockSetTheme} />);
  // Component doesn't work this way in real app
});
```

### 4. Make Tests Maintainable
- Use descriptive test names that explain what is being tested
- Avoid brittle selectors (class names, element tags)
- Keep tests focused on one behavior
- Use shared test utilities and helpers

## Test Organization

Tests are co-located with the code they test:
```
src/
  components/
    StatCard/
      StatCard.tsx
      __tests__/
        StatCard.test.tsx
  hooks/
    use-toast.ts
    __tests__/
      use-toast.test.ts
  utils/
    cn.ts
    __tests__/
      cn.test.ts
```

## Mocking Strategy

We minimize mocking to maintain test realism:
- **Module mocks** - Only for external dependencies (wouter, next-themes)
- **Browser APIs** - Mock in setupTests.ts (matchMedia, IntersectionObserver)
- **Component mocks** - Only in integration tests to isolate behavior
- **Avoid mocking** - Internal functions, React hooks, component logic

## Resources

- [Kent C. Dodds' Testing Blog](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Queries Cheatsheet](https://testing-library.com/docs/queries/about)

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Follow the existing test patterns
3. Aim for meaningful coverage, not just high percentages
4. Ensure tests are readable and maintainable
5. Run the full test suite before committing

---

**Remember**: The goal of testing is confidence that your code works correctly, not achieving 100% coverage. Write tests that give you and your team confidence in the codebase.
