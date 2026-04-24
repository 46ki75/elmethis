FROM docker.io/library/node:24-alpine

RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

WORKDIR /app
COPY ./dist/index.mjs /app
EXPOSE 8080

CMD ["node", "index.mjs"]
