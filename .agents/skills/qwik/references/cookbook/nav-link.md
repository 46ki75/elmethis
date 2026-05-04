# Cookbook: NavLink Component

> Source: `packages/docs/src/routes/docs/cookbook/nav-link/index.mdx`

## Overview

An enhanced `<Link>` that applies an `activeClass` when its `href` matches the current URL pathname.

## Implementation

```tsx
import { Slot, component$ } from '@builder.io/qwik';
import { Link, useLocation, type LinkProps } from '@builder.io/qwik-city';

type NavLinkProps = LinkProps & { activeClass?: string };

export const NavLink = component$(({ activeClass, ...props }: NavLinkProps) => {
  const location = useLocation();
  const to = props.href ?? '';
  const current = location.url.pathname;

  // Strip trailing slash for comparison
  const endPos = to !== '/' && to.endsWith('/') ? to.length - 1 : to.length;
  const startPos = to !== '/' && to.startsWith('/') ? to.length - 1 : to.length;

  const isActive =
    current === to ||
    (current.endsWith(to) &&
      (current.charAt(endPos) === '/' || current.charAt(startPos) === '/'));

  return (
    <Link {...props} class={[props.class, isActive && activeClass ? activeClass : '']}>
      <Slot />
    </Link>
  );
});
```

## Usage

```tsx
<NavLink href="/docs" activeClass="text-green-600">Docs</NavLink>
```

## Tailwind note

When using Tailwind, add `important: true` to `tailwind.config.js` and prefix the active class with `!`:

```tsx
<NavLink href="/docs" activeClass="!text-green-600">Docs</NavLink>
```

This ensures the active class overrides other Tailwind utilities.
