<template>
  <div
    class="cube"
    :style="{
      width: `${size}px`,
      height: `${size}px`
    }"
  >
    <div
      v-for="face in faces"
      :key="face.name"
      class="face"
      :style="{
        transform: `${face.rotate} ${commonTranslateZ}`
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface ElmCubeIconProps {
  /**
   * The size of the cube [px]
   */
  size?: number
}

const props = withDefaults(defineProps<ElmCubeIconProps>(), {
  size: 128
})

const commonTranslateZ = computed(() => `translateZ(${props.size / 2}px)`)

const faces = [
  { name: 'front', rotate: '' },
  { name: 'back', rotate: 'rotateY(180deg)' },
  { name: 'left', rotate: 'rotateY(-90deg)' },
  { name: 'right', rotate: 'rotateY(90deg)' },
  { name: 'top', rotate: 'rotateX(90deg)' },
  { name: 'bottom', rotate: 'rotateX(-90deg)' }
]
</script>

<style scoped lang="scss">
.cube {
  position: relative;
  transform-style: preserve-3d;
  transform: rotateX(-30deg) rotateY(-45deg);
  animation: elmethis-cube-icon-rotate 1500ms infinite linear;
}

.face {
  position: absolute;
  width: 100%;
  height: 100%;
  border-width: 1px;
  border-style: solid;
  border-radius: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  backface-visibility: hidden;
  user-select: none;

  border-style: solid;
  border-width: 1px;
  border-color: rgba(0, 0, 0, 0.7);
  background-color: rgba(255, 255, 255, 0.2);
  [data-theme='dark'] & {
    border-color: rgba(255, 255, 255, 0.7);
    background-color: rgba(0, 0, 0, 0.2);
  }
}

@keyframes elmethis-cube-icon-rotate {
  from {
    transform: rotateX(-30deg) rotateY(-45deg) rotateZ(0deg);
  }
  to {
    transform: rotateX(-30deg) rotateY(315deg) rotateZ(360deg);
  }
}
</style>
