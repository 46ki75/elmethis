import { Client as NotionClient } from '@notionhq/client'
import type { ElmJsonRendererProps } from '@elmethis/core'
import { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints.js'

type ColorType = RichTextItemResponse['annotations']['color']

type ColorMap = Record<ColorType, string | undefined>

const COLOR_MAP: ColorMap = {
  default: undefined,
  gray: '#868e9c',
  brown: '#8b4c3f',
  orange: '#bf7e71',
  yellow: '#b8a36e',
  green: '#59b57c',
  blue: '#6987b8',
  purple: '#9771bd',
  pink: '#c9699e',
  red: '#b36472',
  gray_background: '#868e9c',
  blue_background: '#6987b8',
  purple_background: '#9771bd',
  pink_background: '#c9699e',
  red_background: '#b36472',
  orange_background: '#bf7e71',
  yellow_background: '#b8a36e',
  green_background: '#59b57c',
  brown_background: '#8b4c3f'
}

export class Client {
  #notionClient: NotionClient

  constructor(options?: ConstructorParameters<typeof NotionClient>[0]) {
    this.#notionClient = new NotionClient(options)
  }

  #richTextToElmInlineText(
    richText: RichTextItemResponse[]
  ): ElmJsonRendererProps['json'] {
    return richText.map((text) => {
      return {
        type: 'ElmInlineText',
        props: {
          text: text.plain_text,
          bold: text.annotations.bold,
          italic: text.annotations.italic,
          underline: text.annotations.underline,
          strikethrough: text.annotations.strikethrough,
          color: COLOR_MAP[text.annotations.color]
        }
      }
    })
  }

  async convert({ id }: { id: string }) {
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
              children: this.#richTextToElmInlineText(block.paragraph.rich_text)
            })
            break
          }

          case 'code': {
            components.push({
              type: 'ElmCodeBlock',
              props: {
                code: block.code.rich_text
                  .map((text) => text.plain_text)
                  .join(),
                language: block.code.language
              }
            })
            break
          }

          case 'heading_1': {
            if (block.heading_1.is_toggleable) {
              components.push({
                type: 'ElmToggle',
                props: {
                  summary: block.heading_1.rich_text
                    .map((text) => text.plain_text)
                    .join()
                },
                children: (await this.convert({ id: block.id })).components
              })
            } else {
              components.push({
                type: 'ElmHeading1',
                props: {
                  text: block.heading_1.rich_text
                    .map((text) => text.plain_text)
                    .join()
                }
              })
            }
            break
          }

          case 'heading_2': {
            if (block.heading_2.is_toggleable) {
              components.push({
                type: 'ElmToggle',
                props: {
                  summary: block.heading_2.rich_text
                    .map((text) => text.plain_text)
                    .join()
                },
                children: (await this.convert({ id: block.id })).components
              })
            } else {
              components.push({
                type: 'ElmHeading2',
                props: {
                  text: block.heading_2.rich_text
                    .map((text) => text.plain_text)
                    .join()
                }
              })
            }
            break
          }

          case 'heading_3': {
            if (block.heading_3.is_toggleable) {
              components.push({
                type: 'ElmToggle',
                props: {
                  summary: block.heading_3.rich_text
                    .map((text) => text.plain_text)
                    .join()
                },
                children: (await this.convert({ id: block.id })).components
              })
            } else {
              components.push({
                type: 'ElmHeading3',
                props: {
                  text: block.heading_3.rich_text
                    .map((text) => text.plain_text)
                    .join()
                }
              })
            }
            break
          }

          case 'toggle': {
            components.push({
              type: 'ElmToggle',
              props: {
                summary: block.toggle.rich_text
                  .map((text) => text.plain_text)
                  .join()
              },
              children: (await this.convert({ id: block.id })).components
            })
            break
          }

          case 'image': {
            components.push({
              type: 'ElmImage',
              props: {
                src:
                  block.image.type === 'external'
                    ? block.image.external.url
                    : block.image.file.url
              }
            })
            break
          }
        }
      }
    }

    return { components }
  }
}
