<template>
  <span :class="$style.fragment" @click="handleHashClick(id)">#</span>
</template>

<script setup lang="ts">
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
</script>

<style module lang="scss">
.fragment {
  font-size: 1rem;
  width: 1rem;
  height: 1rem;
  padding: 0.125rem;
  margin-inline-start: 0.5rem;
  border-radius: 0.125rem;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  color: #b69545;
  cursor: pointer;
  user-select: none;
  opacity: 1;
  transition:
    background-color 200ms,
    opacity 100ms,
    transform 100ms;

  &:hover {
    background-color: rgba(#868e9c, 0.2);
  }

  &:active {
    opacity: 0.5;
    transform: translateX(1px) translateY(1px);
  }
}
</style>
