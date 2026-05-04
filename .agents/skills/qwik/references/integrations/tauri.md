# Integration: Tauri (Desktop Apps)

> Source: `packages/docs/src/routes/docs/integrations/tauri/index.mdx`

## Overview

Build a desktop application using Qwik as the frontend and Rust as the backend. Tauri bundles your Qwik static build into a native desktop app.

## Prerequisites

Use the **Static Adapter** for the Qwik build:

```bash
pnpm run qwik add static
```

## Install Tauri CLI

```bash
pnpm install @tauri-apps/cli
```

Add to `package.json`:

```json
{ "scripts": { "tauri": "tauri" } }
```

## Scaffold the Rust project

```bash
pnpm run tauri init
```

Answer the prompts:

1. App name — your choice
2. Window title — your choice  
3. Web assets location — `../dist`
4. Dev server URL — `http://localhost:5173`
5. Frontend dev command — `dev`
6. Frontend build command — `build`

## Develop

```bash
pnpm run tauri dev
```

## Key points

- The Qwik app is built as static files (SSG) → Tauri bundles them.
- Tauri's Rust backend can expose commands callable from the Qwik frontend via `@tauri-apps/api`.
- See [tauri.app/v1/guides/getting-started/setup/qwik/](https://tauri.app/v1/guides/getting-started/setup/qwik/) for full guide.
