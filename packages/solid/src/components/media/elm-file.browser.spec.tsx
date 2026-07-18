import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ElmFile } from "./elm-file";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("[Browser] ElmFile", () => {
  it("downloads fetched blobs and revokes object URLs on replacement and unmount", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("first"))
      .mockResolvedValueOnce(new Response("second"));
    const createObjectUrlSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValueOnce("blob:https://example.com/first")
      .mockReturnValueOnce("blob:https://example.com/second");
    const revokeObjectUrlSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined);
    const downloads: Array<{ href: string; name: string }> = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      downloads.push({ href: this.href, name: this.download });
    });
    const [src, setSrc] = createSignal(
      "https://example.com/files/first.txt?token=1",
    );
    const [name, setName] = createSignal<string>();
    const rendered = render(() => <ElmFile src={src()} name={name()} />);
    const download = rendered.container.querySelector<HTMLElement>(
      '[class*="download-icon"]',
    )!;

    fireEvent.click(download);

    await vi.waitFor(() => expect(downloads).toHaveLength(1));
    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      "https://example.com/files/first.txt?token=1",
    );
    expect(createObjectUrlSpy.mock.calls[0]![0]).toBeInstanceOf(Blob);
    expect(downloads[0]).toEqual({
      href: "blob:https://example.com/first",
      name: "first.txt",
    });
    expect(revokeObjectUrlSpy).not.toHaveBeenCalled();

    setSrc("https://example.com/files/second.txt");
    setName("renamed.txt");
    fireEvent.click(download);

    await vi.waitFor(() => expect(downloads).toHaveLength(2));
    expect(downloads[1]).toEqual({
      href: "blob:https://example.com/second",
      name: "renamed.txt",
    });
    expect(revokeObjectUrlSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrlSpy).toHaveBeenNthCalledWith(
      1,
      "blob:https://example.com/first",
    );

    rendered.unmount();

    expect(revokeObjectUrlSpy).toHaveBeenCalledTimes(2);
    expect(revokeObjectUrlSpy).toHaveBeenNthCalledWith(
      2,
      "blob:https://example.com/second",
    );
  });

  it("handles HTTP and network failures without creating an object URL", async () => {
    const error = new TypeError("Network failure");
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockRejectedValueOnce(error);
    const createObjectUrlSpy = vi.spyOn(URL, "createObjectURL");
    const revokeObjectUrlSpy = vi.spyOn(URL, "revokeObjectURL");
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const rendered = render(() => (
      <ElmFile src="https://example.com/files/failure.txt" />
    ));

    fireEvent.click(
      rendered.container.querySelector<HTMLElement>(
        '[class*="download-icon"]',
      )!,
    );

    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "ERROR:",
        expect.objectContaining({ message: "Failed to download file" }),
      );
    });

    fireEvent.click(
      rendered.container.querySelector<HTMLElement>(
        '[class*="download-icon"]',
      )!,
    );

    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("ERROR:", error);
    });
    expect(createObjectUrlSpy).not.toHaveBeenCalled();

    rendered.unmount();

    expect(revokeObjectUrlSpy).not.toHaveBeenCalled();
  });

  it("does not create an object URL when a pending download resolves after unmount", async () => {
    let resolveFetch: ((response: Response) => void) | undefined;
    const responsePromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockReturnValue(responsePromise);
    const blobSpy = vi.spyOn(Response.prototype, "blob");
    const createObjectUrlSpy = vi.spyOn(URL, "createObjectURL");
    const rendered = render(() => (
      <ElmFile src="https://example.com/files/late.txt" />
    ));

    fireEvent.click(
      rendered.container.querySelector<HTMLElement>(
        '[class*="download-icon"]',
      )!,
    );
    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalledOnce());
    rendered.unmount();
    resolveFetch!(new Response("late"));
    await vi.waitFor(() => expect(blobSpy).toHaveBeenCalledOnce());

    expect(createObjectUrlSpy).not.toHaveBeenCalled();
  });
});
