<template>
  <ol class="elmethis-numbered-list">
    <slot />
  </ol>
</template>

<script setup lang="ts">
withDefaults(defineProps<{}>(), {})
</script>

<style lang="scss">
.elmethis-numbered-list {
  box-sizing: border-box;
  padding-left: 1.25rem;

  li {
    box-sizing: border-box;
    padding-left: 0.25rem;
    margin-block: 0.75rem;
    margin-left: 0.25rem;

    list-style-type: decimal;
    &::marker {
      color: #9771bd;
    }

    ol {
      li {
        list-style-type: lower-alpha;
        ol {
          li {
            list-style-type: lower-roman;
            ol {
              li {
                list-style-type: lower-greek;
              }
            }
          }
        }
      }
    }
  }
}
</style>
