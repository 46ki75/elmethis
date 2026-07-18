import { untrack } from "solid-js";
import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { createLocalStorage, createSessionStorage } from "./create-storage";

const StorageState = (props: { area: "local" | "session" }) => {
  const area = untrack(() => props.area);
  const controller =
    area === "local"
      ? createLocalStorage({ key: "ssr", initialValue: "seed" })
      : createSessionStorage({ key: "ssr", initialValue: "seed" });
  return <output>{controller.state()}</output>;
};

describe("[SSR] storage primitives", () => {
  it("render deterministic initial state without reading browser storage", () => {
    expect(renderToString(() => <StorageState area="local" />)).toContain(
      ">seed</output>",
    );
    expect(renderToString(() => <StorageState area="session" />)).toContain(
      ">seed</output>",
    );
  });
});
