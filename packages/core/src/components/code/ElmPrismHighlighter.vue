<template>
  <pre class="elmethis-prism-code-highlighter-pre" :key="JSON.stringify(props)">
    <code :class="['elmethis-prism-code-highlighter-code', `language-${language}`]" ref="codeRef">{{ code.trim() }}</code>
  </pre>
</template>

<script setup lang="ts">
import { onMounted, onUpdated, ref } from 'vue'

import Prism from 'prismjs'

import 'prism-theme-vars/base.css'

// Prism.js language autoloader plugin
import 'prismjs/plugins/autoloader/prism-autoloader.js'

export interface ElmPrismHighlighterProps {
  /**
   * The code to display.
   */
  code: string

  /**
   * The language of the code.
   */
  language?: string
}

const props = withDefaults(defineProps<ElmPrismHighlighterProps>(), {
  language: 'txt'
})

const codeRef = ref<HTMLElement | null>(null)

const highlightCode = () => {
  Prism.plugins.autoloader.languages_path =
    'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/'

  if (codeRef.value) {
    Prism.highlightElement(codeRef.value)
  }
}

onMounted(highlightCode)
onUpdated(highlightCode)
</script>

<style scoped lang="scss">
.elmethis-prism-code-highlighter-pre {
  all: unset;
}

.elmethis-prism-code-highlighter-code {
  font-family: 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
}
</style>

<style>
:root {
  --prism-foreground: #393a34;
  --prism-background: #f5f5f5;
  --prism-comment: #a0ada0;
  --prism-string: #b56959;
  --prism-literal: #2f8a89;
  --prism-number: #296aa3;
  --prism-keyword: #098f53;
  --prism-function: #6c7834;
  --prism-boolean: #1c6b48;
  --prism-constant: #a65e2b;
  --prism-deleted: #a14f55;
  --prism-class: #2993a3;
  --prism-builtin: #ab5959;
  --prism-property: #b58451;
  --prism-namespace: #b05a78;
  --prism-punctuation: #8e8f8b;
  --prism-decorator: #bd8f8f;
  --prism-regex: #ab5e3f;
  --prism-json-property: #698c96;
  --prism-selection-background: #dddddd;
  --prism-inline-background: var(--prism-background);
  --prism-operator: var(--prism-punctuation);
  --prism-variable: var(--prism-literal);
  --prism-symbol: var(--prism-literal);
  --prism-interpolation: var(--prism-literal);
  --prism-selector: var(--prism-keyword);
  --prism-keyword-control: var(--prism-keyword);
  --prism-line-number: #a5a5a5;
  --prism-line-number-gutter: #333333;
  --prism-line-highlight-background: #eeeeee;
  --prism-marker-color: var(--prism-foreground);
  --prism-marker-opacity: 0.4;
  --prism-marker-font-size: 0.8em;
  --prism-font-size: 1em;
  --prism-line-height: 1.5em;
  --prism-font-family: monospace;
  --prism-inline-font-size: var(--prism-font-size);
  --prism-block-font-size: var(--prism-font-size);
  --prism-tab-size: 2;
  --prism-block-padding-x: 1em;
  --prism-block-padding-y: 1em;
  --prism-block-margin-x: 0;
  --prism-block-margin-y: 0.5em;
  --prism-block-radius: 0rem;
  --prism-inline-padding-x: 0.3em;
  --prism-inline-padding-y: 0.1em;
  --prism-inline-radius: 0rem;
  --prism-comment-style: italic;
  --prism-url-decoration: underline;
}

[data-theme='dark'] {
  --prism-foreground: #d4cfbf;
  --prism-background: #272727;
  --prism-comment: #758575;
  --prism-string: #d48372;
  --prism-literal: #429988;
  --prism-number: #6394bf;
  --prism-keyword: #4d9375;
  --prism-function: #a1b567;
  --prism-boolean: #1c6b48;
  --prism-variable: #c2b36e;
  --prism-constant: var(--prism-literal);
  --prism-symbol: var(--prism-literal);
  --prism-interpolation: var(--prism-literal);
  --prism-deleted: #a14f55;
  --prism-class: #80b7bf;
  --prism-builtin: #e0a569;
  --prism-property: #ca8d74;
  --prism-namespace: #c78795;
  --prism-punctuation: #858585;
  --prism-decorator: #bd8f8f;
  --prism-operator: var(--prism-punctuation);
  --prism-selector: var(--prism-keyword);
  --prism-keyword-control: var(--prism-keyword);
  --prism-regex: #ab5e3f;
  --prism-json-property: #6b8b9e;
  --prism-inline-background: var(--prism-background);
  --prism-line-number: #888888;
  --prism-line-number-gutter: #eeeeee;
  --prism-line-highlight-background: #444444;
  --prism-selection-background: #444444;
  --prism-marker-color: var(--prism-foreground);
  --prism-marker-opacity: 0.4;
  --prism-marker-font-size: 0.8em;
  --prism-font-size: 1em;
  --prism-line-height: 1.5em;
  --prism-font-family: monospace;
  --prism-inline-font-size: var(--prism-font-size);
  --prism-block-font-size: var(--prism-font-size);
  --prism-tab-size: 2;
  --prism-block-padding-x: 1em;
  --prism-block-padding-y: 1em;
  --prism-block-margin-x: 0;
  --prism-block-margin-y: 0.5em;
  --prism-block-radius: 0rem;
  --prism-inline-padding-x: 0.3em;
  --prism-inline-padding-y: 0.1em;
  --prism-inline-radius: 0rem;
  --prism-comment-style: italic;
  --prism-url-decoration: underline;
}
</style>
