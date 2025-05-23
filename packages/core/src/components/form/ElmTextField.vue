<template>
  <div
    :class="[$style.wrapper, { [$style.active]: isFocused }]"
    :style="{
      backgroundColor: disabled || loading ? 'rgba(0,0,0,0.15)' : undefined,
    }"
  >
    <div :class="$style.header">
      <label
        :for="id"
        :class="$style.label"
        :style="{ '--color': isFocused ? '#59b57c' : undefined }"
      >
        <span>{{ label }}</span>
        <span v-if="required" :class="$style.requierd">*</span>
      </label>
      <ElmInlineText
        v-if="maxLength != null"
        :text="`${input.length} / ${maxLength}`"
        :color="input.length > maxLength ? '#c56565' : 'gray'"
        size="0.75rem"
      />
    </div>
    <div :class="$style.body">
      <ElmMdiIcon v-if="icon" :d="iconMap[icon]" size="1.5rem" color="gray" />

      <input
        :id="id"
        v-model="input"
        :type="type"
        :class="$style.input"
        :placeholder="placeholder"
        @focus="isFocused = true"
        @blur="isFocused = false"
        :disabled="disabled || loading"
        :style="{
          cursor: disabled ? 'not-allowed' : loading ? 'progress' : 'auto',
        }"
        :aria-required="required"
      />

      <div :class="$style['icon-box']">
        <span :class="$style.suffix">
          <ElmInlineText v-if="suffix != null" :text="suffix" />
        </span>

        <ElmMdiIcon
          :d="type === 'text' ? mdiEyeOutline : mdiEyeOffOutline"
          size="1.75em"
          color="gray"
          :class="$style.icon"
          @click="handleVisibleSwitch"
        />

        <ElmMdiIcon
          :d="mdiBackspaceOutline"
          size="1.75em"
          color="gray"
          :class="$style.icon"
          @click="handleDelete"
        />
      </div>
    </div>

    <div
      :class="$style.loading"
      :style="{
        opacity: loading ? 0.2 : 0,
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import ElmInlineText from "../typography/ElmInlineText.vue";
import { ref } from "vue";
import { nanoid } from "nanoid";

import ElmMdiIcon from "../icon/ElmMdiIcon.vue";
import {
  mdiEyeOutline,
  mdiEyeOffOutline,
  mdiBackspaceOutline,
  mdiText,
  mdiPen,
  mdiEmail,
  mdiAccount,
  mdiLock,
  mdiKey,
  mdiEarth,
  mdiTag,
  mdiArchive,
  mdiLinkVariant,
} from "@mdi/js";

const id = nanoid();

const isFocused = ref<boolean>(false);

export interface ElmTextFieldProps {
  label: string;
  maxLength?: number;
  suffix?: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?:
    | "text"
    | "pen"
    | "email"
    | "user"
    | "lock"
    | "key"
    | "earth"
    | "tag"
    | "archive"
    | "link";
  isPassword?: boolean;
  required?: boolean;
}

const props = withDefaults(defineProps<ElmTextFieldProps>(), {
  disabled: false,
  loading: false,
  isPassword: false,
  required: false,
});

const input = defineModel({ default: "" });

const type = ref(props.isPassword ? "password" : "text");

const handleDelete = () => {
  if (!props.loading && !props.disabled) input.value = "";
};

const handleVisibleSwitch = () => {
  if (!props.loading && !props.disabled)
    type.value = type.value === "text" ? "password" : "text";
};

const iconMap: Record<NonNullable<ElmTextFieldProps["icon"]>, string> = {
  text: mdiText,
  pen: mdiPen,
  email: mdiEmail,
  user: mdiAccount,
  lock: mdiLock,
  key: mdiKey,
  earth: mdiEarth,
  tag: mdiTag,
  archive: mdiArchive,
  link: mdiLinkVariant,
};
</script>

<style module lang="scss">
@keyframes loading {
  0% {
    transform-origin: 0%;
    transform: scaleX(0);
  }

  40% {
    transform-origin: 0%;
    transform: scaleX(1);
  }

  60% {
    transform-origin: 100%;
    transform: scaleX(1);
  }

  100% {
    transform-origin: 100%;
    transform: scaleX(0);
  }
}

.loading {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: #6987b8;
  transition: opacity 200ms;
  pointer-events: none;

  animation-name: loading;
  animation-iteration-count: infinite;
  animation-duration: 1600ms;
}

.wrapper {
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  transition:
    border-color 200ms,
    background-color 200ms;

  border-style: solid;
  border-width: 1px;
  border-color: transparent;

  background-color: rgba(white, 0.8);
  box-shadow: 0 0 0.125rem rgba(black, 0.15);

  [data-theme="dark"] & {
    background-color: rgba(white, 0.15);
    box-shadow: 0 0 0.125rem rgba(black, 0.75);
  }
}

.active {
  border-color: rgba(#59b57c, 0.5);
}

.header {
  box-sizing: border-box;
  height: 0.75rem;
  padding: 0 0.25rem;
  display: flex;
  justify-content: space-between;
}

.label {
  display: inline;
  margin: 0;
  padding: 0;
  font-size: 0.75rem;
  line-height: 0.75rem;
  height: 0.75rem;
  vertical-align: top;
  transition: color 200ms;

  color: var(--color, rgba(black, 0.65));

  [data-theme="dark"] & {
    color: var(--color, rgba(white, 0.65));
  }
}

.requierd {
  padding-inline: 0.25rem;
  color: #c56565;
  font-weight: bold;
}

.body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 0.25rem;
  padding-left: 0.25rem;
}

.left-icon {
  margin: auto 0.25rem;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.7;

  [data-theme="dark"] & {
    filter: invert(1);
  }
}

.input {
  all: unset;
  box-sizing: border-box;
  padding: 0.5rem;
  width: 100%;
  color: rgba(black, 0.7);
  caret-color: rgba(black, 0.7);

  &::placeholder {
    opacity: 0.5;

    [data-theme="dark"] & {
      opacity: 0.7;
    }
  }

  &::selection {
    background-color: rgba(black, 0.7);
    color: rgba(white, 0.7);
  }

  [data-theme="dark"] & {
    color: rgba(white, 0.7);
    caret-color: rgba(white, 0.7);

    &::selection {
      background-color: rgba(white, 0.7);
      color: rgba(black, 0.7);
    }
  }
}

.icon-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icon {
  box-sizing: border-box;
  border-radius: 0.125em;
  padding: 0.25rem;
  transition: background-color 200ms;
  cursor: pointer;

  &:hover {
    background-color: rgba(gray, 0.2);
  }
}

.suffix {
  opacity: 0.6;
  padding: 0 0.5rem;
  user-select: none;
}
</style>
