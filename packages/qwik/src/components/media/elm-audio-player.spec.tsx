import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";

import { ElmAudioPlayer } from "./elm-audio-player";

// ElmAudioPlayer wraps a native <audio> with a custom transport, monospace
// timecodes, and a thin seek line. The interesting behaviors — play()/pause(),
// real `currentTime` seeking, metadata-driven duration — need a real media
// element, so they live in the browser spec. The unit layer covers the static
// render contract: structure, title/filename resolution, formatted timecodes,
// and SSR parity.

const SRC = "https://example.com/audio/midnight-reverie.mp3";

describe("[CSR] ElmAudioPlayer", () => {
  test("renders the root, a native audio element, and the play control", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmAudioPlayer src={SRC} />);

    expect(screen.querySelector('[class*="elm-audio-player"]')).toBeTruthy();
    const audio = screen.querySelector("audio") as HTMLAudioElement;
    expect(audio).toBeTruthy();
    expect(audio.getAttribute("src")).toBe(SRC);

    const play = screen.querySelector('button[aria-label="Play"]');
    expect(play).toBeTruthy();
  });

  test("shows the explicit title and artist", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmAudioPlayer src={SRC} title="Midnight Reverie" artist="SoundHelix" />,
    );
    expect(screen.outerHTML).toContain("Midnight Reverie");
    expect(screen.outerHTML).toContain("SoundHelix");
  });

  test("derives the title from the src filename when title is absent", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmAudioPlayer src="https://example.com/files/track-01.mp3?sig=abc" />,
    );
    // Query string is stripped; the last path segment is used.
    expect(screen.outerHTML).toContain("track-01.mp3");
  });

  test("renders an initial 0:00 timecode and the seek slider", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmAudioPlayer src={SRC} />);

    expect(screen.outerHTML).toContain("0:00");
    const slider = screen.querySelector('[role="slider"]');
    expect(slider).toBeTruthy();
    expect(slider?.getAttribute("aria-label")).toBe("Seek");
  });

  test("labels the skip controls with the configured seek step", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmAudioPlayer src={SRC} seekStep={30} />);
    expect(
      screen.querySelector('button[aria-label="Back 30 seconds"]'),
    ).toBeTruthy();
    expect(
      screen.querySelector('button[aria-label="Forward 30 seconds"]'),
    ).toBeTruthy();
  });

  test("forwards the loop attribute onto the audio element", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmAudioPlayer src={SRC} loop />);
    expect(screen.querySelector("audio")?.hasAttribute("loop")).toBe(true);
  });
});

describe("[SSR] ElmAudioPlayer", () => {
  test("server HTML emits the player shell, audio source, and resolved title", async () => {
    const { html } = await renderToString(
      <ElmAudioPlayer src={SRC} title="Midnight Reverie" />,
      { containerTagName: "div" },
    );
    expect(html).toContain("elm-audio-player");
    expect(html).toContain(SRC);
    expect(html).toContain("Midnight Reverie");
    expect(html).toContain('role="slider"');
  });
});
