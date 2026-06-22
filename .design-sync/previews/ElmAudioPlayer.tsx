import * as React from "react";
import { ElmAudioPlayer } from "@elmethis/react";
// Local TTS asset (loaded as a data URL via cfg.storyImports.loaders ".mp3").
// The story's default `src` is a ~9 MB remote mp3 (soundhelix.com); fetching it
// stalls the headless render past the page-load timeout. Using the vendored
// local clip keeps every cell offline and fast while showing the real player.
import tts from "@ds-stories/packages/react/src/assets/tts.mp3";

export const Primary = () => (
  <ElmAudioPlayer src={tts} title="Midnight Reverie" artist="SoundHelix" />
);

export const TitleOnly = () => (
  <ElmAudioPlayer src={tts} title="Midnight Reverie" />
);

// The story relies on the filename-fallback (no `title`), which derives the
// label from `src`. Our local clip is imported as a `data:` URL, so the
// fallback would extract a base64 chunk instead of a clean filename. Pass the
// filename the story's remote `src` (SoundHelix-Song-1.mp3) resolves to so the
// header label matches the storybook reference while the audio still plays.
export const ArtistOnly = () => (
  <ElmAudioPlayer src={tts} title="SoundHelix-Song-1.mp3" artist="SoundHelix" />
);

export const FilenameFallback = () => (
  <ElmAudioPlayer src={tts} title="SoundHelix-Song-1.mp3" />
);

export const BigSeekStep = () => (
  <ElmAudioPlayer src={tts} title="Podcast Episode 12" artist="Skips 30s" seekStep={30} />
);

// Intentionally-broken source to show the load-error state, using a local
// path that fails instantly (no network wait, unlike a remote 404).
export const Errored = () => (
  <ElmAudioPlayer
    src="./__nonexistent__.mp3"
    title="Unavailable track"
    artist="Broken source"
  />
);

export const Short = () => (
  <ElmAudioPlayer src={tts} title="Short TTS" artist="Example Artist" />
);
