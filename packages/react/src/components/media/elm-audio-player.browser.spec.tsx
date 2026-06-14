import { render } from "vitest-browser-react";
import { describe, expect, test, vi } from "vitest";

import { ElmAudioPlayer } from "./elm-audio-player";

// The transport's real behavior — `loadedmetadata`-driven duration, native
// `currentTime` seeking, `<audio>.volume`/`muted` — only exists in a real media
// element. happy-dom has no media pipeline (no metadata, no `currentTime`
// semantics), so these live here. Playback itself (`play()`) is gated by the
// browser's autoplay policy under synthetic events, so we drive the *seek* and
// *volume* paths (which need only loaded metadata) plus the play/pause UI wiring
// via real media events.

// A short silent PCM WAV, built at runtime so the spec stays a few lines instead
// of a multi-kilobyte data URI. Real Chromium decodes it and fires
// `loadedmetadata` with a finite duration.
const silentWavDataUri = (seconds = 2, sampleRate = 8000): string => {
  const frames = seconds * sampleRate;
  const dataBytes = frames * 2;
  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++)
      view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, dataBytes, true);
  // Samples stay zero (silence).
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++)
    binary += String.fromCharCode(bytes[i]);
  return `data:audio/wav;base64,${btoa(binary)}`;
};

type Screen = Awaited<ReturnType<typeof render>>;
const root = (screen: Screen) => screen.container as HTMLElement;
const audioEl = (screen: Screen) =>
  root(screen).querySelector("audio") as HTMLAudioElement;
const sliderEl = (screen: Screen) =>
  root(screen).querySelector('[role="slider"]') as HTMLElement;
const playBtn = (screen: Screen) =>
  root(screen).querySelector('[class*="play-button"]') as HTMLButtonElement;

describe("[CSR] ElmAudioPlayer media integration", () => {
  test("reads duration from loadedmetadata and exposes it on the slider", async () => {
    const screen = await render(<ElmAudioPlayer src={silentWavDataUri(2)} />);
    const slider = sliderEl(screen);

    await vi.waitFor(() =>
      expect(Number(slider.getAttribute("aria-valuemax"))).toBeGreaterThan(0),
    );
    // The total timecode should no longer read 0:00 once metadata lands.
    await vi.waitFor(() => expect(root(screen).textContent).toMatch(/0:0[12]/));
  });

  test("keyboard seek advances currentTime and updates the slider value", async () => {
    const screen = await render(
      <ElmAudioPlayer src={silentWavDataUri(5)} seekStep={1} />,
    );
    const slider = sliderEl(screen);
    const audio = audioEl(screen);

    await vi.waitFor(() => expect(audio.duration).toBeGreaterThan(2));

    slider.focus();
    slider.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );

    await vi.waitFor(() => expect(audio.currentTime).toBeGreaterThan(0));
    await vi.waitFor(() =>
      expect(
        Number(slider.getAttribute("aria-valuenow")),
      ).toBeGreaterThanOrEqual(1),
    );
  });

  test("clicking the waveform seeks proportionally to the click position", async () => {
    const screen = await render(<ElmAudioPlayer src={silentWavDataUri(8)} />);
    const slider = sliderEl(screen);
    const audio = audioEl(screen);

    await vi.waitFor(() => expect(audio.duration).toBeGreaterThan(4));

    const rect = slider.getBoundingClientRect();
    // Click at ~75% across the track.
    slider.dispatchEvent(
      new PointerEvent("pointerdown", {
        bubbles: true,
        clientX: rect.left + rect.width * 0.75,
        pointerId: 1,
      }),
    );

    await vi.waitFor(() =>
      expect(audio.currentTime).toBeGreaterThan(audio.duration * 0.5),
    );
  });

  test("the volume slider sets the audio element's volume", async () => {
    const screen = await render(<ElmAudioPlayer src={silentWavDataUri(2)} />);
    const audio = audioEl(screen);
    const range = root(screen).querySelector(
      'input[type="range"]',
    ) as HTMLInputElement;

    await vi.waitFor(() => expect(audio.readyState).toBeGreaterThan(0));

    // React's controlled-input value tracker swallows a plain `.value =` write,
    // so go through the prototype's native setter before dispatching `input`.
    const nativeSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!;
    nativeSetter.call(range, "0.3");
    range.dispatchEvent(new Event("input", { bubbles: true }));

    await vi.waitFor(() => expect(audio.volume).toBeCloseTo(0.3, 2));
  });

  test("play/pause UI wiring flips with the media element's events", async () => {
    const screen = await render(<ElmAudioPlayer src={silentWavDataUri(2)} />);
    const audio = audioEl(screen);
    const button = playBtn(screen);

    expect(button.getAttribute("aria-label")).toBe("Play");

    // Drive the component's onPlay/onPause handlers via real media events,
    // sidestepping the autoplay policy that would reject play() under a
    // synthetic gesture.
    audio.dispatchEvent(new Event("play"));
    await vi.waitFor(() =>
      expect(button.getAttribute("aria-label")).toBe("Pause"),
    );
    await vi.waitFor(() =>
      expect(root(screen).querySelector('[class*="playing"]')).toBeTruthy(),
    );

    audio.dispatchEvent(new Event("pause"));
    await vi.waitFor(() =>
      expect(button.getAttribute("aria-label")).toBe("Play"),
    );
  });
});
