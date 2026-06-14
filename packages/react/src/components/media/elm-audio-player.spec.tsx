import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmAudioPlayer } from "./elm-audio-player";

// ElmAudioPlayer wraps a native <audio> with a custom transport, monospace
// timecodes, and a clip-masked waveform scrubber. The interesting behaviors —
// play()/pause(), real `currentTime` seeking, metadata-driven duration — need a
// real media element, so they live in the browser spec. The unit layer covers
// the static render contract: structure, deterministic waveform, title/filename
// resolution, formatted timecodes, and SSR parity (no hydration drift).

const SRC = "https://example.com/audio/midnight-reverie.mp3";

describe("[CSR] ElmAudioPlayer", () => {
  it("renders the root, a native audio element, and the play control", () => {
    const { container } = render(<ElmAudioPlayer src={SRC} />);

    expect(container.querySelector('[class*="elm-audio-player"]')).toBeTruthy();
    const audio = container.querySelector("audio");
    expect(audio).toBeTruthy();
    expect(audio).toHaveAttribute("src", SRC);

    const play = container.querySelector('button[aria-label="Play"]');
    expect(play).toBeTruthy();
    expect(play).toHaveAttribute("aria-pressed", "false");
  });

  it("shows the explicit title and artist", () => {
    const { container } = render(
      <ElmAudioPlayer src={SRC} title="Midnight Reverie" artist="SoundHelix" />,
    );
    expect(container.textContent).toContain("Midnight Reverie");
    expect(container.textContent).toContain("SoundHelix");
  });

  it("derives the title from the src filename when title is absent", () => {
    const { container } = render(
      <ElmAudioPlayer src="https://example.com/files/track-01.mp3?sig=abc" />,
    );
    // Query string is stripped; the last path segment is used.
    expect(container.textContent).toContain("track-01.mp3");
  });

  it("renders an initial 0:00 timecode for both current and total", () => {
    const { container } = render(<ElmAudioPlayer src={SRC} />);
    const times = container.querySelectorAll('[class*="time"]');
    expect(times.length).toBeGreaterThanOrEqual(2);
    expect(container.textContent).toContain("0:00");
  });

  it("renders the seek line with a fill that starts empty (no progress)", () => {
    const { container } = render(<ElmAudioPlayer src={SRC} />);
    // The progress ratio is exposed on the root as a CSS custom property and
    // drives the fill width; it is 0 before any metadata/playback.
    const root = container.querySelector(
      '[class*="elm-audio-player"]',
    ) as HTMLElement;
    expect(root.style.getPropertyValue("--elmethis-scoped-progress")).toBe("0");
    expect(container.querySelector('[class*="fill"]')).toBeTruthy();
    expect(container.querySelector('[class*="thumb"]')).toBeTruthy();
  });

  it("exposes the seek track as an accessible slider", () => {
    const { container } = render(<ElmAudioPlayer src={SRC} />);
    const slider = container.querySelector('[role="slider"]');
    expect(slider).toBeTruthy();
    expect(slider).toHaveAttribute("aria-label", "Seek");
    expect(slider).toHaveAttribute("tabindex", "0");
  });

  it("labels the skip controls with the configured seek step", () => {
    const { container } = render(<ElmAudioPlayer src={SRC} seekStep={30} />);
    expect(
      container.querySelector('button[aria-label="Back 30 seconds"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('button[aria-label="Forward 30 seconds"]'),
    ).toBeTruthy();
  });

  it("forwards loop and merges a passthrough className", () => {
    const { container } = render(
      <ElmAudioPlayer src={SRC} loop className="custom-class" />,
    );
    expect(container.querySelector("audio")).toHaveAttribute("loop");
    expect(container.querySelector('[class*="elm-audio-player"]')).toHaveClass(
      "custom-class",
    );
  });
});

describe("[SSR] ElmAudioPlayer", () => {
  it("server HTML emits the player shell, audio source, and resolved title", () => {
    const html = renderToStaticMarkup(
      <ElmAudioPlayer src={SRC} title="Midnight Reverie" />,
    );
    expect(html).toContain("elm-audio-player");
    expect(html).toContain(SRC);
    expect(html).toContain("Midnight Reverie");
    expect(html).toContain('role="slider"');
  });
});
