<template>
  <ElmModal v-model="isOpen" :close-on-click-outside="closeOnClickOutside">
    <div>
      <ElmHeading :level="2" disable-fragment-identifier>
        {{ title }}
      </ElmHeading>

      <div :class="$style.body">
        <slot />
      </div>

      <div :class="$style.button">
        <ElmButton block @click="isOpen = false" :loading="loading">
          <ElmMdiIcon :d="mdiArrowLeft" />
          <span>Cancel</span>
        </ElmButton>

        <ElmButton block @click="handleConfirm" primary :loading="loading">
          <ElmMdiIcon :d="mdiCheckCircle" color="currentColor" />
          <span> Confirm </span>
        </ElmButton>
      </div>
    </div>
  </ElmModal>
</template>

<script setup lang="ts">
import { VNode, ref } from "vue";
import ElmButton from "../form/ElmButton.vue";
import ElmMdiIcon from "../icon/ElmMdiIcon.vue";
import { mdiArrowLeft, mdiCheckCircle } from "@mdi/js";

import ElmHeading from "../typography/ElmHeading.vue";
import ElmModal from "./ElmModal.vue";

export interface ElmConfirmModalProps {
  title: string;
  closeOnClickOutside?: boolean;
  onConfirm: () => void | Promise<void>;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

const props = withDefaults(defineProps<ElmConfirmModalProps>(), {
  closeOnClickOutside: true,
});

const isOpen = defineModel<boolean>({ default: false });
const loading = ref(false);

const handleConfirm = async () => {
  loading.value = true;
  try {
    await props.onConfirm();
    loading.value = false;
    isOpen.value = false;
    if (props.onSuccess) props.onSuccess();
  } catch (e) {
    if (props.onError) props.onError(e);
    loading.value = false;
    isOpen.value = false;
  }
};

defineSlots<{
  default?: () => VNode;
}>();
</script>

<style module lang="scss">
.body {
  margin-block: 3rem;
}

.button {
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}
</style>
