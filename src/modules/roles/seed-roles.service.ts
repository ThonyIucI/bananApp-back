import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { Role, ROLE_KEYS, RoleKey } from './domain/role.entity';
import {
  Permission,
  PERMISSION_KEYS,
  PermissionKey,
} from './domain/permission.entity';
import { RolePermission } from './domain/role-permission.entity';

const ROLE_DISPLAY: Record<RoleKey, { name: string; description: string }> = {
  superadmin: {
    name: 'Superadministrador',
    description: 'Acceso total al sistema',
  },
  admin: { name: 'Administrador', description: 'Administra una cooperativa' },
  member: {
    name: 'Socio',
    description: 'Agricultor miembro de la cooperativa',
  },
  bagger: { name: 'Enfundador', description: 'Operario de enfundado en campo' },
  harvest_chief: {
    name: 'Jefe de Cosecha',
    description: 'Responsable de cosecha',
  },
  calibrator: {
    name: 'Calibrador',
    description: 'Calibra y clasifica la producción',
  },
};

const PERMISSION_DESCRIPTIONS: Record<PermissionKey, string> = {
  bundling_create: 'Registrar enfundado',
  bundling_read: 'Ver registros de enfundado',
  bundling_update: 'Modificar registros de enfundado',

  plot_read: 'Ver parcelas',
  plot_manage: 'Gestionar parcelas',

  cooperative_read: 'Ver datos de la cooperativa',
  cooperative_manage: 'Administrar cooperativa',

  user_read: 'Ver usuarios',
  user_manage: 'Gestionar usuarios',

  sector_read: 'Ver sectores',
  sector_manage: 'Gestionar sectores',

  ribbon_calendar_read: 'Ver calendario de cintas',
  ribbon_calendar_manage: 'Gestionar calendario de cintas',

  sanction_read: 'Ver sanciones',
  sanction_manage: 'Gestionar sanciones',

  harvest_read: 'Ver cosechas',
  harvest_manage: 'Gestionar cosechas',
};
// TODO: Actualizar permisos del seeder
// TODO: Acttualizar controllers con nuevo formato de permisos
const ALL_PERMISSIONS = {
  // COOPERATIVES
  COOPERATIVE_LIST: 'cooperative:list',
  COOPERATIVE_READ: 'cooperative:read',
  COOPERATIVE_CREATE: 'cooperative:create',
  COOPERATIVE_UPDATE: 'cooperative:update',
  COOPERATIVE_DELETE: 'cooperative:delete',

  // SECTORS
  SECTOR_LIST: 'sector:list',
  SECTOR_READ: 'sector:read',
  SECTOR_CREATE: 'sector:create',
  SECTOR_UPDATE: 'sector:update',
  SECTOR_DELETE: 'sector:delete',

  // PLOTS
  PLOT_LIST: 'plot:list',
  PLOT_READ: 'plot:read',
  PLOT_CREATE: 'plot:create',
  PLOT_UPDATE: 'plot:update',
  PLOT_DELETE: 'plot:delete',

  // BUNDLING
  BUNDLING_LIST: 'bundling:list',
  BUNDLING_READ: 'bundling:read',
  BUNDLING_CREATE: 'bundling:create',
  BUNDLING_UPDATE: 'bundling:update',
  BUNDLING_DELETE: 'bundling:delete',

  // USERS
  USER_LIST: 'user:list',
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',

  // RIBBON CALENDAR
  RIBBON_CALENDAR_LIST: 'ribbon_calendar:list',
  RIBBON_CALENDAR_READ: 'ribbon_calendar:read',
  RIBBON_CALENDAR_CREATE: 'ribbon_calendar:create',
  RIBBON_CALENDAR_UPDATE: 'ribbon_calendar:update',
  RIBBON_CALENDAR_DELETE: 'ribbon_calendar:delete',

  // SANCTIONS
  SANCTION_LIST: 'sanction:list',
  SANCTION_READ: 'sanction:read',
  SANCTION_CREATE: 'sanction:create',
  SANCTION_UPDATE: 'sanction:update',
  SANCTION_DELETE: 'sanction:delete',

  // HARVEST
  HARVEST_LIST: 'harvest:list',
  HARVEST_READ: 'harvest:read',
  HARVEST_CREATE: 'harvest:create',
  HARVEST_UPDATE: 'harvest:update',
  HARVEST_DELETE: 'harvest:delete',
} as const;

