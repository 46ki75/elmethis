<template>
  <div>
    <ElmImage
      v-if="oEmbed.type === 'photo'"
      :src="oEmbed.url"
      :alt="oEmbed.title"
      :width="oEmbed.width"
      :height="oEmbed.height"
      block
    />

    <div v-else-if="oEmbed.type === 'video'">
      <div
        v-html="oEmbed.html"
        :style="{
          width: oEmbed.width && `${oEmbed.width}px`,
          height: oEmbed.height && `${oEmbed.height}px`,
        }"
      />
    </div>

    <div
      v-else-if="oEmbed.type === 'rich'"
      :style="{
        width: oEmbed.width && `${oEmbed.width}px`,
        height: oEmbed.height && `${oEmbed.height}px`,
      }"
    >
      <div v-html="oEmbed.html" />
    </div>

    <div v-else-if="oEmbed.type === 'link'">
      <ElmInlineText :href="oEmbed.author_url || oEmbed.provider_url || '#'">
        {{
          oEmbed.title || oEmbed.author_name || oEmbed.provider_name || "Link"
        }}
      </ElmInlineText>
    </div>
  </div>
</template>

<script setup lang="ts">
import ElmImage from "../media/ElmImage.vue";
import ElmInlineText from "../typography/ElmInlineText.vue";

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
  oEmbed: OEmbedResponse;
}

withDefaults(defineProps<ElmOEmbedProps>(), {});
</script>

<style module lang="scss"></style>
