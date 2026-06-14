import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmAudioPlayer, type ElmAudioPlayerProps } from "./elm-audio-player";

const meta: Meta<ElmAudioPlayerProps> = {
  title: "Components/Media/elm-audio-player",
  component: ElmAudioPlayer,
  tags: ["autodocs"],
  args: {
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    title: "Midnight Reverie",
    artist: "SoundHelix",
  },
};

export default meta;
type Story = StoryObj<ElmAudioPlayerProps>;

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
