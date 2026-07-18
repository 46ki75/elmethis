import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { ElmAudioPlayer } from "./elm-audio-player";

const silentWavDataUri = (seconds = 2, sampleRate = 8000): string => {
  const frames = seconds * sampleRate;
  const dataBytes = frames * 2;
  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);
  const writeString = (offset: number, value: string): void => {
    for (let index = 0; index < value.length; index += 1) {
      view.setUint8(offset + index, value.charCodeAt(index));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataBytes, true);

  let binary = "";
  for (const byte of new Uint8Array(buffer)) {
    binary += String.fromCharCode(byte);
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
};

describe("[Browser] ElmAudioPlayer media integration", () => {
  it("decodes metadata and keeps the native audio hidden", async () => {
    const rendered = render(() => <ElmAudioPlayer src={silentWavDataUri(2)} />);
    const audio = rendered.container.querySelector("audio")!;
    const seek = rendered.getByRole("slider", { name: "Seek" });

    await vi.waitFor(() => expect(audio.duration).toBeGreaterThan(1));
    await vi.waitFor(() =>
      expect(Number(seek.getAttribute("aria-valuemax"))).toBeGreaterThan(0),
    );
    expect(getComputedStyle(audio).display).toBe("none");
    expect(rendered.container.textContent).toMatch(/0:0[12]/);
  });

  it("supports keyboard seeking and clamps to the track bounds", async () => {
    const rendered = render(() => (
      <ElmAudioPlayer src={silentWavDataUri(5)} seekStep={2} />
    ));
    const audio = rendered.container.querySelector("audio")!;
    const seek = rendered.getByRole("slider", { name: "Seek" });
    await vi.waitFor(() => expect(audio.duration).toBeGreaterThan(4));

    seek.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    await vi.waitFor(() => expect(audio.currentTime).toBeCloseTo(2, 0));

    seek.dispatchEvent(
      new KeyboardEvent("keydown", { key: "End", bubbles: true }),
    );
    await vi.waitFor(() =>
      expect(audio.currentTime).toBeCloseTo(audio.duration, 1),
    );

    seek.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
    );
    await vi.waitFor(() =>
      expect(audio.currentTime).toBeLessThan(audio.duration),
    );

    seek.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
    );
    await vi.waitFor(() => expect(audio.currentTime).toBe(0));
  });

  it("seeks on pointer down and continues seeking while captured", async () => {
    const rendered = render(() => <ElmAudioPlayer src={silentWavDataUri(8)} />);
    const audio = rendered.container.querySelector("audio")!;
    const seek = rendered.getByRole("slider", { name: "Seek" });
    await vi.waitFor(() => expect(audio.duration).toBeGreaterThan(7));

    const rect = seek.getBoundingClientRect();
    seek.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        clientX: rect.left + rect.width * 0.25,
        pointerId: 1,
      }),
    );
    await vi.waitFor(() =>
      expect(audio.currentTime).toBeGreaterThan(audio.duration * 0.15),
    );

    vi.spyOn(seek, "hasPointerCapture").mockReturnValue(true);
    seek.dispatchEvent(
      new PointerEvent("pointermove", {
        bubbles: true,
        clientX: rect.left + rect.width * 0.8,
        pointerId: 1,
      }),
    );
    await vi.waitFor(() =>
      expect(audio.currentTime).toBeGreaterThan(audio.duration * 0.7),
    );
  });

  it("synchronizes volume and mute with the media element", async () => {
    const rendered = render(() => <ElmAudioPlayer src={silentWavDataUri(2)} />);
    const audio = rendered.container.querySelector("audio")!;
    const volume = rendered.getByRole("slider", {
      name: "Volume",
    }) as HTMLInputElement;
    await vi.waitFor(() => expect(audio.readyState).toBeGreaterThan(0));

    volume.value = "0.3";
    volume.dispatchEvent(new Event("input", { bubbles: true }));
    await vi.waitFor(() => expect(audio.volume).toBeCloseTo(0.3, 2));

    rendered.getByRole("button", { name: "Mute" }).click();
    expect(audio.muted).toBe(true);
    expect(rendered.getByRole("button", { name: "Unmute" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    rendered.getByRole("button", { name: "Unmute" }).click();
    expect(audio.muted).toBe(false);
  });

  it("tracks loading, playing, RAF time sampling, and owner cleanup", async () => {
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame");
    const rendered = render(() => (
      <ElmAudioPlayer src={silentWavDataUri(3)} data-testid="player" />
    ));
    const root = rendered.getByTestId("player");
    const audio = root.querySelector("audio")!;
    const seek = rendered.getByRole("slider", { name: "Seek" });
    await vi.waitFor(() => expect(audio.duration).toBeGreaterThan(2));

    audio.dispatchEvent(new Event("waiting"));
    expect(root.className).toMatch(/loading/);
    audio.dispatchEvent(new Event("playing"));
    expect(root.className).not.toMatch(/loading/);

    audio.currentTime = 1.25;
    audio.dispatchEvent(new Event("play"));
    await vi.waitFor(() =>
      expect(Number(seek.getAttribute("aria-valuenow"))).toBeGreaterThanOrEqual(
        1,
      ),
    );
    expect(rendered.getByRole("button", { name: "Pause" })).toBeTruthy();

    rendered.unmount();
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it("clears an old error and timeline when the source changes", async () => {
    const [src, setSrc] = createSignal(silentWavDataUri(2));
    const rendered = render(() => (
      <ElmAudioPlayer src={src()} data-testid="player" />
    ));
    const root = rendered.getByTestId("player");
    const audio = root.querySelector("audio")!;
    await vi.waitFor(() => expect(audio.duration).toBeGreaterThan(1));

    audio.currentTime = 1;
    audio.dispatchEvent(new Event("timeupdate"));
    audio.dispatchEvent(new Event("error"));
    expect(rendered.getByRole("alert")).toBeTruthy();

    setSrc(silentWavDataUri(4));

    const seek = rendered.getByRole("slider", { name: "Seek" });
    expect(seek).toHaveAttribute("aria-valuenow", "0");
    expect(seek).toHaveAttribute("aria-valuemax", "0");
    expect(root.className).toMatch(/loading/);
    await vi.waitFor(() => expect(audio.duration).toBeGreaterThan(3));
    await vi.waitFor(() =>
      expect(Number(seek.getAttribute("aria-valuemax"))).toBeGreaterThan(3),
    );
    expect(rendered.queryByRole("alert")).toBeNull();
  });
});
