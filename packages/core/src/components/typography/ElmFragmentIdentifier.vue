<template>
  <span :class="$style.fragment">
    <ElmMdiIcon
      size="1.25rem"
      color="#6987b8"
      :d="mdiAnchor"
      :class="$style.icon"
      @click="handleHashClick(id)"
    />
    <ElmMdiIcon
      size="1.25rem"
      color="#6987b8"
      :d="mdiLinkVariant"
      :class="$style.icon"
      @click="handleLinkClick(id)"
    />
  </span>
</template>

<script setup lang="ts">
import { useClipboard } from "@vueuse/core";
import { nextTick, onMounted } from "vue";

import ElmMdiIcon from "../icon/ElmMdiIcon.vue";
import { mdiAnchor, mdiLinkVariant } from "@mdi/js";

export interface ElmFragmentIdentifierProps {
  /**
   * ID of the heading element.
   */
  id: string;
}

withDefaults(defineProps<ElmFragmentIdentifierProps>(), {});

const handleHashClick = (id: string) => {
  const url = new URL(window.location.href);
  url.hash = id;
  window.history.replaceState(null, "", url.toString());

  const target = document.getElementById(id);
  if (target != null) {
    target.scrollIntoView({ behavior: "smooth" });
  }
};

const handleLinkClick = (id: string) => {
  const url = new URL(window.location.href);
  url.hash = id;
  window.history.replaceState(null, "", url.toString());

  copy(window.location.href);
};

const { copy } = useClipboard();

onMounted(() => {
  nextTick(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith("#")) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  });
});
</script>

<style module lang="scss">
.fragment {
  position: absolute;
  right: 0;
  bottom: -2.5rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.icon {
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 200ms;
  cursor: pointer;

  &:hover {
    background-color: rgba(black, 0.1);
    [data-theme="dark"] & {
      background-color: rgba(white, 0.1);
    }
  }
}
</style>
