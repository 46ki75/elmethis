import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmCommandPalette from "./ElmCommandPalette.vue";

const open = (url: string) => () => {
  window.open(url, "_blank", "noopener,noreferrer");
};

interface Bookmark {
  id: string;
  label: string;
  description: string;
  icon: string;
}

const bookmarks: Bookmark[] = [
  {
    id: "7e3a53b9-c486-4b67-8216-5686517b99b7",
    label: "GitHub",
    description: "https://github.com",
    icon: "https://github.githubassets.com/favicons/favicon.svg",
  },
  {
    id: "0e02fda3-0460-4bd5-839f-9f0d251ce83e",
    label: "VueUse",
    description: "https://vueuse.org",
    icon: "https://vueuse.org/favicon.svg",
  },
  {
    id: "3589e1b1-ddc5-4f7e-97cd-79c1d76df288",
    label: "Feedly",
    description: "https://feedly.com",
    icon: "https://feedly.com/feedly-32.png",
  },
  {
    id: "2209085f-9e63-49bc-abd5-8659c7261814",
    label: "GitLab",
    description: "https://about.gitlab.com",
    icon: "https://about.gitlab.com/images/ico/favicon.ico",
  },
  {
    id: "4d74f753-4727-46cd-9e0f-a9a6d7a6d1fc",
    label: "Fuse.js",
    description: "https://www.fusejs.io",
    icon: "https://www.fusejs.io/icons/favicon-32x32.png",
  },
  {
    id: "b1a2c3d4-e5f6-7890-abcd-1234567890ef",
    label: "Stack Overflow",
    description: "https://stackoverflow.com",
    icon: "https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico",
  },
  {
    id: "c2b3a4d5-e6f7-8901-bcda-2345678901fa",
    label: "NPM",
    description: "https://www.npmjs.com",
    icon: "https://static.npmjs.com/da3e3fdc8e6c9e7e4e6a7e6e7e6e7e6e/favicon.ico",
  },
  {
    id: "d3c4b5a6-f7e8-9012-cdab-3456789012fb",
    label: "MDN Web Docs",
    description: "https://developer.mozilla.org",
    icon: "https://developer.mozilla.org/favicon.svg",
  },
  {
    id: "e4d5c6b7-08f9-1234-dabc-4567890123fc",
    label: "Twitter",
    description: "https://twitter.com",
    icon: "https://abs.twimg.com/favicons/twitter.2.ico",
  },
  {
    id: "f5e6d7c8-19fa-2345-abcd-5678901234fd",
    label: "Reddit",
    description: "https://reddit.com",
    icon: "https://www.redditstatic.com/desktop2x/img/favicon/favicon-32x32.png",
  },
  {
    id: "a1b2c3d4-e5f6-7890-abcd-111111111111",
    label: "Google",
    description: "https://google.com",
    icon: "https://www.google.com/favicon.ico",
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcda-222222222222",
    label: "YouTube",
    description: "https://youtube.com",
    icon: "https://www.youtube.com/s/desktop/6e8e6e6e/img/favicon_32x32.png",
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdab-333333333333",
    label: "Facebook",
    description: "https://facebook.com",
    icon: "https://www.facebook.com/favicon.ico",
  },
  {
    id: "d4e5f6a7-b8c9-0123-dabc-444444444444",
    label: "LinkedIn",
    description: "https://linkedin.com",
    icon: "https://static.licdn.com/scds/common/u/images/logos/favicons/v1/favicon.ico",
  },
  {
    id: "e5f6a7b8-c9d0-1234-abcd-555555555555",
    label: "Amazon",
    description: "https://amazon.com",
    icon: "https://www.amazon.com/favicon.ico",
  },
  {
    id: "f6a7b8c9-d0e1-2345-bcda-666666666666",
    label: "Wikipedia",
    description: "https://wikipedia.org",
    icon: "https://www.wikipedia.org/static/favicon/wikipedia.ico",
  },
  {
    id: "a7b8c9d0-e1f2-3456-cdab-777777777777",
    label: "Netflix",
    description: "https://netflix.com",
    icon: "https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico",
  },
  {
    id: "b8c9d0e1-f2a3-4567-dabc-888888888888",
    label: "Spotify",
    description: "https://spotify.com",
    icon: "https://www.scdn.co/i/_global/favicon.png",
  },
  {
    id: "c9d0e1f2-a3b4-5678-abcd-999999999999",
    label: "Discord",
    description: "https://discord.com",
    icon: "https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico",
  },
  {
    id: "d0e1f2a3-b4c5-6789-bcda-101010101010",
    label: "Twitch",
    description: "https://twitch.tv",
    icon: "https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png",
  },
  {
    id: "e1f2a3b4-c5d6-7890-cdab-111111111112",
    label: "Instagram",
    description: "https://instagram.com",
    icon: "https://instagram.com/favicon.ico",
  },
  {
    id: "f2a3b4c5-d6e7-8901-dabc-121212121212",
    label: "Yahoo",
    description: "https://yahoo.com",
    icon: "https://s.yimg.com/rz/l/favicon.ico",
  },
  {
    id: "a3b4c5d6-e7f8-9012-abcd-131313131313",
    label: "DuckDuckGo",
    description: "https://duckduckgo.com",
    icon: "https://duckduckgo.com/favicon.ico",
  },
  {
    id: "b4c5d6e7-f8a9-0123-bcda-141414141414",
    label: "Bing",
    description: "https://bing.com",
    icon: "https://www.bing.com/sa/simg/favicon-2x.ico",
  },
  {
    id: "c5d6e7f8-a9b0-1234-cdab-151515151515",
    label: "Pinterest",
    description: "https://pinterest.com",
    icon: "https://s.pinimg.com/webapp/favicon-32x32.png",
  },
  {
    id: "d6e7f8a9-b0c1-2345-abcd-161616161616",
    label: "Quora",
    description: "https://quora.com",
    icon: "https://www.quora.com/favicon.ico",
  },
  {
    id: "e7f8a9b0-c1d2-3456-bcda-171717171717",
    label: "Hacker News",
    description: "https://news.ycombinator.com",
    icon: "https://news.ycombinator.com/favicon.ico",
  },
  {
    id: "f8a9b0c1-d2e3-4567-cdab-181818181818",
    label: "Product Hunt",
    description: "https://producthunt.com",
    icon: "https://ph-static.imgix.net/ph-ios-icon.png?auto=format&auto=compress&w=32&h=32",
  },
  {
    id: "a9b0c1d2-e3f4-5678-abcd-191919191919",
    label: "Dev.to",
    description: "https://dev.to",
    icon: "https://dev.to/favicon.ico",
  },
  {
    id: "b0c1d2e3-f4a5-6789-bcda-202020202020",
    label: "Medium",
    description: "https://medium.com",
    icon: "https://miro.medium.com/v2/resize:fill:266:266/10fd5c419ac61637245384e7099e131627900034828f4f386bdaa47a74eae156",
  },
  {
    id: "c1d2e3f4-a5b6-7890-cdab-212121212121",
    label: "Notion",
    description: "https://notion.so",
    icon: "https://www.notion.so/images/favicon.ico",
  },
  {
    id: "d2e3f4a5-b6c7-8901-abcd-222222222223",
    label: "Figma",
    description: "https://figma.com",
    icon: "https://static.figma.com/app/icon/1/favicon.ico",
  },
  {
    id: "e3f4a5b6-c7d8-9012-bcda-232323232323",
    label: "Canva",
    description: "https://canva.com",
    icon: "https://static.canva.com/static/images/favicon.ico",
  },
  {
    id: "f4a5b6c7-d8e9-0123-cdab-242424242424",
    label: "Trello",
    description: "https://trello.com",
    icon: "https://trello.com/favicon.ico",
  },
  {
    id: "a5b6c7d8-e9f0-1234-abcd-252525252525",
    label: "Slack",
    description: "https://slack.com",
    icon: "https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png",
  },
  {
    id: "b6c7d8e9-f0a1-2345-bcda-262626262626",
    label: "Gmail",
    description: "https://mail.google.com",
    icon: "https://mail.google.com/favicon.ico",
  },
  {
    id: "c7d8e9f0-a1b2-3456-cdab-272727272727",
    label: "Outlook",
    description: "https://outlook.com",
    icon: "https://outlook.com/favicon.ico",
  },
  {
    id: "d8e9f0a1-b2c3-4567-abcd-282828282828",
    label: "Dropbox",
    description: "https://dropbox.com",
    icon: "https://cfl.dropboxstatic.com/static/images/favicon.ico",
  },
  {
    id: "e9f0a1b2-c3d4-5678-bcda-292929292929",
    label: "Drive",
    description: "https://drive.google.com",
    icon: "https://ssl.gstatic.com/docs/doclist/images/infinite_arrow_favicon_5.ico",
  },
  {
    id: "f0a1b2c3-d4e5-6789-cdab-303030303030",
    label: "Zoom",
    description: "https://zoom.us",
    icon: "https://st1.zoom.us/zoom.ico",
  },
];

const meta: Meta<typeof ElmCommandPalette> = {
  title: "Command Palette/ElmCommandPalette",
  component: ElmCommandPalette,
  tags: ["autodocs"],
  args: {
    commands: bookmarks.map((bookmark) => ({
      ...bookmark,
      onInvoke: open(bookmark.description),
    })),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
