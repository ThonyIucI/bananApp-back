import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../modules/users/domain/user.entity';

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;

@Injectable()
export class SeedSuperadminService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedSuperadminService.name);

  constructor(private readonly em: EntityManager) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.em.transactional(async (em) => {
      const exists = await em.findOne(User, { email: SUPERADMIN_EMAIL });
      if (exists) return;

      const superadmin = await User.make({
        firstName: 'Admin',
        lastName: 'Admin',
        email: SUPERADMIN_EMAIL,
        password: SUPERADMIN_PASSWORD,
      });

      superadmin.isSuperadmin = true;

      em.persist(superadmin);
      this.logger.log(`Superadmin creado: ${SUPERADMIN_EMAIL}`);
    });
  }
}
