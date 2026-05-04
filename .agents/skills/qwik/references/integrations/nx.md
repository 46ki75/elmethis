# Integration: Nx Monorepos

> Source: `packages/docs/src/routes/docs/integrations/nx/index.mdx`

## Installation

### New workspace

```bash
pnpm dlx create-nx-workspace@latest org-workspace --preset=qwik-nx
```

### Existing workspace

```bash
pnpm install qwik-nx
nx generate qwik-nx:app
```

## Features of `qwik-nx`

- Generate new Nx workspace with a Qwik preset
- Generate Qwik applications and libraries
- Generate Qwik components and routes
- Generate Storybook, React Qwikify, Cloudflare configurations
- Custom executors optimized for Qwik builds

## Key points

- Plugin: [qwik-nx](https://github.com/qwikifiers/qwik-nx)
- Nx handles build orchestration, dependency management, and code sharing.
- Use `nx generate qwik-nx:app` to add more Qwik apps to the monorepo.
- See [qwik-nx docs](https://github.com/qwikifiers/qwik-nx) for generators and executors.
