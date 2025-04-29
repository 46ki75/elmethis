<template>
  <ElmTooltip>
    <template #original>
      <ElmMdiIcon
        :class="$style.icon"
        :d="
          isLoading ? mdiLoading : isLogin ? mdiLogoutVariant : mdiLoginVariant
        "
        :color="isLoading ? 'gray' : isLogin ? '#b36472' : '#6987b8'"
        :size="size"
      />
    </template>
    <template #tooltip>
      <ElmInlineText
        :text="isLoading ? 'Loading...' : isLogin ? 'Logout' : 'Login'"
      />
    </template>
  </ElmTooltip>
</template>

<script setup lang="ts">
import ElmTooltip from "../containments/ElmTooltip.vue";
import ElmInlineText from "../typography/ElmInlineText.vue";

import ElmMdiIcon from "./ElmMdiIcon.vue";
import { mdiLoading, mdiLoginVariant, mdiLogoutVariant } from "@mdi/js";

export interface ElmLoginIconProps {
  /**
   * Specifies the width of the icon.
   */
  size?: string;

  /**
   * Specifies whether the icon is for login or logout.
   */
  isLogin?: boolean;

  /**
   * Specifies whether the icon is loading.
   */
  isLoading?: boolean;
}

withDefaults(defineProps<ElmLoginIconProps>(), {
  size: "2rem",
});
</script>

<style module lang="scss">
.icon {
  box-sizing: border-box;
  padding: 0.25rem;
  border-radius: 0.25rem;
  cursor: pointer;

  transition: background-color 200ms;

  &:hover {
    background-color: rgba(black, 0.1);
    [data-theme="dark"] & {
      background-color: rgba(white, 0.1);
    }
  }
}
</style>
