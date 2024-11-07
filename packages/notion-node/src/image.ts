import { promises } from 'node:fs'
import { dirname } from 'node:path'

export class Image {
  type: 'external' | 'file'
  src: string

  constructor({ type, src }: { type: 'external' | 'file'; src: string }) {
    this.type = type
    this.src = src
  }

  async save(filePath: string) {
    const dir = dirname(filePath)

    await promises.mkdir(dir, { recursive: true })

    const response = await fetch(this.src)

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()

    await promises.writeFile(filePath, Buffer.from(buffer))
  }
}
