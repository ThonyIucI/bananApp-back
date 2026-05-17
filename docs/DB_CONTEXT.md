# DB Context — CultivApp

> Single source of truth for all database models.
> **Update this file every time a new entity is added or an existing one changes.**
>
> Conventions:
> - All PKs: UUID v7
> - All tables: snake_case (via UnderscoreNamingStrategy)
> - Most entities: soft delete via `deleted_at` (nullable datetime) — pivot tables without business lifecycle omit it
> - Timestamps: `created_at`, `updated_at` auto-managed by MikroORM hooks

---

## Table of Contents
- [users](#users)
- [cooperatives](#cooperatives)
- [roles](#roles)
- [permissions](#permissions)
- [role_permission](#role_permission)
- [user_cooperative](#user_cooperative)
- [user_cooperative_role](#user_cooperative_role)
- [sectors](#sectors)
- [plots](#plots)
- [sub_plots](#sub_plots)
- [ribbon_calendars](#ribbon_calendars)
- [bundlings](#bundlings)

---

## `users`

| Column                  | Type         | Nullable | Default | Constraints | Description                                         |
|-------------------------|-------------|----------|---------|-------------|-----------------------------------------------------|
| `id`                    | uuid         | NO       | uuidv7  | PK          | UUID v7                                             |
| `first_name`            | varchar(100) | NO       |         |             |                                                     |
| `last_name`             | varchar(100) | NO       |         |             |                                                     |
| `email`                 | varchar(150) | NO       |         | UNIQUE      | Stored lowercase                                    |
| `password_hash`         | varchar(255) | NO       |         | HIDDEN      | bcrypt hash                                         |
| `dni`                   | varchar(8)   | YES      | NULL    |             | 8 digits                                            |
| `is_active`             | boolean      | NO       | true    |             |                                                     |
| `is_superadmin`         | boolean      | NO       | false   |             | Bypasses all RBAC                                   |
| `must_change_password`  | boolean      | NO       | false   |             |                                                     |
| `failed_login_attempts` | integer      | NO       | 0       |             | Reset on successful login                           |
| `locked_until`          | timestamptz  | YES      | NULL    |             | Lock after 5 failed attempts (15 min)               |
| `last_login_at`         | timestamptz  | YES      | NULL    |             |                                                     |
| `created_at`            | timestamptz  | NO       | now()   |             |                                                     |
| `updated_at`            | timestamptz  | NO       | now()   |             |                                                     |
| `deleted_at`            | timestamptz  | YES      | NULL    |             | Soft delete                                         |

---

## `cooperatives`

| Column       | Type         | Nullable | Default | Constraints | Description               |
|--------------|-------------|----------|---------|-------------|---------------------------|
| `id`         | uuid         | NO       | uuidv7  | PK          |                           |
| `name`       | varchar(200) | NO       |         |             | min 3 chars               |
| `ruc`        | varchar(11)  | NO       |         | UNIQUE      | Exactly 11 digits         |
| `address`    | varchar(300) | YES      | NULL    |             |                           |
| `department` | varchar(100) | YES      | NULL    |             |                           |
| `province`   | varchar(100) | YES      | NULL    |             |                           |
| `district`   | varchar(100) | YES      | NULL    |             |                           |
| `is_active`  | boolean      | NO       | true    |             |                           |
| `created_at` | timestamptz  | NO       | now()   |             |                           |
| `updated_at` | timestamptz  | NO       | now()   |             |                           |
| `deleted_at` | timestamptz  | YES      | NULL    |             | Soft delete               |

---

## `roles`

| Column        | Type         | Nullable | Default | Constraints | Description                                      |
|---------------|-------------|----------|---------|-------------|--------------------------------------------------|
| `id`          | uuid         | NO       | uuidv7  | PK          |                                                  |
| `key`         | varchar(50)  | NO       |         | UNIQUE      | English identifier: `enfundador`, `admin`, etc.  |
| `name`        | varchar(100) | NO       |         | UNIQUE      | Spanish display: `Enfundador`, `Administrador`   |
| `description` | varchar(300) | YES      | NULL    |             |                                                  |
| `created_at`  | timestamptz  | NO       | now()   |             |                                                  |
| `updated_at`  | timestamptz  | NO       | now()   |             |                                                  |
| `deleted_at`  | timestamptz  | YES      | NULL    |             |                                                  |

**Seed values:**

| key             | name            |
|-----------------|-----------------|
| `superadmin`    | Superadmin      |
| `admin`         | Administrador   |
| `socio`         | Socio           |
| `enfundador`    | Enfundador      |
| `harvest_chief` | Jefe de cosecha |
| `calibrator`    | Calibrador      |

---

## `permissions`

| Column        | Type         | Nullable | Default | Constraints | Description                     |
|---------------|-------------|----------|---------|-------------|---------------------------------|
| `id`          | uuid         | NO       | uuidv7  | PK          |                                 |
| `key`         | varchar(100) | NO       |         | UNIQUE      | e.g. `bundling_create`          |
| `description` | varchar(300) | YES      | NULL    |             |                                 |
| `created_at`  | timestamptz  | NO       | now()   |             |                                 |
| `updated_at`  | timestamptz  | NO       | now()   |             |                                 |
| `deleted_at`  | timestamptz  | YES      | NULL    |             |                                 |

**All permission keys:** `bundling_create`, `bundling_read`, `bundling_update`, `plot_read`, `plot_manage`, `cooperative_read`, `cooperative_manage`, `user_read`, `user_manage`, `sector_read`, `sector_manage`, `ribbon_calendar_read`, `ribbon_calendar_manage`, `sanction_read`, `sanction_manage`, `harvest_read`, `harvest_manage`

---

## `role_permission`

Pivot: which permissions each role has.

> ⚠️ Tabla pivot pura — no tiene `deleted_at` (sin lifecycle de negocio).

| Column         | Type        | Nullable | Constraints                    |
|----------------|-------------|----------|-------------------------------|
| `id`           | uuid        | NO       | PK                             |
| `role_id`      | uuid        | NO       | FK → roles.id CASCADE DELETE   |
| `permission_id`| uuid        | NO       | FK → permissions.id CASCADE    |

**UNIQUE:** (role_id, permission_id)

**Seed matrix:**

| Role            | Permissions                                                                        |
|-----------------|------------------------------------------------------------------------------------|
| `superadmin`    | ALL (`*`)                                                                          |
| `admin`         | cooperative_read, user_read, user_manage, sector_read, sector_manage, plot_read, plot_manage, ribbon_calendar_read, ribbon_calendar_manage, sanction_read, sanction_manage, harvest_read, harvest_manage |
| `socio`         | plot_read, bundling_read, harvest_read, ribbon_calendar_read                       |
| `enfundador`    | bundling_create, bundling_read, bundling_update, plot_read, ribbon_calendar_read   |
| `harvest_chief` | harvest_read, harvest_manage, plot_read, bundling_read                             |
| `calibrator`    | harvest_read, harvest_manage, plot_read                                            |

---

## `user_cooperative`

Membership: a user belongs to a cooperative.

| Column           | Type         | Nullable | Constraints                          |
|------------------|-------------|----------|-------------------------------------|
| `id`             | uuid         | NO       | PK                                   |
| `user_id`        | uuid         | NO       | FK → users.id CASCADE DELETE         |
| `cooperative_id` | uuid         | NO       | FK → cooperatives.id CASCADE DELETE  |
| `member_code`    | varchar(20)  | YES      | NULL, format: `[A-Z0-9\-]{3,20}`     |
| `is_active`      | boolean      | NO       | true                                 |
| `created_at`     | timestamptz  | NO       |                                      |
| `updated_at`     | timestamptz  | NO       |                                      |
| `deleted_at`     | timestamptz  | YES      |                                      |

**UNIQUE:** (user_id, cooperative_id)

---

## `user_cooperative_role`

Which roles a membership has within a cooperative.

| Column                | Type        | Nullable | Constraints                                  |
|-----------------------|-------------|----------|---------------------------------------------|
| `id`                  | uuid        | NO       | PK                                           |
| `user_cooperative_id` | uuid        | NO       | FK → user_cooperative.id CASCADE DELETE      |
| `role_id`             | uuid        | NO       | FK → roles.id CASCADE DELETE                 |
| `created_at`          | timestamptz | NO       |                                              |
| `updated_at`          | timestamptz | NO       |                                              |
| `deleted_at`          | timestamptz | YES      |                                              |

**UNIQUE:** (user_cooperative_id, role_id)

---

## `sectors`

Agrupación geográfica de parcelas dentro de una cooperativa.

| Column           | Type         | Nullable | Default | Constraints                         |
|------------------|-------------|----------|---------|-------------------------------------|
| `id`             | uuid         | NO       | uuidv7  | PK                                  |
| `name`           | varchar(100) | NO       |         |                                     |
| `cooperative_id` | uuid         | NO       |         | FK → cooperatives.id CASCADE DELETE |
| `created_at`     | timestamptz  | NO       | now()   |                                     |
| `updated_at`     | timestamptz  | NO       | now()   |                                     |
| `deleted_at`     | timestamptz  | YES      | NULL    | Soft delete                         |

---

## `plots`

Parcela agrícola perteneciente a un sector.

| Column           | Type           | Nullable | Default | Constraints                       |
|------------------|---------------|----------|---------|-----------------------------------|
| `id`             | uuid           | NO       | uuidv7  | PK                                |
| `name`           | varchar(200)   | NO       |         |                                   |
| `sector_id`      | uuid           | NO       |         | FK → sectors.id CASCADE DELETE    |
| `owner_user_id`  | uuid           | NO       |         | FK → users.id CASCADE DELETE      |
| `worker_user_id` | uuid           | YES      | NULL    | FK → users.id SET NULL            |
| `area_hectares`  | numeric(8,4)   | NO       |         |                                   |
| `cadastral_code` | varchar(50)    | YES      | NULL    |                                   |
| `created_at`     | timestamptz    | NO       | now()   |                                   |
| `updated_at`     | timestamptz    | NO       | now()   |                                   |
| `deleted_at`     | timestamptz    | YES      | NULL    | Soft delete                       |

---

## `sub_plots`

Subparcela dentro de una parcela, con responsable opcional.

| Column                | Type         | Nullable | Default | Constraints                    |
|-----------------------|-------------|----------|---------|--------------------------------|
| `id`                  | uuid         | NO       | uuidv7  | PK                             |
| `name`                | varchar(200) | NO       |         |                                |
| `plot_id`             | uuid         | NO       |         | FK → plots.id CASCADE DELETE   |
| `responsible_user_id` | uuid         | YES      | NULL    | FK → users.id SET NULL         |
| `area_hectares`       | numeric(8,4) | NO       |         |                                |
| `created_at`          | timestamptz  | NO       | now()   |                                |
| `updated_at`          | timestamptz  | NO       | now()   |                                |
| `deleted_at`          | timestamptz  | YES      | NULL    | Soft delete                    |

---

## `ribbon_calendars`

Calendario anual de colores de cinta por cooperativa.

| Column              | Type        | Nullable | Default | Constraints                         |
|---------------------|-------------|----------|---------|-------------------------------------|
| `id`                | uuid        | NO       | uuidv7  | PK                                  |
| `cooperative_id`    | uuid        | NO       |         | FK → cooperatives.id CASCADE DELETE |
| `year`              | integer     | NO       |         |                                     |
| `start_color_index` | integer     | NO       | 0       | Índice en RIBBON_COLORS_CYCLE        |
| `created_at`        | timestamptz | NO       | now()   |                                     |
| `updated_at`        | timestamptz | NO       | now()   |                                     |
| `deleted_at`        | timestamptz | YES      | NULL    | Soft delete                         |

---

## `bundlings`

Registro de enfunde: cuántas fundas colocó un enfundador en una parcela.

| Column                | Type         | Nullable | Default | Constraints                            |
|-----------------------|-------------|----------|---------|----------------------------------------|
| `id`                  | uuid         | NO       | uuidv7  | PK                                     |
| `plot_id`             | uuid         | NO       |         | FK → plots.id CASCADE DELETE           |
| `enfundador_user_id`  | uuid         | NO       |         | FK → users.id CASCADE DELETE           |
| `quantity`            | integer      | NO       |         |                                        |
| `ribbon_calendar_id`  | uuid         | YES      | NULL    | FK → ribbon_calendars.id SET NULL      |
| `ribbon_color_free`   | varchar(50)  | YES      | NULL    | Color libre cuando no hay calendario   |
| `bundled_at`          | timestamptz  | NO       |         | Fecha/hora real del enfunde            |
| `notes`               | varchar(500) | YES      | NULL    |                                        |
| `local_uuid`          | uuid         | NO       |         | UNIQUE — generado en cliente (offline) |
| `synced_at`           | timestamptz  | YES      | NULL    | Null si aún no sincronizado            |
| `created_at`          | timestamptz  | NO       | now()   |                                        |
| `updated_at`          | timestamptz  | NO       | now()   |                                        |
| `deleted_at`          | timestamptz  | YES      | NULL    | Soft delete                            |

**UNIQUE:** `local_uuid` — garantiza idempotencia en sincronización offline.

---

---

## `gaia_usages`

Cuotas diarias de interacción con GaIA por usuario. No almacena mensajes ni conversaciones — solo el conteo diario.

| Column              | Type        | Nullable | Default | Constraints                         |
|---------------------|-------------|----------|---------|-------------------------------------|
| `id`                | uuid        | NO       | uuidv7  | PK                                  |
| `user_id`           | uuid        | NO       |         | FK → users.id CASCADE DELETE        |
| `usage_date`        | varchar(10) | NO       |         | ISO date `YYYY-MM-DD`               |
| `interaction_count` | integer     | NO       | 0       |                                     |
| `token_estimate`    | integer     | YES      | NULL    | Para proyecciones de costo          |

**UNIQUE:** `(user_id, usage_date)` — una fila por usuario por día.
**INDEX:** `(user_id, usage_date)` para consultas frecuentes de cuota.

---

## Planned entities (próximos sprints)

| Entity     | Table        | Sprint | Notas                                           |
|------------|--------------|--------|-------------------------------------------------|
| UserPlot   | `user_plot`  | MVP2   | Acceso operativo N:M usuario ↔ parcela (este sprint) |
| Sanction   | `sanctions`  | 5      |                                                 |
| Harvest    | `harvests`   | 5      |                                                 |

---

## Deuda técnica

- Existen tablas residuales `user` y `cooperative` (singular) en el snapshot de Postgres sin migración que las cree. Son artefactos huérfanos. **No eliminar en MVP2**; documentado en `planning/mvp2/observaciones.md`.
