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
components. Meta entries with matching identifying attributes, such as the
same `name`, can override an earlier entry under provider ownership. Verify the
actual result for canonical and Open Graph tags rather than assuming all tag
types deduplicate identically.

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
- Server and client compute the same initial title, canonical URL, and tags.
- Canonical URLs are absolute and based on trusted configuration or request
  origin, not an unchecked host header.
- User-controlled strings become component props rather than raw head HTML.

## SEO Quality

Metadata should match the rendered page. Include only tags the product needs,
avoid duplicate canonicals, and distinguish `name` metadata from `property`
metadata. Add social image URLs, robots directives, and structured data only
when requirements and safe source data are available.
