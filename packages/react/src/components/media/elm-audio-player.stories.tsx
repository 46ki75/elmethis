import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmAudioPlayer } from "./elm-audio-player";

import tts from "../../assets/tts.mp3";

const meta = {
  title: "Components/Media/elm-audio-player",
  component: ElmAudioPlayer,
  tags: ["autodocs"],
  args: {
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    title: "Midnight Reverie",
    artist: "SoundHelix",
  },
} satisfies Meta<typeof ElmAudioPlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const TitleOnly: Story = {
  args: {
    artist: undefined,
  },
};

export const ArtistOnly: Story = {
  args: {
    title: undefined,
  },
};

export const FilenameFallback: Story = {
  args: {
    title: undefined,
    artist: undefined,
  },
};

export const BigSeekStep: Story = {
  args: {
    title: "Podcast Episode 12",
    artist: "Skips 30s",
    seekStep: 30,
  },
};

export const Errored: Story = {
  args: {
    src: "https://example.com/this-file-does-not-exist.mp3",
    title: "Unavailable track",
    artist: "Broken source",
  },
};

export const Short: Story = {
  args: {
    src: tts,
    title: "Short TTS",
    artist: "Example Artist",
  },
};
