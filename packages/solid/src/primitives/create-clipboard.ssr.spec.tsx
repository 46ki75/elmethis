import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { createClipboard } from "./create-clipboard";

const ClipboardState = () => {
  const clipboard = createClipboard({ content: "server" });
  return <output>{String(clipboard.copied())}</output>;
};

describe("[SSR] createClipboard", () => {
  it("renders deterministic uncopied state without reading browser APIs", () => {
    expect(renderToString(() => <ClipboardState />)).toContain(
      ">false</output>",
    );
  });
});
