# CultivApp — Backend

NestJS + MikroORM v7 + PostgreSQL (Supabase local) + Redis.

## Requisitos

- Node.js 22+
- Supabase CLI (`supabase start` corriendo en `localhost:54322`)
- Redis disponible en `REDIS_URL`

## Arranque

```bash
cd back
cp .env.example .env   # completar variables
npm install
npm run start:dev
```

## Variables de entorno

```env
NODE_ENV=development
PORT=3001

DB_HOST=127.0.0.1
DB_PORT=54322
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=postgres

JWT_ACCESS_SECRET=min_32_chars
JWT_REFRESH_SECRET=min_32_chars_different
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=30d

REDIS_URL=redis://localhost:6379/0
```

## Migraciones
### Casos para considerar en las migraciones
- Correr cualquier comando de mikro-orm
```bash
npm run mikro -- <cualquier comando de https://mikro-orm.io/docs/quick-start>
# ej: npm run mikro migration:list
# Esto lista todas las migraciones ejecutaddas
# Revisar si se puede de manera directa por ejemplo ()
```
### Crear una migración (con nombre descriptivo)

```bash
npm run migration:create -- --name=add_users_table
# Genera: src/database/migrations/Migration<timestamp>_add_users_table.ts
```

> MikroORM compara el estado actual de la DB con las entidades y genera el diff SQL automáticamente.

### Aplicar migraciones pendientes

```bash
npm run migration:up
```

### Revertir la última migración

```bash
npm run migration:down
```

### Ver estado del schema

```bash
npm run schema:check
```

### Flujo completo (primera vez o tras agregar entidades)

```bash
npm run migration:create -- --name=init   # genera el SQL
npm run migration:up                      # aplica a la DB
```

## Seeders

Los seeders se ejecutan automáticamente al arrancar la app (`OnApplicationBootstrap`):

| Seeder | Qué hace |
|--------|----------|
| `SeedSuperadminService` | Crea el superadmin si no existe |
| `SeedRolesService` | Crea roles y permisos base si no existen |

Para crear un seeder manual via CLI (útil para datos de prueba en dev):

```bash
npm run mikro -- seeder:create NombreDelSeeder
# Genera: src/database/seeders/NombreDelSeeder.ts
```

Correr seeders manualmente:

```bash
npm run migration:fresh   # DROP + re-migra + corre seeders (solo dev)
```

> `migration:fresh --seed` borra todo y recrea desde cero. Nunca usar en producción.

## Verificar que funciona

```bash
curl http://localhost:3001/api/v1/health
# {"success":true,"data":{"status":"ok"}}
```

## Login del superadmin

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"thonyiuci@gmail.com","password":"canamas365"}'
```

## Estructura del proyecto

```
src/
├── app.module.ts
├── database/
│   ├── mikro-orm.config.ts          # Config ORM — lista explícita de entidades
│   ├── migration-runner.service.ts  # Corre migraciones al arrancar
│   ├── seed-superadmin.service.ts   # Seed automático del superadmin
│   └── migrations/                  # Archivos SQL generados
└── modules/
    ├── shared/
    │   ├── base.entity.ts           # BaseSchema: id (uuidv7), timestamps, deletedAt
    │   ├── exceptions/              # DomainException + GlobalExceptionFilter
    │   └── guards/                  # JwtAuthGuard, SuperadminGuard, PermissionGuard
    ├── auth/                        # Login, refresh, me
    ├── users/                       # CRUD usuarios + asignación a cooperativa
    ├── cooperatives/                # CRUD cooperativas
    ├── roles/                       # Roles + permisos + seed
    └── bundlings/                   # Registro de enfundado
```

## Convenciones

- **Entidades:** `defineEntity` + `extends: BaseSchema` + relaciones como `() => p.manyToOne(Entity)`
- **UUID v7** para todos los PKs
- **Hexagonal-lite:** handler por archivo, repositorio por módulo
- **Responses:** siempre `{ success, data, error }` via `ResponseFormatInterceptor`
- **Errores:** `GlobalExceptionFilter` — nunca expone SQL, mensajes en español

## Comportamiento al arrancar

1. `MigrationRunnerService` — aplica migraciones pendientes
2. `SeedRolesService` — crea roles y permisos si no existen
3. `SeedSuperadminService` — crea el superadmin si no existe
