import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../domain/user.repository';
import { NotFoundException } from '../../shared/exceptions/domain.exception';

export interface UpdateUserCommand {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  dni?: string;
  isActive?: boolean;
  password?: string;
  mustChangePassword?: boolean;
}

@Injectable()
export class UpdateUserHandler {
  constructor(private readonly repo: IUserRepository) {}

  async execute(command: UpdateUserCommand) {
    const user = await this.repo.findById(command.id);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    await user.set({
      firstName: command.firstName,
      lastName: command.lastName,
      email: command.email,
      dni: command.dni,
      isActive: command.isActive,
      password: command.password,
      mustChangePassword: command.mustChangePassword,
    });

    await this.repo.flush();
    return user;
  }
}
