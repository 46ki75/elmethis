<template>
  <teleport to="body">
    <transition
      :leave-from-class="fadeStyle['fade-leave-from']"
      :enter-to-class="fadeStyle['fade-enter-to']"
      :enter-active-class="fadeStyle['fade-enter-active']"
      :leave-active-class="fadeStyle['fade-leave-active']"
      :enter-from-class="fadeStyle['fade-enter-from']"
      :leave-to-class="fadeStyle['fade-leave-to']"
    >
      <div v-if="isOpen" :class="$style.modal">
        <div :class="$style.window">
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
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { VNode, ref } from "vue";
import ElmButton from "../form/ElmButton.vue";
import ElmMdiIcon from "../icon/ElmMdiIcon.vue";
import { mdiArrowLeft, mdiCheckCircle } from "@mdi/js";

import fadeStyle from "../../styles/transition-fade.module.scss";
import ElmHeading from "../typography/ElmHeading.vue";

export interface ElmConfirmModalProps {
  title: string;
  onConfirm: () => void | Promise<void>;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

const props = withDefaults(defineProps<ElmConfirmModalProps>(), {});

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
.modal {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(#23262a, 0.8);
}

.window {
  box-sizing: border-box;
  max-width: min(500px, calc(100vw - 1rem));
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.25rem;
  background-color: rgba(white, 0.8);
}

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
