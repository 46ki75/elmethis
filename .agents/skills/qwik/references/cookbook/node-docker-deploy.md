# Cookbook: Deploy with Node using Docker

> Source: `packages/docs/src/routes/docs/cookbook/node-docker-deploy/index.mdx`

## Multi-stage Dockerfile

```dockerfile
ARG NODE_VERSION=18.18.2

# Base
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /usr/src/app

# Deps stage — cached separately
FROM base AS deps
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile

# Build stage
FROM deps AS build
COPY . .
RUN yarn run build

# Final stage — minimal runtime image
FROM base AS final
ENV NODE_ENV=production
ENV ORIGIN=https://example.com   # Must match your deployed URL

USER node
COPY package.json .
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/server ./server

EXPOSE 3000
CMD yarn serve
```

## Build & run

```bash
docker build -t your-image .
docker run -dp 127.0.0.1:3000:3000 your-image
```

## Key points

- `ORIGIN` environment variable must be set to the actual deployed URL — `routeAction$` depends on it.
- Adapt `yarn` / `yarn.lock` references to your package manager (`pnpm`, `npm`, `bun`).
- The `server/` directory is the Node.js adapter output; `dist/` contains the client bundle.
- Port `3000` must match the port in `src/entry.express.tsx` (or your chosen adapter).
