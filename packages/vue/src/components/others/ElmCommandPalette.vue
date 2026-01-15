<template>
  <div
    :class="$style.palette"
    :style="{
      '--height': '500px',
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
      <transition-group name="fade">
        <div v-if="searchResults.length === 0" :class="$style['empty-result']">
          <ElmInlineText text="search anything..." />
        </div>

        <button
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
          <img
            v-if="command.icon"
            :class="$style['command-icon']"
            :src="command.icon"
          />
          <ElmMdiIcon v-else :d="mdiConsoleLine" size="1rem" />

          <div
            :class="$style.tag"
            :style="{
              '--tag-color':
                command.tag != null
                  ? opacify(-0.3, TAG_COLOR_MAP[command.tag?.color])
                  : undefined,
            }"
          >
            {{ command.tag?.name }}
          </div>

          <ElmInlineText
            :text="command.label"
            style="
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: 24rem;
            "
          />

          <ElmInlineText
            :text="command.description ?? '-'"
            style="
              opacity: 0.4;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            "
          />

          <div>
            <ElmMdiIcon :d="mdiKeyboardReturn" />
          </div>
        </button>
      </transition-group>
    </div>

    <footer :class="$style.footer">
      <ElmInlineText text="Esc" :kbd="true" />
      <ElmInlineText text="Close" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { opacify } from "polished";
import { watch, onMounted, ref, useTemplateRef } from "vue";
import ElmMdiIcon from "../icon/ElmMdiIcon.vue";
import ElmInlineText from "../typography/ElmInlineText.vue";

import { mdiConsoleLine, mdiKeyboardReturn } from "@mdi/js";

import Fuse from "fuse.js";
import { onKeyStroke } from "@vueuse/core";

const TAG_COLOR_MAP = {
  brown: "#a17c5b",
  crimson: "#c56565",
  amber: "#d48b70",
  gold: "#cdb57b",
  emerald: "#59b57c",
  cyan: "#59a7b5",
  blue: "#6987b8",
  purple: "#9771bd",
  pink: "#c9699e",
};

export interface Command {
  id: string;
  icon?: string;
  label: string;
  tag?: {
    name: string;
    color: keyof typeof TAG_COLOR_MAP;
  };
  description?: string;
  keywords?: string[];
  onInvoke?: () => void;
}

export interface ElmCommandPaletteProps {
  commands: Command[];
  onCommandInvoked?: (command?: Command) => void;
}

const props = withDefaults(defineProps<ElmCommandPaletteProps>(), {});

const input = defineModel({ default: "" });
const inputTarget = useTemplateRef<HTMLInputElement>("inputRef");

const fuse = ref<Fuse<ElmCommandPaletteProps["commands"][number]> | null>(null);
const searchResults = ref<ElmCommandPaletteProps["commands"]>([]);
const selectedCommandIndex = defineModel<number | null>(
  "selectedCommandIndex",
  { default: null }
);

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
  height: clamp(300px, var(--height), calc(100vh - 2rem));
  width: clamp(300px, var(--width), calc(100vw - 1rem));
  display: flex;
  flex-direction: column;
  border-radius: 0.25rem;
  overflow: hidden;
  box-shadow: 0 0 0.125rem rgba(#3e434b, 0.5);
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
  background-color: #e1e3e6;
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
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #ecedef;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-x: hidden;
  overflow-y: hidden;
  user-select: none;

  [data-theme="dark"] & {
    background-color: #3e434b;
  }
}

.empty-result {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.command {
  all: unset;
  box-sizing: border-box;
  padding: 0 0.75rem;
  min-height: 3rem;
  width: 100%;
  display: grid;
  grid-template-columns: 2rem minmax(min-content, 1fr) minmax(min-content, 1fr) 50fr 2rem;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid rgba(#cccfd5, 0.5);
  transition: background-color 100ms;
  cursor: pointer;
  overflow: hidden;

  border-left: solid 4px transparent;

  &:hover {
    background-color: rgba(#6987b8, 0.2);
  }

  [data-theme="dark"] & {
    border-bottom: 1px solid rgba(#cccfd5, 0.2);
  }
}

.command-selected {
  background-color: rgba(#6987b8, 0.1);
  border-color: rgba(#868e9c, 0.5);
}

.command-icon {
  height: 1.5rem;
}

.tag {
  box-sizing: border-box;
  padding: 0.125rem 0.25rem;
  border-radius: 0.125rem;
  background-color: var(--tag-color);
  color: white;
  opacity: 0.7;
}

.footer {
  box-sizing: border-box;
  padding: 0.5rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  background-color: #e1e3e6;
  border-top: 1px solid rgba(#cccfd5, 0.75);
  user-select: none;

  [data-theme="dark"] & {
    border-color: rgba(#cccfd5, 0.3);
    background-color: #33373e;
  }
}
</style>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 100ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(0.5rem);
}
</style>
