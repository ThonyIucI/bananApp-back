import { defineEntity, p } from '@mikro-orm/core';
import * as bcrypt from 'bcrypt';
import { BaseSchema } from '../../shared/base.entity';
import { ValidationException } from '../../shared/exceptions/domain.exception';
import { Role } from '../../roles/domain/role.entity';

const BCRYPT_ROUNDS = 10;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DNI_REGEX = /^\d{8}$/;

const UserSchema = defineEntity({
  name: 'User',
  tableName: 'users',
  extends: BaseSchema,
  properties: {
    firstName: p.string().length(100),
    lastName: p.string().length(100),
    email: p.string().length(150).unique(),
    passwordHash: p.string().length(255).hidden(),
    dni: p.string().length(8).nullable(),
    isActive: p.boolean().default(true),
    isSuperadmin: p.boolean().default(false),
    mustChangePassword: p.boolean().default(false),
    failedLoginAttempts: p.integer().default(0),
    lockedUntil: p.datetime().nullable(),
    lastLoginAt: p.datetime().nullable(),
    emailVerifiedAt: p.datetime().nullable(),
    googleId: p.string().length(100).nullable(),
    avatarUrl: p.string().length(500).nullable(),
    userRoles: () => p.manyToMany(Role).fixedOrder().pivotTable('user_roles'),
  },
});

export class User extends UserSchema.class {
  static async make(props: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    dni?: string;
    googleId?: string;
    avatarUrl?: string;
    emailVerifiedAt?: Date;
  }): Promise<User> {
    const user = new User();
    user.firstName = props.firstName?.trim();
    user.lastName = props.lastName?.trim();
    user.email = props.email?.trim().toLowerCase();
    user.passwordHash = props.password
      ? await bcrypt.hash(props.password, BCRYPT_ROUNDS)
      : '';
    user.dni = props.dni?.trim() ?? null;
    user.isActive = true;
    user.mustChangePassword = false;
    user.failedLoginAttempts = 0;
    user.emailVerifiedAt = props.emailVerifiedAt ?? null;
    user.googleId = props.googleId ?? null;
    user.avatarUrl = props.avatarUrl ?? null;
    user.validate();
    return user;
  }

  isEmailVerified(): boolean {
    return this.emailVerifiedAt !== null;
  }

  set(props: {
    firstName?: string;
    lastName?: string;
    email?: string;
    dni?: string;
    isActive?: boolean;
    mustChangePassword?: boolean;
  }): void {
    if (props.firstName !== undefined) this.firstName = props.firstName?.trim();
    if (props.lastName !== undefined) this.lastName = props.lastName?.trim();
    if (props.email !== undefined)
      this.email = props.email?.trim().toLowerCase();
    if (props.dni !== undefined) this.dni = props.dni?.trim() ?? null;
    if (props.isActive !== undefined) this.isActive = props.isActive;
    if (props.mustChangePassword !== undefined)
      this.mustChangePassword = props.mustChangePassword;
    this.validate();
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`?.trim();
  }

  isLocked(): boolean {
    if (!this.lockedUntil) return false;
    return this.lockedUntil > new Date();
  }

  comparePassword(password: string): boolean {
    return bcrypt.compareSync(password, this.passwordHash);
  }

  recordFailedLogin(maxAttempts = 5, lockMinutes = 15): void {
    this.failedLoginAttempts += 1;
    if (this.failedLoginAttempts >= maxAttempts) {
      this.lockedUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
    }
  }

  recordSuccessfullLogin(): void {
    this.failedLoginAttempts = 0;
    this.lockedUntil = null;
    this.lastLoginAt = new Date();
  }

  private validate(): void {
    if (
      this.firstName !== undefined &&
      (!this.firstName || this.firstName.length < 2)
    ) {
      throw new ValidationException(
        'El nombre debe tener al menos 2 caracteres',
        'firstName',
      );
    }
    if (
      this.lastName !== undefined &&
      (!this.lastName || this.lastName.length < 2)
    ) {
      throw new ValidationException(
        'El apellido debe tener al menos 2 caracteres',
        'lastName',
      );
    }
    if (
      this.email !== undefined &&
      (!this.email || !EMAIL_REGEX.test(this.email))
    ) {
      throw new ValidationException(
        'El email no tiene un formato válido',
        'email',
      );
    }
    if (this.email !== undefined && this.email.length > 150) {
      throw new ValidationException(
        'El email no puede superar los 150 caracteres',
        'email',
      );
    }
    if (this.dni !== undefined && this.dni && !DNI_REGEX.test(this.dni)) {
      throw new ValidationException(
        'El DNI debe tener exactamente 8 dígitos',
        'dni',
      );
    }
  }
}

UserSchema.setClass(User);
