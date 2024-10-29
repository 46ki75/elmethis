<template>
  <div class="wrapper" :style="{ width: '64px', height: '64px' }">
    <div v-for="n in 3" :key="n" aria-hidden></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{}>()
</script>

<style scoped lang="scss">
@keyframes bounce {
  0% {
    transform: translateY(0%) scaleY(0.3) scaleX(1.5);
  }

  10% {
    transform: scaleY(0.8) scaleX(1.2);
  }

  100% {
    transform: translateY(-400%) scaleY(1.1);
  }
}

.wrapper {
  position: relative;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;

  div {
    width: 20%;
    height: 20%;
    border-radius: 50%;
    animation-name: bounce;
    animation-duration: 0.4s;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-timing-function: ease-out;

    background-color: black;

    [data-theme='dark'] & {
      background-color: white;
    }

    &:nth-last-of-type(1) {
      animation-delay: -100ms;
    }

    &:nth-last-of-type(2) {
      animation-delay: 0ms;
    }

    &:nth-last-of-type(3) {
      animation-delay: 100ms;
    }
  }
}
</style>
