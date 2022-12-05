import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ImagesController } from './images.controller'
import { ImagesFactory } from './images.factory'
import { Image } from './image.entity'
import { ImagesService } from './images.service'

@Module({
  imports: [TypeOrmModule.forFeature([Image])],
  controllers: [ImagesController],
  providers: [ImagesFactory, ImagesService],
})
export class ImagesModule {}
