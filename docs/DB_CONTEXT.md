# DB Context — CultivApp

> Single source of truth for all database models.
> **Update this file every time a new entity is added or an existing one changes.**
>
> Conventions:
> - All PKs: UUID v7
> - All tables: snake_case (via UnderscoreNamingStrategy)
> - All entities: soft delete via `deleted_at` (nullable datetime)
> - Timestamps: `created_at`, `updated_at` auto-managed by MikroORM hooks

---

## Table of Contents
- [users](#users)
- [cooperatives](#cooperatives)
- [roles](#roles)
- [permissions](#permissions)
- [role_permissions](#role_permissions)
- [user_cooperatives](#user_cooperatives)
- [user_cooperative_roles](#user_cooperative_roles)

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

## `role_permissions`

Pivot: which permissions each role has.

| Column         | Type        | Nullable | Constraints                    |
|----------------|-------------|----------|-------------------------------|
| `id`           | uuid        | NO       | PK                             |
| `role_id`      | uuid        | NO       | FK → roles.id CASCADE DELETE   |
| `permission_id`| uuid        | NO       | FK → permissions.id CASCADE    |
| `created_at`   | timestamptz | NO       |                                |
| `updated_at`   | timestamptz | NO       |                                |
| `deleted_at`   | timestamptz | YES      |                                |

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

## `user_cooperatives`

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

## `user_cooperative_roles`

Which roles a membership has within a cooperative.

| Column                | Type        | Nullable | Constraints                                   |
|-----------------------|-------------|----------|----------------------------------------------|
| `id`                  | uuid        | NO       | PK                                            |
| `user_cooperative_id` | uuid        | NO       | FK → user_cooperatives.id CASCADE DELETE      |
| `role_id`             | uuid        | NO       | FK → roles.id CASCADE DELETE                  |
| `created_at`          | timestamptz | NO       |                                               |
| `updated_at`          | timestamptz | NO       |                                               |
| `deleted_at`          | timestamptz | YES      |                                               |

**UNIQUE:** (user_cooperative_id, role_id)

---

## Planned entities (next sprints)

| Entity          | Table              | Sprint |
|-----------------|--------------------|--------|
| Sector          | `sectors`          | 3      |
| Plot            | `plots`            | 3      |
| SubPlot    | `sub_plots`   | 3      |
| EnfundadorPlot  | `enfundador_plots` | 3      |
| RibbonCalendar  | `ribbon_calendars` | 4      |
| Bundling        | `bundlings`        | 4      |
| Sanction        | `sanctions`        | 5      |
