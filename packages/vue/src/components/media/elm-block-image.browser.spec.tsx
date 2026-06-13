import { render } from "vitest-browser-vue";
import { defineComponent, h } from "vue";
import { describe, expect, test, vi } from "vitest";

import { ElmBlockImage } from "./elm-block-image";

// The lightbox OPEN lifecycle (click image -> useModal.show() ->
// <dialog>.showModal() -> top layer) needs a real browser — happy-dom does not
// implement showModal() nor a real network load/decode(). This drives the
// actual open/close path. Mirrors use-modal / elm-modal browser specs.

// A 1x1 transparent PNG data URI loads (and decode()s) immediately, so
// `isLoading` settles to false in-browser — `handleOpenModal` only opens once
// the image has loaded.
const Harness = defineComponent({
  setup() {
    return () =>
      h(ElmBlockImage, {
        src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        alt: "dot",
      });
  },
});

type Screen = ReturnType<typeof render>;
const root = (screen: Screen) => screen.container as HTMLElement;
const dialogEl = (screen: Screen) => root(screen).querySelector("dialog")!;
const containerEl = (screen: Screen) =>
  root(screen).querySelector('[class*="image-container"]') as HTMLElement;
const innerImg = (screen: Screen) =>
  containerEl(screen).querySelector("img") as HTMLImageElement;

describe("[browser] ElmBlockImage lightbox lifecycle", () => {
  test("dialog mounts closed and out of the top layer", async () => {
    const screen = render(Harness);

    const dialog = dialogEl(screen);
    expect(dialog).toBeTruthy();
    expect(dialog.open).toBe(false);
  });

  // The click target is the `image-container` div (it carries `onClick`), not
  // the 1x1 image itself — a tiny img fails actionability checks.
  test("clicking the loaded image opens the lightbox with an enlarged image, and clicking it closes again", async () => {
    const screen = render(Harness);
    const dialog = dialogEl(screen);

    await vi.waitFor(() => expect(innerImg(screen).complete).toBe(true));

    // `handleOpenModal` only opens once `isLoading` has settled to false (via
    // onLoad/decode). That can lag the image's `complete` flag, so retry the
    // click until the dialog actually opens.
    await vi.waitFor(() => {
      containerEl(screen).click();
      expect(dialog.open).toBe(true);
    });
    await vi.waitFor(() => expect(dialog.className).toMatch(/shown/));
    await vi.waitFor(() => expect(dialog.querySelector("img")).toBeTruthy());

    // The close control lives INSIDE the dialog (the enlarged image's own
    // onClick -> hide); an outside button would be unclickable under the open
    // modal's top layer.
    const enlarged = dialog.querySelector("img")! as HTMLImageElement;
    enlarged.click();

    await vi.waitFor(() => expect(dialog.open).toBe(false));
  });
});
