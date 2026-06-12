import { render } from "vitest-browser-react";
import { describe, expect, test, vi } from "vitest";

import { ElmBlockImage } from "./elm-block-image";

// The lightbox OPEN lifecycle (click image -> `useModal.show()` ->
// `<dialog>.showModal()` -> top layer) needs a real browser — happy-dom does
// not implement `showModal()` nor a real network `onLoad`/`decode()`. This
// real-browser spec drives the actual open/close path. Mirrors the sibling
// `use-modal.browser.spec.tsx` and `elm-modal.browser.spec.tsx`.

// A 1x1 transparent PNG data URI loads (and `decode()`s) immediately, so
// `isLoading` settles to false in-browser — `handleOpenModal` only opens once
// the image has loaded.
const Harness = () => (
  <ElmBlockImage
    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    alt="dot"
  />
);

// Each `render()` appends a fresh subtree to the live document and prior trees
// linger in the same tab, so a bare `document.querySelector` would return a
// stale node. Scope every lookup to the container of the latest render.
type Screen = Awaited<ReturnType<typeof render>>;
const root = (screen: Screen) => screen.container as HTMLElement;
const dialogEl = (screen: Screen) => root(screen).querySelector("dialog")!;
const containerEl = (screen: Screen) =>
  root(screen).querySelector('[class*="image-container"]') as HTMLElement;
const innerImg = (screen: Screen) =>
  containerEl(screen).querySelector("img") as HTMLImageElement;

describe("[CSR] ElmBlockImage lightbox lifecycle", () => {
  test("dialog mounts closed and out of the top layer", async () => {
    const screen = await render(<Harness />);

    const dialog = dialogEl(screen);
    expect(dialog).toBeTruthy();
    expect(dialog.open).toBe(false);
  });

  // The click target is the `image-container` div (it carries `onClick`), not
  // the 1x1 image itself — a tiny img fails actionability/viewport checks, so
  // dispatch the click on the container directly.
  test("clicking the loaded image opens the lightbox with an enlarged image, and clicking it closes again", async () => {
    const screen = await render(<Harness />);
    const dialog = dialogEl(screen);

    // Wait for the image to finish loading so handleOpenModal is unblocked.
    await vi.waitFor(() => expect(innerImg(screen).complete).toBe(true));

    containerEl(screen).click();

    await vi.waitFor(() => expect(dialog.open).toBe(true));
    await vi.waitFor(() => expect(dialog.className).toMatch(/shown/));
    // The enlarged image is rendered inside the dialog only while open.
    await vi.waitFor(() => expect(dialog.querySelector("img")).toBeTruthy());

    // The close control lives INSIDE the dialog (the enlarged image's own
    // onClick -> hide); an outside button would be unclickable under the open
    // modal's top layer.
    const enlarged = dialog.querySelector("img")! as HTMLImageElement;
    enlarged.click();

    await vi.waitFor(() => expect(dialog.open).toBe(false));
  });
});
