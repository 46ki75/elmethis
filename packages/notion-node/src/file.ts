import { promises } from 'node:fs'
import { dirname, extname } from 'node:path'

export class NotionFile {
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

      await promises.writeFile(filePath, Buffer.from(buffer))
    }
  }

  getExtension(): string {
    try {
      const pathname = new URL(this.src).pathname
      const extension = extname(pathname)

      if (extension == null) {
        throw new Error('Invalid extension')
      }
      return extension.slice(1)
    } catch (error) {
      console.error('Invalid URL:', error)
      throw error
    }
  }
}
