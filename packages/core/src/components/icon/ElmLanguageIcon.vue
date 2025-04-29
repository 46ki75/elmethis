<template>
  <div :class="$style.block" :style="{ '--size': `${size}px` }">
    <transition mode="out-in">
      <component :is="render()" :class="$style.icon" :key="language" />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { type Component, defineAsyncComponent, h, useCssModule } from "vue";
import { Icon as Iconify } from "@iconify/vue";

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

const props = withDefaults(defineProps<ElmLanguageIconProps>(), {
  size: 24,
});

const style = useCssModule();
const Fallback = h(Iconify, { icon: "mdi:terminal-line", class: style.icon });

const render = (): Component => {
  switch (props.language.toLowerCase()) {
    case "rust":
    case "rs":
      return defineAsyncComponent({
        loader: () => import("./languages/Rust.vue"),
        loadingComponent: Fallback,
      });

    case "javascript":
    case "js":
      return h(Iconify, {
        icon: "devicon:javascript",
        class: style.icon,
      });

    case "typescript":
    case "ts":
      return h(Iconify, {
        icon: "devicon:typescript",
        class: style.icon,
      });

    case "bash":
    case "sh":
    case "shell":
      return defineAsyncComponent({
        loader: () => import("./languages/Bash.vue"),
        loadingComponent: Fallback,
      });

    case "tf":
    case "terraform":
    case "hcl":
      return h(Iconify, {
        icon: "devicon:terraform",
        class: style.icon,
      });

    case "html":
      return h(Iconify, {
        icon: "devicon:html5",
        class: style.icon,
      });

    case "css":
      return defineAsyncComponent({
        loader: () => import("./languages/Css.vue"),
        loadingComponent: Fallback,
      });

    case "npm":
      return h(Iconify, {
        icon: "devicon:npm",
        class: style.icon,
      });

    case "java":
      return h(Iconify, {
        icon: "devicon:java",
        class: style.icon,
      });

    case "kotlin":
    case "kt":
      return h(Iconify, {
        icon: "devicon:kotlin",
        class: style.icon,
      });

    case "go":
    case "golang":
      return h(Iconify, {
        icon: "logos:go",
        class: style.icon,
      });

    case "python":
    case "py":
      return h(Iconify, {
        icon: "devicon:python",
        class: style.icon,
      });

    case "sql":
      return h(Iconify, {
        icon: "vscode-icons:file-type-sql",
        class: style.icon,
      });

    case "json":
      return h(Iconify, {
        icon: "devicon:json",
        class: style.icon,
      });

    case "lua":
      return h(Iconify, {
        icon: "devicon:lua",
        class: style.icon,
      });

    case "cs":
    case "csharp":
      return h(Iconify, {
        icon: "devicon:csharp",
        class: style.icon,
      });

    case "cpp":
    case "c++":
      return h(Iconify, {
        icon: "devicon:cplusplus",
        class: style.icon,
      });

    case "c":
      return h(Iconify, {
        icon: "devicon:c",
        class: style.icon,
      });

    default:
      return Fallback;
  }
};
</script>

<style module lang="scss">
.block {
  display: inline-block;
  height: var(--size);
  width: var(--size);
}

.icon {
  height: var(--size);
  width: var(--size);
}
</style>

<style scoped lang="scss">
.v-enter-to,
.v-leave-from {
  opacity: 1;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 100ms;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
