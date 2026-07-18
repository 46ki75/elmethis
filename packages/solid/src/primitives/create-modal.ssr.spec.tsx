import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { createModal } from "./create-modal";

const Harness = () => {
  const { Modal, isOpen } = createModal({ delay: 0 });
  return (
    <>
      <output>{String(isOpen())}</output>
      <Modal>Dialog content</Modal>
    </>
  );
};

describe("[SSR] createModal", () => {
  it("renders closed state and a native dialog shell", () => {
    const html = renderToString(() => <Harness />);

    expect(html).toContain("false");
    expect(html).toContain("<dialog");
    expect(html).toContain("Dialog content");
  });
});
