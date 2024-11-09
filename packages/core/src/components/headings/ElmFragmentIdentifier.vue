<template>
  <div :class="$style.fragment">
    <LinkIcon :class="$style.icon" @click="handleLinkClick(id)" />
  </div>
</template>

<script setup lang="ts">
import { LinkIcon } from '@heroicons/vue/24/outline'

export interface ElmFragmentIdentifierProps {
  /**
   * ID of the heading element.
   */
  id: string
}

withDefaults(defineProps<ElmFragmentIdentifierProps>(), {})

const handleLinkClick = (id: string) => {
  const target = document.getElementById(id)
  if (target != null) {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style module lang="scss">
.fragment {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.icon {
  padding: 0.25rem;
  border-radius: 0.25rem;
  width: 20px;
  height: 20px;
  color: #6987b8;
  transition: background-color 200ms;
  cursor: pointer;

  &:hover {
    background-color: rgba(black, 0.1);
    [data-theme='dark'] & {
      background-color: rgba(white, 0.1);
    }
  }
}
</style>
