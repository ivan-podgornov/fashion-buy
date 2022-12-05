import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import sharp from 'sharp'
import type { Repository } from 'typeorm'

import { IMAGES_DIRECTORY } from './constants'
import { Image } from './image.entity'
import type { ImageDTO } from './images.types'

interface ImageMetadata {
  height: number
  width: number
  format: 'jpg' | 'jpeg' | 'png'
}

export interface CreateOptions {
  /** Хост на котором запущен текущий бэкенд */
  originalUrl: URL
}

const AVAILABLE_FORMATS: Array<ImageMetadata['format']> = ['jpg', 'jpeg', 'png']

@Injectable()
export class ImagesFactory {
  constructor(
    @InjectRepository(Image)
    private imagesRepository: Repository<Image>
  ) {}

  /** Сохраняет картинку */
  async create(image: Buffer, options: CreateOptions): Promise<ImageDTO> {
    const metadata = await this.getMetadata(image)
    const filepath = await this.saveToFileSystem(image, metadata)

    // сохранение информации о картинке в базу данных
    const entity = await this.imagesRepository.save(
      this.imagesRepository.create({
        height: metadata.height,
        width: metadata.width,
        path: filepath,
      })
    )

    return this.imageToImageDTO(entity, options)
  }

  private async getMetadata(image: Buffer): Promise<ImageMetadata> {
    const sharpedImage = sharp(image)
    const metadata = await sharpedImage.metadata()

    if (!metadata.format) {
      throw new Error('Не удалось определить формат изображения')
    }

    if (!metadata.height || !metadata.width) {
      throw new Error('Не удалось определить размеры изображения')
    }

    if (!(AVAILABLE_FORMATS as string[]).includes(metadata.format as string)) {
      const formats = AVAILABLE_FORMATS.join(', ')
      throw new Error(
        `Формат ${metadata.format} является недопустимым. Допустимые форматы: ${formats}`
      )
    }

    return {
      height: metadata.height,
      width: metadata.width,
      format: metadata.format as ImageMetadata['format'],
    }
  }

  /** Сохраняет картинку в файловую систему. Возвращает путь к картинке */
  private async saveToFileSystem(image: Buffer, metadata: ImageMetadata) {
    const id = crypto.randomUUID()
    const directory = await this.getImageDirectory()
    const filepath = path.join(directory, `${id}.${metadata.format}`)
    await fs.appendFile(filepath, image)

    return filepath
  }

  /** Возвращает путь к директории в которую нужно сохранять картинку */
  private async getImageDirectory(): Promise<string> {
    const date = new Date()
    const dirname = `${date.getMonth()}-${date.getFullYear()}`
    const dirpath = path.join(IMAGES_DIRECTORY, dirname)

    // директория будет создаваться, только если такой директории ещё нет
    await fs.mkdir(dirpath, { recursive: true })

    return dirpath
  }

  /** Преобразует запись о картинке в бд, в dto-объект */
  private imageToImageDTO(image: Image, options: CreateOptions): ImageDTO {
    const imagePath = path.relative(IMAGES_DIRECTORY, image.path)
    const { origin } = options.originalUrl
    const src = `${origin}/images/${imagePath}`

    return {
      src,
      height: image.height,
      width: image.width,
    }
  }
}
