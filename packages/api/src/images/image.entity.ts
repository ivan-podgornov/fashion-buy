import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('images')
export class Image {
  @PrimaryGeneratedColumn('increment')
  id!: number

  @Column({ nullable: false })
  height!: number

  @Column({ nullable: false })
  width!: number

  @Column({ nullable: false })
  path!: string
}
