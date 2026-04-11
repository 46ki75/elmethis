import React from "react";

import "@styles/global.css";

import { ElmImage } from "@components/media/ElmImage";
import { ElmInlineText } from "@components/typography/ElmInlineText";

interface OEmbedBase {
  type: "photo" | "video" | "link" | "rich";
  title?: string;
  author_name?: string;
  author_url?: string;
  provider_name?: string;
  provider_url?: string;
  cache_age?: number;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface OEmbedPhoto extends OEmbedBase {
  type: "photo";
  url: string;
  width: number;
  height: number;
}

interface OEmbedVideo extends OEmbedBase {
  type: "video";
  html: string;
  width: number;
  height: number;
}

interface OEmbedRich extends OEmbedBase {
  type: "rich";
  html: string;
  width: number;
  height: number;
}

interface OEmbedLink extends OEmbedBase {
  type: "link";
}

type OEmbedResponse = OEmbedPhoto | OEmbedVideo | OEmbedRich | OEmbedLink;

export interface ElmOEmbedProps {
  style?: React.CSSProperties;

  /**
   * The oEmbed response data to render.
   */
  oEmbed: OEmbedResponse;
}

export const ElmOEmbed = ({ oEmbed, style }: ElmOEmbedProps) => {
  if (oEmbed.type === "photo") {
    return (
      <div style={style}>
        <ElmImage
          src={oEmbed.url}
          alt={oEmbed.title}
          width={oEmbed.width}
          height={oEmbed.height}
          block
        />
      </div>
    );
  }

  if (oEmbed.type === "video") {
    return (
      <div
        style={{
          width: oEmbed.width ? `${oEmbed.width}px` : undefined,
          height: oEmbed.height ? `${oEmbed.height}px` : undefined,
          ...style,
        }}
        dangerouslySetInnerHTML={{ __html: oEmbed.html }}
      />
    );
  }

  if (oEmbed.type === "rich") {
    return (
      <div
        style={{
          width: oEmbed.width ? `${oEmbed.width}px` : undefined,
          height: oEmbed.height ? `${oEmbed.height}px` : undefined,
          ...style,
        }}
        dangerouslySetInnerHTML={{ __html: oEmbed.html }}
      />
    );
  }

  // type === "link"
  const href =
    oEmbed.author_url ?? oEmbed.provider_url ?? "#";
  const label =
    oEmbed.title ?? oEmbed.author_name ?? oEmbed.provider_name ?? "Link";

  return (
    <div style={style}>
      <ElmInlineText href={href} text={label} />
    </div>
  );
};
