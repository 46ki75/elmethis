# Integration: Builder.io Visual CMS

> Source: `packages/docs/src/routes/docs/integrations/builderio/index.mdx`

## Installation

```bash
pnpm run qwik add builder.io
```

Installs `@builder.io/sdk-qwik`, creates a sample component and a catchall route.

## Setup

1. Create a free [Builder.io account](https://builder.io/signup).
2. Add your public API key to `.env`:

   ```bash
   BUILDER_PUBLIC_API_KEY=your_api_key_here
   ```

3. Set the preview URL in Builder.io → Models → Page → `http://localhost:5173/`.

## Register custom Qwik components

```tsx
import { MyFunComponent } from './fun/fun';

export const CUSTOM_COMPONENTS: RegisteredComponent[] = [{
  component: MyFunComponent,
  name: 'MyFunComponent',
  inputs: [{ name: 'text', type: 'string', defaultValue: 'Hello world' }],
}];

export default component$(() => {
  const content = useBuilderContent();
  return <RenderContent customComponents={CUSTOM_COMPONENTS} />;
});
```

## Key points

- Builder.io is a drag-and-drop Visual Headless CMS — non-developers can edit content.
- Custom Qwik components appear in the **Custom Components** tab in the Builder.io editor.
- Use [components-only mode](https://www.builder.io/c/docs/guides/components-only-mode) to restrict editing to your components.
- When deploying to production, update the preview URL in Builder.io to your production domain.
