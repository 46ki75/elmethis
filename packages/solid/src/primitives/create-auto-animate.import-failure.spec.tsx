import { render, waitFor } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";

import { createAutoAnimate } from "./create-auto-animate";

vi.mock("@formkit/auto-animate", () => {
  throw new Error("chunk failed to load");
});

describe("[CSR] createAutoAnimate import failure", () => {
  it("degrades gracefully when Auto Animate cannot be loaded", async () => {
    let api!: ReturnType<typeof createAutoAnimate>;

    render(() => {
      api = createAutoAnimate();
      return <div ref={api.ref} />;
    });

    await waitFor(() => expect(api.controller()).toBeUndefined());
  });
});
