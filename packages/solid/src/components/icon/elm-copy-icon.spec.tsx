import { fireEvent, render } from "@solidjs/testing-library";
import { mdiClipboardCheckOutline, mdiClipboardOutline } from "@mdi/js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ElmCopyIcon } from "./elm-copy-icon";

describe("[CSR] ElmCopyIcon", () => {
  const originalClipboard = Object.getOwnPropertyDescriptor(
    Navigator.prototype,
    "clipboard",
  );
  const writeText = vi.fn();

  beforeEach(() => {
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalClipboard) {
      Object.defineProperty(
        Navigator.prototype,
        "clipboard",
        originalClipboard,
      );
    } else {
      Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it("renders a native non-submitting button and forwards attributes", () => {
    const rendered = render(() => (
      <ElmCopyIcon
        content="hello"
        class="custom-copy"
        style={{ color: "red" }}
        data-testid="copy"
      />
    ));
    const button = rendered.getByRole("button", {
      name: "Copy to clipboard",
    });

    expect(button.tagName).toBe("BUTTON");
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("custom-copy");
    expect(button).toHaveStyle({ color: "red" });
    expect(button.querySelector("path")).toHaveAttribute(
      "d",
      mdiClipboardOutline,
    );
  });

  it("copies, updates its accessible feedback, and composes onClick", async () => {
    const onClick = vi.fn();
    const rendered = render(() => (
      <ElmCopyIcon content="latest" onClick={onClick} />
    ));

    fireEvent.click(
      rendered.getByRole("button", { name: "Copy to clipboard" }),
    );

    await vi.waitFor(() => expect(writeText).toHaveBeenCalledWith("latest"));
    const copied = rendered.getByRole("button", { name: "Copied" });
    expect(copied.querySelector("path")).toHaveAttribute(
      "d",
      mdiClipboardCheckOutline,
    );
    expect(onClick).toHaveBeenCalledOnce();
  });
});
