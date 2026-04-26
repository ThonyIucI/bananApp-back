import { Injectable } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { IUserRepository } from '../domain/user.repository';
import { CreateUserCommand } from './create-user.command';
import { ConflictException } from '../../shared/exceptions/domain.exception';

@Injectable()
export class CreateUserHandler {
  constructor(private readonly repo: IUserRepository) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const existing = await this.repo.findByEmail(command.email);
    if (existing) {
      throw new ConflictException(
        'Ya existe un usuario con ese correo electrónico',
      );
    }

    const user = await User.make({
      firstName: command.firstName,
      lastName: command.lastName,
      email: command.email,
      password: command.password,
      dni: command.dni,
    });

    if (command.mustChangePassword) {
      user.mustChangePassword = true;
    }

    this.repo.persist(user);
    await this.repo.flush();

    return user;
  }
}