// Permissions granted per role (superadmin gets all via guard bypass)
const ROLE_PERMISSIONS: Record<RoleKey, PermissionKey[]> = {
  superadmin: [...PERMISSION_KEYS],
  admin: [
    'cooperative_read',
    'cooperative_manage',
    'user_read',
    'user_manage',
    'plot_read',
    'plot_manage',
    'sector_read',
    'sector_manage',
    'bundling_read',
    'bundling_update',
    'ribbon_calendar_read',
    'ribbon_calendar_manage',
    'sanction_read',
    'sanction_manage',
    'harvest_read',
    'harvest_manage',
  ],
  harvest_chief: [
    'plot_read',
    'sector_read',
    'bundling_read',
    'harvest_read',
    'harvest_manage',
  ],
  calibrator: [
    'bundling_read',
    'bundling_create',
    'bundling_update',
    'plot_read',
    'sector_read',
  ],
  bagger: [
    'user_read',
    'plot_read',
    'plot_manage',
    'sector_read',
    'bundling_read',
    'bundling_update',
    'ribbon_calendar_read',
    'harvest_read',
  ],
  member: [
    'user_read',
    'plot_read',
    'plot_manage',
    'sector_read',
    'sector_manage',
    'bundling_read',
    'bundling_update',
    'ribbon_calendar_read',
    'sanction_read',
    'harvest_read',
    'harvest_manage',
  ],
};

@Injectable()
export class SeedRolesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedRolesService.name);

  constructor(private readonly em: EntityManager) {}

  async onApplicationBootstrap(): Promise<void> {
    const em = this.em.fork();

    // Cargar todos los datos existentes una sola vez
    const [permissionsMap, rolesMap, rolePermissionsSet] =
      await this.loadExistingData(em);

    await this.seedPermissions(em, permissionsMap);
    await this.seedRoles(em, rolesMap);
    await this.seedRolePermissions(
      em,
      permissionsMap,
      rolesMap,
      rolePermissionsSet,
    );
  }

  private async loadExistingData(
    em: EntityManager,
  ): Promise<[Map<string, Permission>, Map<string, Role>, Set<string>]> {
    const [existingPermissions, existingRoles, existingRolePermissions] =
      await Promise.all([
        em.find(Permission, {}),
        em.find(Role, {}),
        em.find(RolePermission, {}, { populate: ['role', 'permission'] }),
      ]);

    const permissionsMap = new Map(existingPermissions.map((p) => [p.key, p]));
    const rolesMap = new Map(existingRoles.map((r) => [r.key, r]));
    const rolePermissionsSet = new Set(
      existingRolePermissions.map(
        (rp) => `${rp.role.key}|${rp.permission.key}`,
      ),
    );

    return [permissionsMap, rolesMap, rolePermissionsSet];
  }

  private async seedPermissions(
    em: EntityManager,
    permissionsMap: Map<string, Permission>,
  ): Promise<void> {
    const toPersist: Permission[] = [];

    for (const key of PERMISSION_KEYS) {
      if (!permissionsMap.has(key)) {
        toPersist.push(
          Permission.make({
            key,
            description: PERMISSION_DESCRIPTIONS[key],
          }),
        );
      }
    }

    if (toPersist.length === 0) return;

    await em.persist(toPersist).flush();

    // Actualizar el map con los nuevos permisos para que seedRolePermissions los tenga
    for (const perm of toPersist) {
      permissionsMap.set(perm.key, perm);
    }

    this.logger.log(`Seeded ${toPersist.length} permissions`);
  }

  private async seedRoles(
    em: EntityManager,
    rolesMap: Map<string, Role>,
  ): Promise<void> {
    const toPersist: Role[] = [];

    for (const key of ROLE_KEYS) {
      if (!rolesMap.has(key)) {
        const { name, description } = ROLE_DISPLAY[key];
        const newRole = Role.make({ key, name, description });
        toPersist.push(newRole);
        rolesMap.set(key, newRole);
      }
    }

    if (toPersist.length === 0) return;

    await em.persist(toPersist).flush();

    this.logger.log(`Seeded ${toPersist.length} roles`);
  }

  private async seedRolePermissions(
    em: EntityManager,
    permissionsMap: Map<string, Permission>,
    rolesMap: Map<string, Role>,
    rolePermissionsSet: Set<string>,
  ): Promise<void> {
    const toPersist: RolePermission[] = [];

    for (const roleKey of ROLE_KEYS) {
      const role = rolesMap.get(roleKey);
      if (!role) continue;

      for (const permKey of ROLE_PERMISSIONS[roleKey]) {
        const permission = permissionsMap.get(permKey);
        if (!permission) continue;

        const key = `${roleKey}|${permKey}`;
        if (!rolePermissionsSet.has(key)) {
          toPersist.push(RolePermission.make(role, permission));
          rolePermissionsSet.add(key);
        }
      }
    }

    if (toPersist.length === 0) return;

    await em.persist(toPersist).flush();
    this.logger.log(`Seeded ${toPersist.length} role-permissions`);
  }
}
