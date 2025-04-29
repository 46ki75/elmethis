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
      return h(
        defineAsyncComponent({
          loader: () => import("./languages/Rust.vue"),
          loadingComponent: Fallback,
        }),
        { size: props.size }
      );

    case "javascript":
    case "js":
      return h(
        defineAsyncComponent({
          loader: () => import("./languages/Javascript.vue"),
          loadingComponent: Fallback,
        }),
        { size: props.size }
      );

    case "typescript":
    case "ts":
      return h(
        defineAsyncComponent({
          loader: () => import("./languages/Typescript.vue"),
          loadingComponent: Fallback,
        }),
        { size: props.size }
      );

    case "bash":
    case "sh":
    case "shell":
      return h(
        defineAsyncComponent({
          loader: () => import("./languages/Bash.vue"),
          loadingComponent: Fallback,
        }),
        { size: props.size }
      );

    case "tf":
    case "terraform":
    case "hcl":
      return h(
        defineAsyncComponent({
          loader: () => import("./languages/Terraform.vue"),
          loadingComponent: Fallback,
        }),
        { size: props.size }
      );

    case "html":
    case "html5":
      return h(
        defineAsyncComponent({
          loader: () => import("./languages/Html.vue"),
          loadingComponent: Fallback,
        }),
        { size: props.size }
      );

    case "css":
    case "css3":
      return h(
        defineAsyncComponent({
          loader: () => import("./languages/Css.vue"),
          loadingComponent: Fallback,
        }),
        { size: props.size }
      );

    case "npm":
      return h(
        defineAsyncComponent({
          loader: () => import("./languages/Npm.vue"),
          loadingComponent: Fallback,
        }),
        { size: props.size }
      );

    case "java":
      return h(
        defineAsyncComponent({
          loader: () => import("./languages/Java.vue"),
          loadingComponent: Fallback,
        }),
        { size: props.size }
      );

    case "kotlin":
    case "kt":
      return h(
        defineAsyncComponent({
          loader: () => import("./languages/Kotlin.vue"),
          loadingComponent: Fallback,
        }),
        { size: props.size }
      );

    case "go":
    case "golang":
      return h(
        defineAsyncComponent({
          loader: () => import("./languages/Go.vue"),
          loadingComponent: Fallback,
        }),
        { size: props.size }
      );

    case "python":
    case "py":
      return h(
        defineAsyncComponent({
          loader: () => import("./languages/Python.vue"),
          loadingComponent: Fallback,
        }),
        { size: props.size }
      );

    case "sql":
      return h(
        defineAsyncComponent({
          loader: () => import("./languages/Sql.vue"),
          loadingComponent: Fallback,
        }),
        { size: props.size }
      );

    case "json":
      return h(
        defineAsyncComponent({
          loader: () => import("./languages/Json.vue"),
          loadingComponent: Fallback,
        }),
        { size: props.size }
      );

    case "lua":
      return h(
        defineAsyncComponent({
          loader: () => import("./languages/Lua.vue"),
          loadingComponent: Fallback,
        }),
        { size: props.size }
      );

    case "cs":
    case "c#":
    case "csharp":
      return h(
        defineAsyncComponent({
          loader: () => import("./languages/Csharp.vue"),
          loadingComponent: Fallback,
        }),
        { size: props.size }
      );

    case "cpp":
    case "c++":
      return h(
        defineAsyncComponent({
          loader: () => import("./languages/Cplusplus.vue"),
          loadingComponent: Fallback,
        }),
        { size: props.size }
      );

    case "c":
    case "clang":
      return h(
        defineAsyncComponent({
          loader: () => import("./languages/C.vue"),
          loadingComponent: Fallback,
        }),
        { size: props.size }
      );

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
