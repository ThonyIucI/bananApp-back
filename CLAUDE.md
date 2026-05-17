@../planning/rules.md

# Backend Knowledge Graph

Consulta `graphify-out/GRAPH_REPORT.md` para navegar el grafo de dependencias.
Actualiza con: `/graphify . --update` tras agregar o modificar archivos.
El post-commit hook actualiza el grafo y el vault de Obsidian automáticamente tras cada commit.

## MikroORM conventions

- Entities registradas en `src/database/mikro-orm.config.ts` — toda entity nueva va aquí
- Migraciones: `npx mikro-orm migration:create --name <acción>_<tabla>`
- Nunca crear archivos de migración a mano; usar el CLI para actualizar el snapshot
- `snapshot: true` — el snapshot vive en `src/database/migrations/.snapshot-postgres.json`
