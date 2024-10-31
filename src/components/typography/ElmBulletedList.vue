<template>
  <ul class="elmethis-bulleted-list">
    <slot />
  </ul>
</template>

<script setup lang="ts">
export interface ElmBulletedListProps {}

withDefaults(defineProps<ElmBulletedListProps>(), {})
</script>

<style lang="scss">
.elmethis-bulleted-list {
  box-sizing: border-box;
  padding-left: 1.25rem;

  li {
    box-sizing: border-box;
    padding-left: 0.5rem;
    margin-block: 0.75rem;

    &::marker {
      content: url('data:image/svg+xml;base64,ICA8c3ZnCiAgICB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnCiAgICB2aWV3Qm94PScwIDAgMTYgMTYnCiAgICB3aWR0aD0nMTJweCcKICAgIGhlaWdodD0nMTJweCcKICA+CiAgICA8cGF0aAogICAgICBmaWxsPScjNDQ5NzYzJwogICAgICBvcGFjaXR5PScwLjgnCiAgICAgIGQ9J00zIDMuNzMyYTEuNSAxLjUgMCAwIDEgMi4zMDUtMS4yNjVsNi43MDYgNC4yNjdhMS41IDEuNSAwIDAgMSAwIDIuNTMxbC02LjcwNiA0LjI2OEExLjUgMS41IDAgMCAxIDMgMTIuMjY3VjMuNzMyWicKICAgIC8+CiAgPC9zdmc+');
    }

    ul {
      li {
        &::marker {
          content: url('data:image/svg+xml;base64,ICA8c3ZnCiAgICB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnCiAgICB2aWV3Qm94PScwIDAgMjQgMjQnCiAgICB3aWR0aD0nMTJweCcKICAgIGhlaWdodD0nMTJweCcKICAgIHN0cm9rZT0nIzQ0OTc2MycKICAgIGZpbGw9J3RyYW5zcGFyZW50JwogID4KICAgIDxwYXRoCiAgICAgIHN0cm9rZUxpbmVjYXA9J3JvdW5kJwogICAgICBzdHJva2VMaW5lam9pbj0ncm91bmQnCiAgICAgIGQ9J001LjI1IDUuNjUzYzAtLjg1Ni45MTctMS4zOTggMS42NjctLjk4NmwxMS41NCA2LjM0N2ExLjEyNSAxLjEyNSAwIDAgMSAwIDEuOTcybC0xMS41NCA2LjM0N2ExLjEyNSAxLjEyNSAwIDAgMS0xLjY2Ny0uOTg2VjUuNjUzWicKICAgIC8+CiAgPC9zdmc+');
        }
        ul {
          li {
            &::marker {
              content: url('data:image/svg+xml;base64,ICA8c3ZnCiAgICB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnCiAgICB2aWV3Qm94PScwIDAgMjAgMjAnCiAgICB3aWR0aD0nMTJweCcKICAgIGhlaWdodD0nMTJweCcKICAgIHN0cm9rZT0nIzQ0OTc2MycKICAgIGZpbGw9JyM0NDk3NjMnCiAgPgogICAgPHBhdGgKICAgICAgZmlsbFJ1bGU9J2V2ZW5vZGQnCiAgICAgIGQ9J004LjIyIDUuMjJhLjc1Ljc1IDAgMCAxIDEuMDYgMGw0LjI1IDQuMjVhLjc1Ljc1IDAgMCAxIDAgMS4wNmwtNC4yNSA0LjI1YS43NS43NSAwIDAgMS0xLjA2LTEuMDZMMTEuOTQgMTAgOC4yMiA2LjI4YS43NS43NSAwIDAgMSAwLTEuMDZaJwogICAgICBjbGlwUnVsZT0nZXZlbm9kZCcKICAgIC8+CiAgPC9zdmc+');
            }
          }
        }
      }
    }
  }
}
</style>
