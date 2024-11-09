<template>
  <template v-for="block in blocks">
    <template v-if="'type' in block">
      <ElmHeading1
        v-if="block.type === 'heading_1'"
        :text="block.heading_1.rich_text.map((t) => t.plain_text).join()"
      />
      <ElmHeading2
        v-else-if="block.type === 'heading_2'"
        :text="block.heading_2.rich_text.map((t) => t.plain_text).join()"
      />
      <ElmHeading3
        v-else-if="block.type === 'heading_3'"
        :text="block.heading_3.rich_text.map((t) => t.plain_text).join()"
      />

      <ElmParagraph v-else-if="block.type === 'paragraph'">
        <ElmNotionRichText :richText="block.paragraph.rich_text" />
      </ElmParagraph>

      <ElmCodeBlock
        v-else-if="block.type === 'code'"
        :code="block.code.rich_text.map((t) => t.plain_text).join()"
        :language="block.code.language.toLocaleLowerCase()"
      />

      <ElmImage
        v-else-if="block.type === 'image'"
        :src="
          block.image.type === 'external'
            ? block.image.external.url
            : block.image.file.url
        "
        :alt="block.image.caption.map((t) => t.plain_text).join()"
        enableModal
      />

      <!-- <ElmColumnList v-else-if="block.type === 'column_list'">
        <ElmNotion :id="block.id" :endpoint="endpoint" />
      </ElmColumnList>

      <ElmColumn v-else-if="block.type === 'column'">
        <ElmNotion :id="block.id" :endpoint="endpoint" />
      </ElmColumn> -->

      <ElmFile
        v-else-if="block.type === 'file'"
        :src="
          block.file.type === 'external'
            ? block.file.external.url
            : block.file.file.url
        "
        :name="block.file.name"
      />
    </template>
  </template>
</template>

<script setup lang="ts">
import type { Client } from '@notionhq/client'
import { onMounted, ref } from 'vue'
import { ofetch } from 'ofetch'

import ElmHeading1 from '../headings/ElmHeading1.vue'
import ElmHeading2 from '../headings/ElmHeading2.vue'
import ElmHeading3 from '../headings/ElmHeading3.vue'
import ElmParagraph from '../typography/ElmParagraph.vue'
import ElmNotionRichText from './ElmNotionRichText.vue'
import ElmCodeBlock from '../code/ElmCodeBlock.vue'
import ElmImage from '../media/ElmImage.vue'
import ElmFile from '../media/ElmFile.vue'

type BlockResponseResults = Awaited<
  ReturnType<typeof Client.prototype.blocks.children.list>
>['results']

export interface ElmNotionProps {
  id: string
  endpoint: string
}

const props = withDefaults(defineProps<ElmNotionProps>(), {})

const blocks = ref<BlockResponseResults>([])

onMounted(async () => {
  const results = await ofetch<BlockResponseResults>(
    `${props.endpoint}/${props.id}`
  )
  blocks.value = results
  console.log(results)
})
</script>
