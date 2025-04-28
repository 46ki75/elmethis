<template>
  <div>
    <div :class="$style.container">
      <div
        v-for="(char, index) in paddedInputRef.split('')"
        :class="[
          $style['char-box'],
          {
            [$style.focused]: focused && selectedIndex === index,
            [$style.loading]: loading,
          },
        ]"
        @click="select(index)"
      >
        <span :class="$style.char" v-if="char !== ' '">
          {{ char }}
        </span>
      </div>

      <Icon icon="heroicons:backspace" :class="$style.icon" @click="reset" />
    </div>

    <input
      aria-hidden
      type="text"
      :class="$style['dummy-input']"
      v-model="inputModel"
      ref="targetRef"
      :maxlength="length"
      @input="onInputChange"
      :disabled="loading"
    />
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { useFocus } from "@vueuse/core";
import { nextTick, onMounted, ref, computed } from "vue";

export interface ElmTotpProps {
  length: number;
  focusOnMount?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<ElmTotpProps>(), {
  focusOnMount: true,
  loading: false,
});

const inputModel = ref<string>("");

const paddedInputRef = computed(() => {
  return inputModel.value.padEnd(props.length, " ");
});

const targetRef = ref<HTMLInputElement | null>(null);
const { focused } = useFocus(targetRef);
const selectedIndex = ref<number | null>(0);

const select = (index: number) => {
  selectText(index);
  selectedIndex.value = index;
};

const selectText = (index: number): void => {
  if (targetRef.value) {
    targetRef.value.focus();
    targetRef.value.setSelectionRange(index, index + 1);
  }
};

const handleInput = () => {
  if (focused.value && selectedIndex.value !== null) {
    if (selectedIndex.value < props.length - 1) {
      select(selectedIndex.value + 1);
    } else {
      select(0);
    }
  }
};

const onInputChange = () => {
  const inputValue = targetRef.value?.value ?? "";
  inputModel.value = inputValue.slice(0, props.length);
  handleInput();
};

const reset = () => {
  inputModel.value = "";
  nextTick(() => select(0));
};

onMounted(() => {
  inputModel.value = "";
  if (props.focusOnMount) nextTick(() => select(0));
});
</script>

<style module lang="scss">
.dummy-input {
  all: unset;
  height: 0px;
}

.container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.char-box {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 3.5rem;
  height: 4rem;
  border: solid 1px #ccc;
  border-radius: 0.25rem;

  transition:
    border-color 100ms,
    background-color 100ms,
    opacity 100ms;

  background-color: rgba(black, 0.025);
  [data-theme="dark"] & {
    background-color: rgba(white, 0.025);
  }
}

.focused {
  border-color: #6987b8;
  background-color: rgba(#6987b8, 0.05);
}

.loading {
  opacity: 0.5;
  background-color: rgba(black, 0.2);
  [data-theme="dark"] & {
    background-color: rgba(white, 0.2);
  }
}

.char {
  font-size: 1.75rem;
  font-family: monospace;
  color: rgba(black, 0.7);
  [data-theme="dark"] & {
    color: rgba(white, 0.7);
  }
}

.icon {
  width: 24px;
  height: 24px;
  padding: 0.5rem;
  border-radius: 50%;

  transition: background-color 200ms;

  color: rgba(black, 0.7);
  &:hover {
    background-color: rgba(black, 0.05);
  }

  [data-theme="dark"] & {
    color: rgba(white, 0.7);
    &:hover {
      background-color: rgba(white, 0.05);
    }
  }
}
</style>
