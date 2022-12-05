import fs from 'node:fs/promises'
import path from 'node:path'
import { createReadStream } from 'node:fs'

import { IMAGES_DIRECTORY } from './constants'
import { ImagesFactory, CreateOptions } from './images.factory'

import {
  Inject,
  Injectable,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common'

interface File {
  mimeType: string
  stream: StreamableFile
}

@Injectable()
export class ImagesService {
  constructor(
    @Inject(ImagesFactory)
    private imagesFactory: ImagesFactory
  ) {}

  /** Сохраняет картинку */
  create(image: Buffer, options: CreateOptions) {
    return this.imagesFactory.create(image, options)
  }

  async getFile(imagePath: string): Promise<File> {
    const mimeType = this.resolveMimeType(imagePath)

    try {
      const filepath = path.resolve(IMAGES_DIRECTORY, imagePath)
      await fs.access(filepath)

      return {
        mimeType,
        stream: new StreamableFile(createReadStream(filepath)),
      }
    } catch (error) {
      throw new NotFoundException()
    }
  }

  private resolveMimeType(filepath: string) {
    const ext = path.extname(filepath)
    const mimeTypes: Record<string, string> = {
      '.jpeg': 'image/jpeg',
      '.jpg': 'image/jpg',
      '.png': 'image/png',
    }

    if (!mimeTypes[ext]) {
      throw new NotFoundException()
    }

    return mimeTypes[ext]
  }
}
