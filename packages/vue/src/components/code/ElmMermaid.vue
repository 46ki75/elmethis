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

// Global cache shared across all component instances
const globalMermaidCache = {
  instance: null as any,
  svgCache: new Map<string, string>(), // Cache rendered SVGs by code hash
};

// Generate cache key from code and config
const getCacheKey = (code: string): string => {
  // Simple hash function for cache key
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    const char = code.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `mermaid-${hash}`;
};

const renderMermaid = async () => {
  if (!elementRef.value) return;

  isRendered.value = false;

  try {
    const cacheKey = getCacheKey(props.code);

    // Check if SVG is already cached
    if (globalMermaidCache.svgCache.has(cacheKey)) {
      console.log("Using cached SVG for:", cacheKey);
      elementRef.value.innerHTML = globalMermaidCache.svgCache.get(cacheKey)!;
      isRendered.value = true;
      return;
    }

    // Import and initialize mermaid only once globally
    if (!globalMermaidCache.instance) {
      console.log("Initializing mermaid for the first time");
      const { default: mermaid } = await import("mermaid");

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

      globalMermaidCache.instance = mermaid;
    }

    // Render with unique ID
    const renderId = `${componentId}-${renderCount++}`;
    const { svg } = await globalMermaidCache.instance.render(
      renderId,
      props.code,
    );

    // Cache the rendered SVG
    globalMermaidCache.svgCache.set(cacheKey, svg);
    console.log("Cached new SVG for:", cacheKey);

    elementRef.value.innerHTML = svg;
    isRendered.value = true;
  } catch (error) {
    console.error("Mermaid render error:", error);
    elementRef.value.innerHTML = `<pre>${props.code}</pre>`;
    isRendered.value = true;
  }
};

watch(() => props.code, renderMermaid);

onMounted(renderMermaid);

onUnmounted(() => {
  if (elementRef.value) {
    elementRef.value.innerHTML = "";
  }
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
