<template>
  <div>Template</div>
</template>

<script setup lang="ts">
import type { Client } from '@notionhq/client'

type BlockResponseResults = Awaited<
  ReturnType<typeof Client.prototype.blocks.children.list>
>['results']

export interface ElmNotionProps {
  blocks: BlockResponseResults
}

withDefaults(defineProps<ElmNotionProps>(), {})
</script>

<style module lang="scss"></style>
