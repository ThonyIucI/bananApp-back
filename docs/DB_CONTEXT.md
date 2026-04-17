# DB Context — bananApp

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

---

## `users`

Stores all system users regardless of role or cooperative membership.
Role assignment is handled through the `user_cooperatives` pivot (see future module).

| Column                  | Type         | Nullable | Default | Constraints       | Description                                          |
|-------------------------|-------------|----------|---------|-------------------|------------------------------------------------------|
| `id`                    | uuid         | NO       | uuidv7  | PK                | UUID v7 — time-ordered                               |
| `first_name`            | varchar(100) | NO       |         |                   | First name                                           |
| `last_name`             | varchar(100) | NO       |         |                   | Last name                                            |
| `email`                 | varchar(150) | NO       |         | UNIQUE            | Login email, stored lowercase                        |
| `password_hash`         | varchar(255) | NO       |         | HIDDEN            | bcrypt hash (cost 12 for superadmin, 10 for others)  |
| `dni`                   | varchar(8)   | YES      | NULL    |                   | Peruvian national ID (8 digits)                      |
| `is_active`             | boolean      | NO       | true    |                   | Soft-disable without deleting                        |
| `is_superadmin`         | boolean      | NO       | false   |                   | Platform-level superadmin (bypasses all RBAC)        |
| `must_change_password`  | boolean      | NO       | false   |                   | Force password change on next login                  |
| `failed_login_attempts` | integer      | NO       | 0       |                   | Counter reset on successful login                    |
| `locked_until`          | timestamptz  | YES      | NULL    |                   | Set when failed_login_attempts >= 5 (lock 15 min)    |
| `last_login_at`         | timestamptz  | YES      | NULL    |                   | Updated on every successful login                    |
| `created_at`            | timestamptz  | NO       | now()   |                   | Auto-set on insert                                   |
| `updated_at`            | timestamptz  | NO       | now()   |                   | Auto-updated on every flush                          |
| `deleted_at`            | timestamptz  | YES      | NULL    |                   | Soft delete — NULL means active record               |

### Domain rules (enforced in `User.validate()`)
- `first_name` ≥ 2 chars
- `last_name` ≥ 2 chars
- `email` must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- `dni` if present must match `/^\d{8}$/` (exactly 8 digits)
- Account locks for 15 min after 5 consecutive failed login attempts

### Relationships
_(none yet — will expand when cooperative + role modules are added)_

---

## Planned entities (not yet implemented)

These will be added in upcoming sprints:

| Entity             | Table                    | Sprint |
|--------------------|--------------------------|--------|
| Cooperative        | `cooperatives`           | 2      |
| Sector             | `sectors`                | 2      |
| Plot               | `plots`                  | 2      |
| InternalMark       | `internal_marks`         | 2      |
| UserCooperative    | `user_cooperatives`      | 2      |
| PhoneNumber        | `phone_numbers`          | 2      |
| Role               | `roles`                  | 2      |
| Permission         | `permissions`            | 2      |
| RolePermission     | `role_permissions`       | 2      |
| EnfundadorPlot     | `enfundador_plots`       | 3      |
| RibbonCalendar     | `ribbon_calendars`       | 3      |
| Bundling           | `bundlings`              | 3      |
| Sanction           | `sanctions`              | 4      |
