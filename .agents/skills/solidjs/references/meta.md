# Solid Meta

Read this reference for document-head management with `@solidjs/meta` in plain
Solid applications and SolidStart.

## Provider

Render metadata components under one `MetaProvider` near the application root.
In SolidStart, place it in the shared app/router shell so route components can
contribute metadata during server rendering and client navigation.

```tsx
import { MetaProvider, Meta, Title } from "@solidjs/meta";

export function AppShell(props: { children: unknown }) {
  return (
    <MetaProvider>
      <Title>Acme Catalog</Title>
      <Meta name="description" content="Browse the Acme catalog" />
      {props.children}
    </MetaProvider>
  );
}
```

Do not mutate `document.title` or manually append head nodes when Solid Meta can
manage their ownership, SSR output, updates, and disposal.

## Components

- `<Title>` sets the document title.
- `<Meta>` represents meta elements such as description, charset, viewport,
  robots, and Open Graph fields.
- `<Link>` represents canonical, alternate, preload, stylesheet, and related
  links.
- `<Base>` sets the document base URL and target when genuinely needed.
- `<Style>` adds owned inline styles to the head.
- `useHead` covers head elements without a dedicated component; prefer the
  typed components for ordinary metadata.

Use current exports from `@solidjs/meta`; inspect installed declarations when
working in an older project.

## Defaults and Route Overrides

Define site-wide defaults in the root and more specific metadata in route
components. Only `<Title>` has straightforward latest-active cascading. Do not
assume same-name `<Meta>` or same-rel `<Link>` instances deduplicate; `<Link>` is
non-cascading and every active instance can add an element. Give canonical
links one clear owner and inspect the rendered head when layering defaults and
route metadata.

Derive route metadata from the same reactive data as the visible page:

```tsx
import { Link, Meta, Title } from "@solidjs/meta";

function ProductHead(props: {
  product: { name: string; summary: string; slug: string };
}) {
  const canonical = () => `https://example.com/products/${props.product.slug}`;

  return (
    <>
      <Title>{props.product.name} | Acme</Title>
      <Meta name="description" content={props.product.summary} />
      <Meta property="og:title" content={props.product.name} />
      <Link rel="canonical" href={canonical()} />
    </>
  );
}
```

Keep accessor reads in JSX or reactive functions so navigation and async data
updates refresh the head.

## SSR

Solid Meta is SSR-aware. A custom Solid SSR integration wraps the app in
`MetaProvider` and emits collected assets in the document head through Solid's
SSR asset mechanism. SolidStart normally owns document rendering, so integrate
through its app shell instead of building a second HTML serializer.

Check these SSR concerns:

- The provider exists during server rendering, not only after mount.
- Async data required for metadata resolves under the intended Suspense flow.
- Async data driving SEO-critical tags uses `createAsync` with
  `{ deferStream: true }` when those tags must be present in the initial HTML.
- Server and client compute the same initial title, canonical URL, and tags.
- Canonical URLs are absolute and based on trusted configuration or request
  origin, not an unchecked host header.
- User-controlled strings become component props rather than raw head HTML.

`useHead` requires a stable identity and supports low-level SSR settings such
as closing and escaping behavior. Use it only when a typed component does not
fit. Never disable escaping for untrusted script or structured-data content.

## SEO Quality

Metadata should match the rendered page. Include only tags the product needs,
avoid duplicate canonicals, and distinguish `name` metadata from `property`
metadata. Add social image URLs, robots directives, and structured data only
when requirements and safe source data are available.
