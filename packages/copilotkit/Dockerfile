FROM docker.io/library/node:22.23.2-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends tini ca-certificates \
    && rm -rf /var/lib/apt/lists/*
ENTRYPOINT ["/usr/bin/tini", "--"]

WORKDIR /app
COPY ./dist/package.json /app/package.json
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force
COPY ./dist/*.mjs /app/
ENV ADDRESS=0.0.0.0
ENV COPILOTKIT_CODEX_HOME=/home/node/.codex-copilotkit
USER node
EXPOSE 8080

CMD ["node", "index.mjs"]
