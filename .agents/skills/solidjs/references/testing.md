# Testing and Verification

Read this reference whenever implementing or reviewing behavior. Prefer the
project's existing setup over replacing its tools.

## Standard Tooling

Current Solid guidance commonly uses:

- Vitest as the test runner.
- `jsdom` for a browser-like test environment.
- `@solidjs/testing-library` to render components and query DOM behavior.
- `@testing-library/user-event` for realistic interactions.
- `@testing-library/jest-dom` for DOM matchers.

Match versions to the project's Solid and Vite setup. Do not install a second
test stack when one already exists.

## Component Tests

Render a function that returns the component:

```tsx
import { render } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

test("increments the counter", async () => {
  const user = userEvent.setup();
  const result = render(() => <Counter />);

  await user.click(result.getByRole("button", { name: /increment/i }));

  expect(result.getByText("1")).toBeInTheDocument();
});
```

Assert user-visible behavior rather than signal internals. Test prop updates
when fixing lost reactivity, and unmount components when cleanup is part of the
contract. Portal content is outside the render container, so query it through
`screen`.

## Reactive and Lifecycle Tests

- Change each relevant reactive source and assert the DOM follows.
- Spy on listener registration and removal when diagnosing cleanup.
- Use fake timers only when necessary and restore them after the test.
- Test keyed list identity when preserving DOM nodes matters.
- Avoid React-only helpers such as `act` patterns unless the installed Solid
  testing utility explicitly requires them.

## Router Tests

Use the Router's supported test or memory-routing setup for the installed
version. Test initial locations, link navigation, dynamic params, search params,
preload behavior, pending states, errors, and redirects. Mock the network or
query boundary, not Solid's reactive primitives.

## SolidStart Tests

Separate concerns where practical:

- Unit-test validation and authorization logic independently.
- Test server functions or route handlers with representative request data.
- Test action success, validation failure, unauthorized access, and duplicate
  submission behavior.
- Verify SSR output and hydration for bugs that only cross that boundary.
- Confirm private server dependencies do not enter client bundles.

Use integration or end-to-end tests when server directives, streaming, forms,
cookies, middleware, or deployment adapters are central to correctness.

## Metadata Tests

Render under `MetaProvider` and assert the effective title and head tags after
initial render and reactive route-data changes. For SolidStart, inspect server
HTML when SSR presence matters; a client-only DOM assertion cannot prove that
crawlers receive the tags.

## Verification Order

1. Run the narrowest affected tests while iterating.
2. Run the project typecheck or TypeScript-aware build.
3. Run lint and the broader test suite when feasible.
4. Run a production SolidStart build for server/client boundary changes.
5. Report commands, outcomes, and anything not verified.
