import path from 'node:path'
import { FileInterceptor } from '@nestjs/platform-express'
import type { Express, Request, Response } from 'express'
import { ImagesService } from './images.service'

import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'

@Controller('/images/')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get('/:dirname/:filename')
  async getFile(
    @Param('dirname') dirname: string,
    @Param('filename') filename: string,
    @Res({ passthrough: true }) response: Response
  ) {
    const filepath = path.join(dirname, filename)
    const { mimeType, stream } = await this.imagesService.getFile(filepath)
    response.setHeader('Content-Type', mimeType)
    return stream
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @UploadedFile() uploadedFile: Express.Multer.File,
    @Req() request: Request
  ) {
    const base = `${request.protocol}://${request.headers.host}`
    const originalUrl = new URL(request.originalUrl, base)
    return this.imagesService.save(uploadedFile.buffer, { originalUrl })
  }
}
