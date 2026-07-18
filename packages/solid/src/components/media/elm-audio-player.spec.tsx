import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { ElmAudioPlayer } from "./elm-audio-player";

const SRC = "https://example.com/audio/midnight-reverie.mp3";

describe("[CSR] ElmAudioPlayer", () => {
  it("renders the hidden native audio and accessible controls", () => {
    const rendered = render(() => (
      <ElmAudioPlayer
        src={SRC}
        loop
        autoPlay
        class="custom-player"
        data-testid="player"
      />
    ));
    const root = rendered.getByTestId("player");
    const audio = root.querySelector("audio")!;
    const seek = rendered.getByRole("slider", { name: "Seek" });

    expect(root).toHaveClass("custom-player");
    expect(audio).toHaveAttribute("src", SRC);
    expect(audio).toHaveAttribute("loop");
    expect(audio).toHaveAttribute("autoplay");
    expect(audio.className).toMatch(/native-audio/);
    expect(rendered.getByRole("button", { name: "Play" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(seek).toHaveAttribute("tabindex", "0");
    expect(seek).toHaveAttribute("aria-valuetext", "0:00 of 0:00");
    expect(rendered.getByRole("slider", { name: "Volume" })).toHaveAttribute(
      "max",
      "1",
    );
    expect(root.style.getPropertyValue("--elmethis-scoped-progress")).toBe("0");
  });

  it("renders explicit metadata and derives a decoded filename reactively", () => {
    const [src, setSrc] = createSignal(
      "https://example.com/files/track%2001.mp3?sig=abc",
    );
    const rendered = render(() => (
      <ElmAudioPlayer src={src()} artist="SoundHelix" />
    ));

    expect(rendered.container.textContent).toContain("track 01.mp3");
    expect(rendered.container.textContent).toContain("SoundHelix");

    setSrc("https://example.com/files/next-track.ogg#preview");
    expect(rendered.container.textContent).toContain("next-track.ogg");
  });

  it("labels skip controls from seekStep", () => {
    const rendered = render(() => <ElmAudioPlayer src={SRC} seekStep={30} />);

    expect(
      rendered.getByRole("button", { name: "Back 30 seconds" }),
    ).toBeTruthy();
    expect(
      rendered.getByRole("button", { name: "Forward 30 seconds" }),
    ).toBeTruthy();
  });

  it("replaces the transport with a custom accessible error alert", () => {
    const rendered = render(() => (
      <ElmAudioPlayer src={SRC} errorMessage="Stream offline. Try later." />
    ));
    const audio = rendered.container.querySelector("audio")!;

    fireEvent.error(audio);

    expect(rendered.getByRole("alert")).toHaveTextContent(
      "Stream offline. Try later.",
    );
    expect(rendered.queryByRole("slider", { name: "Seek" })).toBeNull();
    expect(rendered.container.firstElementChild!.className).toMatch(/errored/);
  });

  it("resets stale track state when src changes", () => {
    const [src, setSrc] = createSignal("/first.mp3");
    const rendered = render(() => <ElmAudioPlayer src={src()} />);
    const audio = rendered.container.querySelector("audio")!;
    Object.defineProperty(audio, "duration", {
      configurable: true,
      value: 95,
    });
    audio.currentTime = 42;

    fireEvent.loadedMetadata(audio);
    fireEvent.timeUpdate(audio);
    fireEvent.play(audio);
    fireEvent.error(audio);
    expect(rendered.getByRole("alert")).toBeTruthy();

    setSrc("/second.mp3");

    const seek = rendered.getByRole("slider", { name: "Seek" });
    expect(audio).toHaveAttribute("src", "/second.mp3");
    expect(seek).toHaveAttribute("aria-valuemax", "0");
    expect(seek).toHaveAttribute("aria-valuenow", "0");
    expect(rendered.getByRole("button", { name: "Play" })).toBeTruthy();
    expect(rendered.container.firstElementChild!.className).toMatch(/loading/);
  });

  it("cancels frame sampling when its owner is disposed", () => {
    const request = vi
      .spyOn(window, "requestAnimationFrame")
      .mockReturnValue(73);
    const cancel = vi.spyOn(window, "cancelAnimationFrame");
    const rendered = render(() => <ElmAudioPlayer src={SRC} />);

    fireEvent.play(rendered.container.querySelector("audio")!);
    expect(request).toHaveBeenCalledOnce();

    rendered.unmount();
    expect(cancel).toHaveBeenCalledWith(73);

    request.mockRestore();
    cancel.mockRestore();
  });
});
