import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import * as bcrypt from 'bcrypt';
import { User } from '../modules/users/domain/user.entity';

const SUPERADMIN_EMAIL = 'thonyiuci@gmail.com';
const SUPERADMIN_PASSWORD = 'canamas365';

@Injectable()
export class SeedSuperadminService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedSuperadminService.name);

  constructor(private readonly em: EntityManager) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.em.transactional(async (em) => {
      const exists = await em.findOne(User, { email: SUPERADMIN_EMAIL });
      if (exists) return;

      const passwordHash = await bcrypt.hash(SUPERADMIN_PASSWORD, 12);

      const superadmin = User.make({
        firstName: 'Thony',
        lastName: 'Admin',
        email: SUPERADMIN_EMAIL,
        passwordHash,
      });

      superadmin.isSuperadmin = true;

      em.persist(superadmin);
      this.logger.log(`Superadmin creado: ${SUPERADMIN_EMAIL}`);
    });
  }
}
