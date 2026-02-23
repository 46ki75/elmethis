import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmOEmbed from "./ElmOEmbed.vue";

const meta: Meta<typeof ElmOEmbed> = {
  title: "Components/Embed/ElmOEmbed",
  component: ElmOEmbed,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Photo: Story = {
  args: {
    oEmbed: {
      type: "photo",
      version: "1.0",
      title: "A beautiful landscape",
      url: "https://images.unsplash.com/photo-1556983703-27576e5afa24?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb",
      width: 600,
      height: 400,
    },
  },
};

export const Rich: Story = {
  args: {
    oEmbed: {
      type: "rich",
      version: 1,
      provider_name: "Speaker Deck",
      provider_url: "https://speakerdeck.com/",
      title: "Atom",
      author_name: "John Nunemaker",
      author_url: "https://speakerdeck.com/jnunemaker",
      html: '\u003Ciframe id="talk_frame_282032" class="speakerdeck-iframe" src="https://speakerdeck.com/player/31f86a9069ae0132dede22511952b5a3" width="710" height="399" style="aspect-ratio:710/399; border:0; padding:0; margin:0; background:transparent;" frameborder="0" allowtransparency="true" allowfullscreen="allowfullscreen"\u003E\u003C/iframe\u003E\n',
      width: 710,
      height: 399,
      ratio: 1.77777777777778,
    },
  },
};

export const Video: Story = {
  args: {
    oEmbed: {
      title: "Rachmaninoff - Italian Polka",
      author_name: "Kassia",
      author_url: "https://www.youtube.com/@Kassiapiano",
      type: "video",
      height: 200,
      width: 356,
      version: "1.0",
      provider_name: "YouTube",
      provider_url: "https://www.youtube.com/",
      thumbnail_height: 360,
      thumbnail_width: 480,
      thumbnail_url: "https://i.ytimg.com/vi/-3WEHWoBOz4/hqdefault.jpg",
      html: '\u003Ciframe width="356" height="200" src="https://www.youtube.com/embed/-3WEHWoBOz4?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen title="Rachmaninoff - Italian Polka"\u003E\u003C/iframe\u003E',
    },
  },
};
