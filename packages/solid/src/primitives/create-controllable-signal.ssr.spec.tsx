import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { createControllableSignal } from "./create-controllable-signal";

const Uncontrolled = () => {
  const [value] = createControllableSignal({
    defaultValue: () => "default",
  });

  return <span>{value()}</span>;
};

const Controlled = (props: { value: string }) => {
  const [value] = createControllableSignal({
    value: () => props.value,
    defaultValue: () => "ignored",
  });

  return <span>{value()}</span>;
};

describe("[SSR] createControllableSignal", () => {
  it("renders uncontrolled and controlled values server-side", () => {
    expect(renderToString(() => <Uncontrolled />)).toContain(">default</span>");
    expect(renderToString(() => <Controlled value="parent" />)).toContain(
      ">parent</span>",
    );
  });
});
