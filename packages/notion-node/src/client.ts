import { Client as NotionClient } from '@notionhq/client'
import type { ElmCalloutProps, ElmJsonRendererProps } from '@elmethis/core'
import { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints.js'
import ogs from 'open-graph-scraper'

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

    let ul: ElmJsonRendererProps['json'][number] | undefined
    let ol: ElmJsonRendererProps['json'][number] | undefined

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

          case 'bulleted_list_item': {
            const li: ElmJsonRendererProps['json'][number] = {
              type: 'ElmListItem',
              children: [
                ...this.#richTextToElmInlineText(
                  block.bulleted_list_item.rich_text
                ),
                ...(await this.convert({ id: block.id })).components
              ]
            }

            if (ul === undefined || ul.children === undefined) {
              ul = {
                type: 'ElmBulletedList',
                children: [li]
              }
              components.push(ul)
            } else {
              ul.children.push(li)
            }
            break
          }

          case 'numbered_list_item': {
            const li: ElmJsonRendererProps['json'][number] = {
              type: 'ElmListItem',
              children: [
                ...this.#richTextToElmInlineText(
                  block.numbered_list_item.rich_text
                ),
                ...(await this.convert({ id: block.id })).components
              ]
            }

            if (ol === undefined || ol.children === undefined) {
              ol = {
                type: 'ElmNumberedList',
                children: [li]
              }
              components.push(ol)
            } else {
              ol.children.push(li)
            }
            break
          }

          case 'to_do': {
            components.push({
              type: 'ElmCheckbox',
              props: {
                label: block.to_do.rich_text
                  .map((text) => text.plain_text)
                  .join()
              }
            })

            break
          }

          case 'divider': {
            components.push({
              type: 'ElmDivider'
            })
            break
          }

          case 'callout': {
            let type: ElmCalloutProps['type'] = 'note'
            switch (block.callout.color) {
              case 'blue':
              case 'blue_background':
              case 'gray':
              case 'gray_background':
                type = 'note'
                break

              case 'green':
              case 'green_background':
                type = 'tip'
                break

              case 'purple':
              case 'purple_background':
                type = 'important'
                break

              case 'yellow':
              case 'yellow_background':
              case 'orange':
              case 'orange_background':
              case 'brown':
              case 'brown_background':
                type = 'warning'
                break

              case 'red':
              case 'red_background':
              case 'pink':
              case 'pink_background':
                type = 'caution'
                break
            }

            components.push({
              type: 'ElmCallout',
              props: { type },
              children: [
                ...this.#richTextToElmInlineText(block.callout.rich_text),
                ...(await this.convert({ id: block.id })).components
              ]
            })
            break
          }

          case 'bookmark': {
            const url = block.bookmark.url
            const { result, response } = await ogs({ url })

            const title =
              result.ogTitle || result.dcTitle || result.twitterTitle || url

            const description =
              result.ogDescription ||
              result.dcDescription ||
              result.twitterDescription

            const image =
              result.ogImage && result.ogImage.length > 0
                ? result.ogImage[0].url
                : result.twitterImage && result.twitterImage.length > 0
                  ? result.twitterImage[0].url
                  : ''

            components.push({
              type: 'ElmBookmark',
              props: {
                title,
                description,
                image,
                url
              }
            })

            break
          }
        }

        if (ul !== undefined && block.type !== 'bulleted_list_item') {
          ul = undefined
        }

        if (ol !== undefined && block.type !== 'numbered_list_item') {
          ol = undefined
        }
      }
    }

    return { components }
  }
}
