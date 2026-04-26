import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Role } from './domain/role.entity';
import { Permission } from './domain/permission.entity';
import { RolePermission } from './domain/role-permission.entity';
import { SeedRolesService } from './seed-roles.service';

@Module({
  imports: [MikroOrmModule.forFeature([Role, Permission, RolePermission])],
  providers: [SeedRolesService],
  exports: [MikroOrmModule],
})
export class RolesModule {}
