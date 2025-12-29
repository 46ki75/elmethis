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
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from "vue";

export interface ElmMermaidProps {
  code: string;
}

const props = withDefaults(defineProps<ElmMermaidProps>(), {});

const isRendered = ref(false);
const elementRef = useTemplateRef<HTMLDivElement>("svgRef");

// Generate unique ID for this component instance
const componentId = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
let renderCount = 0;
let mermaidInstance: any = null;

const renderMermaid = async () => {
  if (!elementRef.value) return;

  isRendered.value = false;

  try {
    // Import mermaid only once per component
    if (!mermaidInstance) {
      const { default: mermaid } = await import("mermaid");

      // Initialize only once per component instance
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: {
          mainBkg: "#fbfcff",
          lineColor: "#606875",
          primaryColor: "#6c7483",
          secondaryColor: "#e9dec5",
          tertiaryColor: "#f5f6f8",
          tertiaryBorderColor: "#e2d4b2",
          tertiaryTextColor: "#b69545",
          signalColor: "#949ba7",
        },
      });

      mermaidInstance = mermaid;
    }

    // Use unique ID for each render to avoid collisions
    const renderId = `${componentId}-${renderCount++}`;
    const { svg } = await mermaidInstance.render(renderId, props.code);

    elementRef.value.innerHTML = svg;
    isRendered.value = true;
  } catch (error) {
    console.error("Mermaid render error:", error);
    elementRef.value.innerHTML = `<pre>${props.code}</pre>`;
    isRendered.value = true; // Still mark as rendered to show error
  }
};

watch(() => props.code, renderMermaid);

onMounted(renderMermaid);

onUnmounted(() => {
  // Cleanup
  if (elementRef.value) {
    elementRef.value.innerHTML = "";
  }
  mermaidInstance = null;
});
</script>

<style module lang="scss">
.mermaid {
  display: block;

  &::selection {
    color: #cccfd5;
    background-color: #494f59;
  }
}

.raw {
  opacity: 0;
}

.rendered {
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
}
</style>
