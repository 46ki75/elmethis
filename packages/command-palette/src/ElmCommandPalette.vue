<template>
  <div
    :class="$style.palette"
    :style="{
      '--height': '400px',
      '--width': '800px',
    }"
  >
    <header :class="$style.header">
      <ElmMdiIcon :d="mdiConsoleLine" />
      <input
        :class="$style.input"
        ref="inputRef"
        v-model="input"
        type="text"
        inputmode="text"
      />
    </header>

    <div :class="$style.body">
      <div v-for="command in commands" :class="$style.command">
        <img
          v-if="command.icon"
          :class="$style['command-icon']"
          :src="command.icon"
        />
        <ElmMdiIcon v-else :d="mdiConsoleLine" size="1rem" />

        <ElmInlineText :text="command.label" />
      </div>
    </div>

    <footer :class="$style.footer">
      <ElmInlineText text="Esc" :kbd="true" />
      <ElmInlineText text="Close" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue";
import { ElmMdiIcon, ElmInlineText } from "@elmethis/core";
import { mdiConsoleLine } from "@mdi/js";

export interface ElmCommandPaletteProps {
  commands: Array<{
    id: string;
    icon?: string;
    label: string;
    execute?: () => void;
  }>;
}

withDefaults(defineProps<ElmCommandPaletteProps>(), {});

const input = defineModel({ default: "" });
const inputTarget = useTemplateRef<HTMLInputElement>("inputRef");

onMounted(() => {
  inputTarget.value?.focus();
});
</script>

<style module lang="scss">
.palette {
  max-height: calc(100vh - 2rem);
  max-width: calc(100vw - 1rem);
  height: var(--height);
  width: var(--width);
  display: flex;
  flex-direction: column;
  border-radius: 0.25rem;
  overflow: hidden;
  box-shadow: 0 0 0.125rem rgba(#3e434b, 0.25);
}

.header {
  box-sizing: border-box;
  height: 3rem;
  padding: 0.5rem;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  background-color: rgba(#cccfd5, 0.4);
  color: #3e434b;
  font-size: 1.1rem;
  border-bottom: 1px solid rgba(#cccfd5, 0.75);
}

.input {
  all: unset;
  caret-color: #788191;
  font-family: monospace;
}

.body {
  width: 100%;
  height: 100%;
  background-color: rgba(#cccfd5, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: scroll;
}

.command {
  box-sizing: border-box;
  padding: 1rem;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(#cccfd5, 0.5);
}

.command-icon {
  height: 1.5rem;
}

.footer {
  box-sizing: border-box;
  padding: 0.5rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(#cccfd5, 0.4);
  border-top: 1px solid rgba(#cccfd5, 0.75);
}
</style>
