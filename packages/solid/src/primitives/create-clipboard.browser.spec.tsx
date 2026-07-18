import { render } from "@solidjs/testing-library";
import { page } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";

import { createClipboard } from "./create-clipboard";

const TEXT = "elmethis-solid-clipboard";

const TextHarness = () => {
  const clipboard = createClipboard({ content: TEXT });
  return (
    <div>
      <output data-testid="copied">{String(clipboard.copied())}</output>
      <button type="button" onClick={() => void clipboard.copy()}>
        Copy text
      </button>
    </div>
  );
};

const RichHarness = () => {
  const clipboard = createClipboard({
    content: [{ "text/plain": new Blob(["rich clipboard text"]) }],
  });
  return (
    <button type="button" onClick={() => void clipboard.copy()}>
      Copy rich
    </button>
  );
};

describe("[Browser] createClipboard", () => {
  it("uses Chromium's Clipboard API and reports successful state", async () => {
    const writeText = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);
    const rendered = render(() => <TextHarness />);
    const screen = page.elementLocator(rendered.baseElement);

    await screen.getByRole("button", { name: "Copy text" }).click();

    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalledWith(TEXT);
      expect(rendered.getByTestId("copied")).toHaveTextContent("true");
    });
  });

  it("constructs Chromium ClipboardItems for compatible records", async () => {
    const write = vi
      .spyOn(navigator.clipboard, "write")
      .mockResolvedValue(undefined);
    const rendered = render(() => <RichHarness />);
    const screen = page.elementLocator(rendered.baseElement);

    await screen.getByRole("button", { name: "Copy rich" }).click();

    await vi.waitFor(() => expect(write).toHaveBeenCalledOnce());
    const writtenItems = write.mock.calls[0]?.[0];
    expect(writtenItems).toHaveLength(1);
    expect(writtenItems?.[0]).toBeInstanceOf(ClipboardItem);
    expect(writtenItems?.[0]?.types).toContain("text/plain");
  });
});
