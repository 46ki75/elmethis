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
      <div v-if="searchResults.length === 0" :class="$style['empty-result']">
        <ElmInlineText text="search anything..." />
      </div>

      <div
        v-else
        v-for="(command, index) in searchResults"
        :class="[
          $style.command,
          {
            [$style['command-selected']]: index === selectedCommandIndex,
          },
        ]"
        @click="
          () => {
            selectedCommandIndex = index;
            invoke();
          }
        "
      >
        <div :class="$style['command-inner-flex']">
          <img
            v-if="command.icon"
            :class="$style['command-icon']"
            :src="command.icon"
          />
          <ElmMdiIcon v-else :d="mdiConsoleLine" size="1rem" />
          <ElmInlineText :text="command.label" />
        </div>

        <div :class="$style['command-inner-flex']">
          <ElmMdiIcon :d="mdiKeyboardReturn" />
        </div>
      </div>
    </div>

    <footer :class="$style.footer">
      <ElmInlineText text="Esc" :kbd="true" />
      <ElmInlineText text="Close" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, ref, useTemplateRef } from "vue";
import { ElmMdiIcon, ElmInlineText } from "@elmethis/core";
import { mdiConsoleLine, mdiKeyboardReturn } from "@mdi/js";

import Fuse from "fuse.js";
import { onKeyStroke } from "@vueuse/core";

interface Command {
  id: string;
  icon?: string;
  label: string;
  description?: string;
  keywords?: string[];
  onInvoke?: () => void;
}

export interface ElmCommandPaletteProps {
  commands: Command[];
  onCommandInvoked?: (command: Command) => void;
}

const props = withDefaults(defineProps<ElmCommandPaletteProps>(), {});

const input = defineModel({ default: "" });
const inputTarget = useTemplateRef<HTMLInputElement>("inputRef");

const fuse = ref<Fuse<ElmCommandPaletteProps["commands"][number]> | null>(null);
const searchResults = ref<ElmCommandPaletteProps["commands"]>([]);
const selectedCommandIndex = ref<number | null>(null);

const FUSE_OPTION = Object.freeze({ keys: ["label", "keywords"] });

onMounted(() => {
  inputTarget.value?.focus();

  if (fuse.value == null) {
    fuse.value = new Fuse(props.commands, FUSE_OPTION);
  }
});

const search = (input: string): void => {
  if (fuse.value == null) {
    fuse.value = new Fuse(props.commands, FUSE_OPTION);
  }

  const results = fuse.value.search(input).map((result) => result.item);

  searchResults.value = results;

  selectedCommandIndex.value = 0;
};

const next = () => {
  if (selectedCommandIndex.value == null) {
    selectedCommandIndex.value = 0;
  } else if (searchResults.value.length - 1 > selectedCommandIndex.value) {
    selectedCommandIndex.value = selectedCommandIndex.value + 1;
  }
};

const prev = () => {
  if (selectedCommandIndex.value == null) {
    selectedCommandIndex.value = 0;
  } else if (selectedCommandIndex.value > 0) {
    selectedCommandIndex.value = selectedCommandIndex.value - 1;
  }
};

const invoke = () => {
  if (selectedCommandIndex.value !== null) {
    const command = searchResults.value[selectedCommandIndex.value];
    if (command != null && command.onInvoke != null) {
      command.onInvoke();
      if (props.onCommandInvoked) props.onCommandInvoked(command);
    }
  }
};

onKeyStroke(["ArrowDown", "Tab"], (e) => {
  e.preventDefault();
  next();
});

onKeyStroke("ArrowUp", (e) => {
  e.preventDefault();
  prev();
});

onKeyStroke("Enter", (e) => {
  e.preventDefault();
  invoke();
});

watch(input, (_, input) => {
  search(input);
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

  [data-theme="dark"] & {
    border-color: rgba(#cccfd5, 0.3);
    background-color: #33373e;
  }
}

.input {
  all: unset;
  width: 100%;
  caret-color: #788191;
  font-family: monospace;

  color: #3e434b;

  [data-theme="dark"] & {
    color: #cccfd5;
  }
}

.body {
  width: 100%;
  height: 100%;
  background-color: rgba(#cccfd5, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: scroll;
  user-select: none;

  [data-theme="dark"] & {
    background-color: #3e434b;
  }
}

.empty-result {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.command {
  box-sizing: border-box;
  padding: 1rem;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(#cccfd5, 0.5);
  transition: background-color 100ms;
  cursor: pointer;

  &:hover {
    background-color: rgba(#6987b8, 0.2);
  }

  [data-theme="dark"] & {
    border-bottom: 1px solid rgba(#cccfd5, 0.2);
  }
}

.command-selected {
  background-color: rgba(#6987b8, 0.1);
}

.command-inner-flex {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
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
  user-select: none;

  [data-theme="dark"] & {
    border-color: rgba(#cccfd5, 0.3);
    background-color: #33373e;
  }
}
</style>
