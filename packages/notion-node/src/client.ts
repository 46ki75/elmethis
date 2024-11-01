import { Client as NotionClient } from '@notionhq/client'
import type { ElmJsonRendererProps } from '@elmethis/core'

export class Client {
  #notionClient: NotionClient

  constructor(options?: ConstructorParameters<typeof NotionClient>[0]) {
    this.#notionClient = new NotionClient(options)
  }

  async convert(id: string) {
    const components: ElmJsonRendererProps['json'] = []

    const { results } = await this.#notionClient.blocks.children.list({
      block_id: id
    })

    for (const block of results) {
      if ('type' in block) {
        switch (block.type) {
          case 'paragraph': {
            components.push({
              type: 'ElmParagraph',
              children: block.paragraph.rich_text.map((text) => {
                return {
                  type: 'ElmInlineText',
                  props: {
                    text: text.plain_text,
                    bold: text.annotations.bold,
                    italic: text.annotations.italic,
                    underline: text.annotations.underline,
                    strikethrough: text.annotations.strikethrough
                  }
                }
              })
            })
            break
          }
        }
      }
    }

    return components
  }
}
