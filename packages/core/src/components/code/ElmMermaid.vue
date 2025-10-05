<template>
  <pre
    :class="[
      $style.mermaid,
      {
        [$style.raw]: !isRendered,
        [$style.rendered]: isRendered,
      },
    ]"
    >{{ code }}</pre
  >
</template>

<script setup lang="ts">
import mermaid from "mermaid";
import { onMounted, ref, useCssModule } from "vue";

export interface ElmMermaidProps {
  code: string;
}

withDefaults(defineProps<ElmMermaidProps>(), {});

const classes = useCssModule();
const isRendered = ref(false);

onMounted(async () => {
  console.log("classes.mermaid");
  mermaid.initialize({ startOnLoad: false });
  await mermaid.run({
    querySelector: `.${classes.mermaid}`,
  });
  isRendered.value = true;
});
</script>

<style module lang="scss">
.mermaid {
  display: block;
}

.raw {
  opacity: 0;
}

.rendered {
  opacity: 1;
}
</style>
