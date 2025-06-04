<template>
  <div :class="$style.block" :style="{ '--size': size }">
    <transition
      mode="out-in"
      :enter-from-class="fadeStyle['fade-enter-from']"
      :enter-active-class="fadeStyle['fade-enter-active']"
      :enter-to-class="fadeStyle['fade-enter-to']"
      :leave-from-class="fadeStyle['fade-leave-from']"
      :leave-active-class="fadeStyle['fade-leave-active']"
      :leave-to-class="fadeStyle['fade-leave-to']"
    >
      <component :is="render()" :class="$style.icon" :key="language" />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, h, VNode } from "vue";

import ElmMdiIcon from "./ElmMdiIcon.vue";
import { mdiCodeJson } from "@mdi/js";

import fadeStyle from "../../styles/transition-fade.module.scss";

export interface ElmLanguageIconProps {
  /**
   * The size of the icon.
   */
  size?: number;

  /**
   * The language of the icon.
   */
  language: string;
}

export type Language =
  | "rust"
  | "javascript"
  | "typescript"
  | "shell"
  | "terraform"
  | "html"
  | "css"
  | "npm"
  | "java"
  | "kotlin"
  | "go"
  | "python"
  | "sql"
  | "json"
  | "lua"
  | "csharp"
  | "cpp"
  | "c"
  | "file";

const normalizeLanguage = (language: string): Language => {
  switch (language) {
    case "rust":
    case "rs":
      return "rust";

    case "javascript":
    case "js":
      return "javascript";

    case "typescript":
    case "ts":
      return "typescript";

    case "bash":
    case "sh":
    case "shell":
      return "shell";

    case "tf":
    case "terraform":
    case "hcl":
      return "terraform";

    case "html":
    case "html5":
      return "html";

    case "css":
    case "css3":
      return "css";

    case "npm":
      return "npm";

    case "java":
      return "java";

    case "kotlin":
    case "kt":
      return "kotlin";

    case "go":
    case "golang":
      return "go";

    case "python":
    case "py":
      return "python";

    case "sql":
      return "sql";

    case "json":
      return "json";

    case "lua":
      return "lua";

    case "cs":
    case "c#":
    case "csharp":
      return "csharp";

    case "cpp":
    case "c++":
      return "cpp";

    case "c":
    case "clang":
      return "c";

    default:
      return "file";
  }
};

const props = withDefaults(defineProps<ElmLanguageIconProps>(), {
  size: 24,
});

const Fallback = h(ElmMdiIcon, {
  d: mdiCodeJson,
  size: props.size ? `${props.size}px` : undefined,
});

const defineIcon = (path: string): VNode =>
  h(
    defineAsyncComponent({
      loader: () => import(`./languages/${path}.vue`),
      loadingComponent: Fallback,
    }),
    props
  );

const ICON_MAP: Record<Language, VNode> = {
  rust: defineIcon("Rust"),
  javascript: defineIcon("Javascript"),
  typescript: defineIcon("Typescript"),
  shell: defineIcon("Bash"),
  terraform: defineIcon("Terraform"),
  html: defineIcon("Html"),
  css: defineIcon("Css"),
  npm: defineIcon("Npm"),
  java: defineIcon("Java"),
  kotlin: defineIcon("Kotlin"),
  go: defineIcon("Go"),
  python: defineIcon("Python"),
  sql: defineIcon("Sql"),
  json: defineIcon("Json"),
  lua: defineIcon("Lua"),
  csharp: defineIcon("Csharp"),
  cpp: defineIcon("Cplusplus"),
  c: defineIcon("C"),
  file: h(Fallback),
};

const render = (): VNode => {
  const normalizedLanguage = normalizeLanguage(props.language);
  return ICON_MAP[normalizedLanguage];
};
</script>

<style module lang="scss">
.block {
  box-sizing: border-box;
  display: inline-block;
  height: var(--size);
  width: var(--size);
}
</style>
