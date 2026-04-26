import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../domain/user.repository';
import { NotFoundException } from '../../shared/exceptions/domain.exception';

@Injectable()
export class DeleteUserHandler {
  constructor(private readonly repo: IUserRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.deletedAt = new Date();
    await this.repo.flush();
  }
}
