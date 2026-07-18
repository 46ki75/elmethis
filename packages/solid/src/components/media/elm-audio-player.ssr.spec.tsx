import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmAudioPlayer } from "./elm-audio-player";

const SRC = "https://example.com/audio/midnight-reverie.mp3";

describe("[SSR] ElmAudioPlayer", () => {
  it("emits the player shell, native media attributes, and controls", () => {
    const html = renderToString(() => (
      <ElmAudioPlayer
        src={SRC}
        title="Midnight Reverie"
        artist="SoundHelix"
        loop
        autoPlay
        class="server-player"
      />
    ));

    expect(html).toContain("elm-audio-player");
    expect(html).toContain("server-player");
    expect(html).toContain(`<audio`);
    expect(html).toContain(`src="${SRC}"`);
    expect(html).toContain("loop");
    expect(html).toContain("autoplay");
    expect(html).toContain("Midnight Reverie");
    expect(html).toContain("SoundHelix");
    expect(html).toContain('role="slider"');
    expect(html).toContain('aria-valuetext="0:00 of 0:00"');
  });
});
