<template>
  <div :class="$style['elm-tabs']">
    <div :class="$style['tab-container']">
      <div
        v-for="(tabLabel, index) in slots.tabLabels()"
        :key="index"
        :class="[
          $style['tab'],
          { [$style['active']]: selectedTabIndex === index },
        ]"
        @click="selectTab(index)"
      >
        <component :is="tabLabel" />
      </div>
    </div>

    <div :class="$style['tab-content-container']">
      <div
        v-for="(content, index) in slots.tabContents()"
        :key="index"
        :class="[
          $style['tab-content'],
          { [$style['active']]: selectedTabIndex === index },
        ]"
      >
        <component :is="content" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type VNode } from "vue";

export interface ElmTabsProps {}

withDefaults(defineProps<ElmTabsProps>(), {});

const slots = defineSlots<{
  tabLabels: () => VNode[];
  tabContents: () => VNode[];
}>();

const selectedTabIndex = ref(0);

const selectTab = (index: number) => {
  selectedTabIndex.value = index;
};
</script>

<style module lang="scss">
.elm-tabs {
  display: flex;
  flex-direction: column;
  gap: 0;
  width: 100%;
  border: solid 1px oklch(from black l c h / 0.1);
  border-radius: 0.25rem;
  box-shadow: 0 0 0.125rem oklch(from black l c h / 0.1);
  overflow: hidden;

  background-color: oklch(from white l c h / 0.5);

  [data-theme="dark"] & {
    background-color: oklch(from black l c h / 0.1);
  }
}

.tab-container {
  display: flex;
  flex-direction: row;
  border-bottom: solid 1px oklch(from gray l c h / 0.3);
}

.tab {
  box-sizing: border-box;
  min-width: 6rem;
  padding: 1rem;
  margin: 0;
  cursor: pointer;
  border-right: dashed 1px oklch(from gray l c h / 0.2);
  border-bottom: solid 2px transparent;
  display: flex;
  align-items: center;
  justify-content: center;

  transition:
    background-color 200ms,
    border-color 200ms;

  &.active {
    background-color: oklch(from #7cbac5 l c h / 0.025);
    border-bottom-color: #7cbac5;
    cursor: default;
  }

  &:hover {
    background-color: oklch(from #7cbac5 l c h / 0.05);
  }
}

.tab-content-container {
  box-sizing: border-box;
  width: 100%;
  padding: 1em;
}

.tab-content {
  width: 100%;
  margin: 0;
  transition:
    transform 200ms,
    opacity 200ms;
  display: none;

  &.active {
    display: block;
  }

  @starting-style {
    transform: translateY(-8px);
    opacity: 0;
  }
}
</style>
