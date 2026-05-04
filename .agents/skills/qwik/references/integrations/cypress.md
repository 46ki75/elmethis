# Integration: Cypress

> Source: `packages/docs/src/routes/docs/integrations/cypress/index.mdx`

## Installation

```bash
pnpm run qwik add cypress
```

Adds `cypress` and `cypress-ct-qwik`, testing scripts to `package.json`, and Cypress config files.

## Component testing

The [cypress-ct-qwik](https://github.com/qwikifiers/cypress-qwik) community plugin enables isolated component testing:

```tsx
import { mount } from 'cypress/qwik';
import { MyComponent } from './my-component';

it('renders', () => {
  mount(<MyComponent />);
  cy.contains('Hello').should('be.visible');
});
```

## Key points

- For E2E testing, prefer Playwright (official Qwik E2E setup).
- Cypress is well-suited for interactive component testing and visual debugging.
- See [Cypress docs](https://docs.cypress.io) and [cypress-qwik docs](https://github.com/qwikifiers/cypress-qwik) for full API.
