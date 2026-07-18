import { cp, stat } from "node:fs/promises";

const source = new URL("../src/", import.meta.url);
const destination = new URL("../lib-solid/", import.meta.url);

await cp(source, destination, {
  recursive: true,
  filter: async (file) =>
    (await stat(file)).isDirectory() || file.endsWith(".css"),
});
