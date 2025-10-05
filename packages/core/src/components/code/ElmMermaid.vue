<template>
  <div
    ref="svgRef"
    :class="[
      $style.mermaid,
      {
        [$style.raw]: !isRendered,
        [$style.rendered]: isRendered,
      },
    ]"
  ></div>
</template>

<script setup lang="ts">
import { onMounted, ref, useCssModule, useTemplateRef, watch } from "vue";

export interface ElmMermaidProps {
  code: string;
}

const props = withDefaults(defineProps<ElmMermaidProps>(), {});

const classes = useCssModule();

const isRendered = ref(false);
const elementRef = useTemplateRef<HTMLDivElement>("svgRef");

const renderMermaid = async () => {
  if (!elementRef.value) return;

  isRendered.value = false;
  const { default: mermaid } = await import("mermaid");

  try {
    mermaid.initialize({ startOnLoad: false, theme: "default" });
    const { svg } = await mermaid.render(classes.mermaid, props.code);
    elementRef.value.innerHTML = svg;
    isRendered.value = true;
  } catch (error) {
    console.error("Mermaid render error:", error);
    elementRef.value.innerHTML = `<pre>${props.code}</pre>`;
  }
};

watch(() => props.code, renderMermaid);

onMounted(renderMermaid);
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
