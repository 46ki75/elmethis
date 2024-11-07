import { promises } from 'node:fs'
import { dirname, extname } from 'node:path'
import sharp from 'sharp'

export class Image {
  type: 'external' | 'file'
  src: string

  constructor({ type, src }: { type: 'external' | 'file'; src: string }) {
    this.type = type
    this.src = src
  }

  async save(filePath: string) {
    if (this.type === 'file') {
      const dir = dirname(filePath)

      await promises.mkdir(dir, { recursive: true })

      const response = await fetch(this.src)

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }

      const buffer = await response.arrayBuffer()

      const outputBuffer = await sharp(buffer).toFormat('webp').toBuffer()

      await promises.writeFile(filePath, Buffer.from(outputBuffer))
    }
  }
}
