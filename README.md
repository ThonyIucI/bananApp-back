# bananApp — Back

NestJS + MikroORM v7 + PostgreSQL 16 + Redis 7. Corre dentro de Docker.

## Requisitos

- Docker Desktop o Docker Engine + Docker Compose plugin
- Puertos libres en el host: **3000** (API), **5432** (Postgres), **6380** (Redis)

## Primer arranque (solo la primera vez)

```bash
cd saas/back
cp .env.example .env
# Edita .env con tus valores (ver sección de variables de entorno abajo)
sudo docker compose up --build
```

## Levantar los contenedores (arranques siguientes)

```bash
cd saas/back
sudo docker compose up
```

En background:
```bash
sudo docker compose up -d
```

Ver logs en tiempo real:
```bash
sudo docker compose logs -f api
```

## Detener los contenedores

```bash
sudo docker compose down
```

Borrar también la base de datos (volúmenes):
```bash
sudo docker compose down -v
```

## Variables de entorno

Copia `.env.example` a `.env` y completa:

```env
NODE_ENV=development
PORT=3000

# PostgreSQL
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password_aqui
DB_NAME=bananapp

# JWT — usá strings aleatorios largos (mínimo 32 caracteres)
JWT_ACCESS_SECRET=cambia_esto_por_un_secreto_largo_y_aleatorio
JWT_REFRESH_SECRET=cambia_esto_por_otro_secreto_diferente
JWT_ACCESS_EXPIRES_IN=3600
JWT_REFRESH_EXPIRES_IN=2592000

# Redis
REDIS_URL=redis://redis:6379
```

> `DB_HOST=db` y `redis://redis` usan los nombres de servicio de Docker Compose.
> No los cambies a menos que corras la API fuera de Docker.

## Verificar que está funcionando

```bash
curl http://localhost:3000/api/v1/health
# Respuesta esperada: {"status":"ok"}
```

## Login del superadmin (creado automáticamente al primer arranque)

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"thonyiuci@gmail.com","password":"canamas365"}'
```

## Estructura del proyecto

```
src/
├── app.module.ts               # Módulo raíz
├── database/
│   ├── mikro-orm.config.ts     # Configuración ORM (UnderscoreNamingStrategy)
│   ├── migration-runner.service.ts  # Crea/actualiza schema al arrancar (OnModuleInit)
│   └── seed-superadmin.service.ts   # Crea el superadmin si no existe (OnApplicationBootstrap)
└── modules/
    ├── shared/
    │   ├── base.entity.ts      # BaseProperties: id (uuidv7), timestamps, deletedAt
    │   ├── exceptions/         # DomainException y subclases (errores en español)
    │   ├── guards/             # JwtAuthGuard
    │   └── interceptors/       # ResponseFormatInterceptor → { success, data, error }
    └── auth/
        ├── commands/login.handler.ts
        └── http/auth.controller.ts
```

## Convenciones de arquitectura

- **Hexagonal-lite:** `domain/` → `application/` → `infrastructure/`
- **Un handler por archivo** — `commands/login.handler.ts`, `queries/get-user.handler.ts`
- **Entidades** con `defineEntity` + `p.*` (MikroORM v7 — sin decoradores legacy)
- **UUID v7** para todos los PKs — package `uuidv7`
- **Responses:** siempre `{ success, data, error }` via `ResponseFormatInterceptor`
- **Errores:** nunca expone SQL — `GlobalExceptionFilter` traduce todo a español

## Comportamiento en el primer arranque

1. `MigrationRunnerService` (`OnModuleInit`) — crea el schema en Postgres
2. `SeedSuperadminService` (`OnApplicationBootstrap`) — crea el superadmin:
   - Email: `thonyiuci@gmail.com`
   - Contraseña: `canamas365`

## Puertos expuestos

| Servicio   | Host              | Contenedor |
|------------|-------------------|------------|
| API        | `0.0.0.0:3000`    | 3000       |
| Debug      | `0.0.0.0:9229`    | 9229       |
| PostgreSQL | `127.0.0.1:5432`  | 5432       |
| Redis      | `127.0.0.1:6380`  | 6379       |

> Postgres y Redis solo son accesibles desde `localhost` — no desde la red local.
> La API (puerto 3000) sí es accesible desde el celular en la misma red.

## Comandos útiles

```bash
# Ver estado de contenedores
sudo docker compose ps

# Acceder a la base de datos
sudo docker compose exec db psql -U postgres -d bananapp

# Reiniciar solo la API (sin tocar DB ni Redis)
sudo docker compose restart api

# Logs de un servicio específico
sudo docker compose logs -f db
```
