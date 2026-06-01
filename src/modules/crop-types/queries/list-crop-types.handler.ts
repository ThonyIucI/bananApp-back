import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { CropType } from '../domain/crop-type.entity';

@Injectable()
export class ListCropTypesHandler {
  constructor(private readonly em: EntityManager) {}

  async execute(): Promise<CropType[]> {
    return this.em.find(
      CropType,
      { isActive: true },
      { orderBy: { label: 'ASC' } },
    );
  }
}
