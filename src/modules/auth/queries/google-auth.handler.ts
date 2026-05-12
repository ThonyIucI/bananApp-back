import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../../users/domain/user.entity';
import { Role } from '../../roles/domain/role.entity';
import { UserRole } from '../../roles/domain/user-role.entity';
import { EXPIRING_ACCESS_TOKEN_TIME } from '../constants';
import type { GoogleProfile } from '../infrastructure/google.strategy';

export interface GoogleAuthResult {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    isSuperadmin: boolean;
  };
}

@Injectable()
export class GoogleAuthHandler {
  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
  ) {}

  async execute(profile: GoogleProfile): Promise<GoogleAuthResult> {
    let user = await this.em.findOne(User, { googleId: profile.googleId });

    if (!user) {
      user = await this.em.findOne(User, {
        email: profile.email.toLowerCase(),
      });

      if (user) {
        user.googleId = profile.googleId;
        if (profile.avatarUrl) user.avatarUrl = profile.avatarUrl;
        await this.em.flush();
      } else {
        const role = await this.em.findOneOrFail(Role, {
          key: 'independent_farmer',
        });

        const newUser = await User.make({
          firstName: profile.firstName,
          lastName: profile.lastName || profile.firstName,
          email: profile.email,
          googleId: profile.googleId,
          avatarUrl: profile.avatarUrl,
          emailVerifiedAt: new Date(),
        });

        const userRole = UserRole.make(newUser, role);

        await this.em.transactional((tem) => {
          tem.persist(newUser);
          tem.persist(userRole);
        });

        user = newUser;
      }
    }

    const payload = {
      sub: user.id,
      email: user.email,
      isSuperadmin: user.isSuperadmin ?? false,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: EXPIRING_ACCESS_TOKEN_TIME,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isSuperadmin: user.isSuperadmin ?? false,
      },
    };
  }
}
