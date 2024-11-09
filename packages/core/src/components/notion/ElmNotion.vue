<template>
  <ElmBlockFallback v-if="isLoading" />

  <component :is="() => notion" />

  <!-- <template v-else v-for="vnode in notion">
    <component :is="vnode.type" v-bind="vnode.props" />
  </template> -->
</template>

<script setup lang="ts">
import type { Client } from '@notionhq/client'
import { h, onMounted, ref, VNode } from 'vue'
import { ofetch } from 'ofetch'

import ElmHeading1 from '../headings/ElmHeading1.vue'
import ElmHeading2 from '../headings/ElmHeading2.vue'
import ElmHeading3 from '../headings/ElmHeading3.vue'
import ElmBlockFallback from '../fallback/ElmBlockFallback.vue'
import ElmParagraph from '../typography/ElmParagraph.vue'
import ElmNotionRichText from './ElmNotionRichText.vue'
import ElmImage from '../media/ElmImage.vue'
import ElmColumnList from '../containments/ElmColumnList.vue'
import ElmFile from '../media/ElmFile.vue'
import ElmCodeBlock from '../code/ElmCodeBlock.vue'
import ElmToggle from '../containments/ElmToggle.vue'
import ElmColumn from '../containments/ElmColumn.vue'
import ElmDivider from '../typography/ElmDivider.vue'

type BlockResponseResults = Awaited<
  ReturnType<typeof Client.prototype.blocks.children.list>
>['results']

export interface ElmNotionProps {
  id: string
  endpoint: string
}

const props = withDefaults(defineProps<ElmNotionProps>(), {})

const notion = ref<VNode[]>([])
const isLoading = ref(true)

onMounted(async () => {
  isLoading.value = true
  notion.value = await render(props.id, props.endpoint)
  isLoading.value = false
})

const render = async (id: string, endpoint: string): Promise<VNode[]> => {
  const vnodes: VNode[] = []

  const blocks = await ofetch<BlockResponseResults>(`${endpoint}/${id}`)

  for (const block of blocks) {
    if ('type' in block) {
      switch (block.type) {
        case 'heading_1': {
          vnodes.push(
            h(ElmHeading1, {
              text: block.heading_1.rich_text.map((t) => t.plain_text).join()
            })
          )
          break
        }

        case 'heading_2': {
          vnodes.push(
            h(ElmHeading2, {
              text: block.heading_2.rich_text.map((t) => t.plain_text).join()
            })
          )
          break
        }

        case 'heading_3': {
          vnodes.push(
            h(ElmHeading3, {
              text: block.heading_3.rich_text.map((t) => t.plain_text).join()
            })
          )
          break
        }

        case 'paragraph': {
          vnodes.push(
            h(
              ElmParagraph,
              {},
              h(ElmNotionRichText, { richText: block.paragraph.rich_text })
            )
          )
          break
        }

        case 'column_list': {
          vnodes.push(h(ElmColumnList, {}, await render(block.id, endpoint)))
          break
        }

        case 'column': {
          vnodes.push(h(ElmColumn, {}, await render(block.id, endpoint)))
          break
        }

        case 'image': {
          vnodes.push(
            h(ElmImage, {
              src:
                block.image.type === 'external'
                  ? block.image.external.url
                  : block.image.file.url,
              alt: block.image.caption?.map((t) => t.plain_text).join(),
              enableModal: true
            })
          )
          break
        }

        case 'file': {
          vnodes.push(
            h(ElmFile, {
              src:
                block.file.type === 'external'
                  ? block.file.external.url
                  : block.file.file.url,
              name: block.file.name
            })
          )
          break
        }

        case 'code': {
          const language = block.code.language.toLowerCase()
          const caption =
            block.code.caption.length === 0
              ? language
              : block.code.caption?.map((t) => t.plain_text).join()
          vnodes.push(
            h(ElmCodeBlock, {
              code: block.code.rich_text.map((t) => t.plain_text).join(),
              language,
              caption
            })
          )
          break
        }

        case 'toggle': {
          console.log(block.id)
          vnodes.push(
            h(
              ElmToggle,
              {
                summary: block.toggle.rich_text.map((t) => t.plain_text).join()
              },
              await render(block.id, endpoint)
            )
          )
          break
        }

        case 'divider': {
          vnodes.push(h(ElmDivider))
          break
        }

        default: {
          break
        }
      }
    }
  }

  return vnodes
}
</script>
