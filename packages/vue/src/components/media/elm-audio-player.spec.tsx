import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmAudioPlayer } from "./elm-audio-player";

// ElmAudioPlayer wraps a native <audio> with a custom transport, monospace
// timecodes, and a thin seek line. The interesting behaviors — play()/pause(),
// real `currentTime` seeking, metadata-driven duration — need a real media
// element, so they live in the browser spec. The unit layer covers the static
// render contract: structure, title/filename resolution, formatted timecodes,
// the error notice, and SSR parity.

const SRC = "https://example.com/audio/midnight-reverie.mp3";

describe("[CSR] ElmAudioPlayer", () => {
  it("renders the root, a native audio element, and the play control", () => {
    const wrapper = mount(ElmAudioPlayer, { props: { src: SRC } });

    expect(wrapper.find('[class*="elm-audio-player"]').exists()).toBe(true);
    const audio = wrapper.find("audio");
    expect(audio.exists()).toBe(true);
    expect(audio.attributes("src")).toBe(SRC);
    expect(wrapper.find('button[aria-label="Play"]').exists()).toBe(true);
  });

  it("shows the explicit title and artist", () => {
    const wrapper = mount(ElmAudioPlayer, {
      props: { src: SRC, title: "Midnight Reverie", artist: "SoundHelix" },
    });
    expect(wrapper.text()).toContain("Midnight Reverie");
    expect(wrapper.text()).toContain("SoundHelix");
  });

  it("derives the title from the src filename when title is absent", () => {
    const wrapper = mount(ElmAudioPlayer, {
      props: { src: "https://example.com/files/track-01.mp3?sig=abc" },
    });
    // Query string is stripped; the last path segment is used.
    expect(wrapper.text()).toContain("track-01.mp3");
  });

  it("renders an initial 0:00 timecode and the seek slider", () => {
    const wrapper = mount(ElmAudioPlayer, { props: { src: SRC } });
    expect(wrapper.text()).toContain("0:00");
    const slider = wrapper.find('[role="slider"]');
    expect(slider.exists()).toBe(true);
    expect(slider.attributes("aria-label")).toBe("Seek");
  });

  it("labels the skip controls with the configured seek step", () => {
    const wrapper = mount(ElmAudioPlayer, {
      props: { src: SRC, seekStep: 30 },
    });
    expect(wrapper.find('button[aria-label="Back 30 seconds"]').exists()).toBe(
      true,
    );
    expect(
      wrapper.find('button[aria-label="Forward 30 seconds"]').exists(),
    ).toBe(true);
  });

  it("forwards the loop attribute onto the audio element", () => {
    const wrapper = mount(ElmAudioPlayer, { props: { src: SRC, loop: true } });
    expect(wrapper.find("audio").attributes("loop")).toBeDefined();
  });

  it("replaces the transport with an accessible alert when the audio errors", async () => {
    const wrapper = mount(ElmAudioPlayer, { props: { src: SRC } });

    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(wrapper.find('[role="slider"]').exists()).toBe(true);

    await wrapper.find("audio").trigger("error");

    const alert = wrapper.find('[role="alert"]');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toContain("couldn't be loaded");
    // The seek slider is swapped out for the notice, so nothing looks playable.
    expect(wrapper.find('[role="slider"]').exists()).toBe(false);
    expect(wrapper.find('[class*="errored"]').exists()).toBe(true);
  });

  it("shows a custom errorMessage in the alert", async () => {
    const wrapper = mount(ElmAudioPlayer, {
      props: { src: SRC, errorMessage: "Stream offline — try again later." },
    });
    await wrapper.find("audio").trigger("error");
    expect(wrapper.find('[role="alert"]').text()).toContain(
      "Stream offline — try again later.",
    );
  });
});

describe("[SSR] ElmAudioPlayer", () => {
  it("server HTML emits the player shell, audio source, and resolved title", async () => {
    const app = createSSRApp(ElmAudioPlayer, {
      src: SRC,
      title: "Midnight Reverie",
    });
    const html = await renderToString(app);
    expect(html).toContain("elm-audio-player");
    expect(html).toContain(SRC);
    expect(html).toContain("Midnight Reverie");
    expect(html).toContain('role="slider"');
  });
});
