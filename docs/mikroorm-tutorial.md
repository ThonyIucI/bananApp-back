# Tutorial Completo de MikroORM v7

> Basado en la documentación oficial: https://mikro-orm.io/docs/quick-start  
> Versión: **7.0** (actualizada marzo 2026)

---

## Tabla de Contenidos

1. [¿Qué es MikroORM?](#1-qué-es-mikroorm)
2. [Instalación](#2-instalación)
3. [Configuración inicial](#3-configuración-inicial)
4. [Definición de Entidades](#4-definición-de-entidades)
5. [Tipos de Propiedades](#5-tipos-de-propiedades)
6. [Relaciones entre Entidades](#6-relaciones-entre-entidades)
7. [Enums](#7-enums)
8. [Índices y Restricciones](#8-índices-y-restricciones)
9. [Base Entity personalizada](#9-base-entity-personalizada)
10. [Entity Manager](#10-entity-manager)
11. [Consultas avanzadas](#11-consultas-avanzadas)
12. [Migraciones y Schema](#12-migraciones-y-schema)
13. [CLI de MikroORM](#13-cli-de-mikroorm)
14. [Repositorios (Repositories)](#14-repositorios-repositories)
15. [Patterns recomendados](#15-patterns-recomendados)

---

## 1. ¿Qué es MikroORM?

MikroORM es un ORM TypeScript/JavaScript para Node.js que implementa los patrones **Data Mapper**, **Unit of Work** e **Identity Map**. Sus principales características:

- Soporte para múltiples bases de datos: PostgreSQL, MySQL, MariaDB, SQLite, MongoDB, LibSQL/Turso, MSSQL, Oracle
- Definición de entidades mediante `defineEntity` (sin decoradores) o decoradores legacy
- Type-safety completo con TypeScript
- Gestión de cambios automática (Unit of Work)
- CLI potente para migraciones y schema

---

## 2. Instalación

Instala el core y el driver para tu base de datos:

```bash
# PostgreSQL
npm install @mikro-orm/core @mikro-orm/postgresql

# MySQL / MariaDB
npm install @mikro-orm/core @mikro-orm/mysql

# SQLite
npm install @mikro-orm/core @mikro-orm/sqlite

# MongoDB
npm install @mikro-orm/core @mikro-orm/mongodb

# LibSQL / Turso
npm install @mikro-orm/core @mikro-orm/libsql

# CLI (siempre como dev dependency, versión debe coincidir con @mikro-orm/core)
npm install --save-dev @mikro-orm/cli
```

---

## 3. Configuración inicial

### Archivo de configuración

Crea `src/mikro-orm.config.ts`. Usa `defineConfig` para obtener intellisense automático:

```typescript
import { defineConfig } from '@mikro-orm/postgresql';
import { Author, Book, BookTag } from './entities';

export default defineConfig({
  entities: [Author, Book, BookTag],
  dbName: 'my_database',
  user: 'postgres',
  password: 'secret',
  host: 'localhost',
  port: 5432,
  // debug: true, // Activa logs de queries en desarrollo
});
```

> `defineConfig` importado desde el paquete del driver infiere automáticamente la opción `driver`, así no tienes que especificarla.

### Inicialización en tu app

```typescript
import { MikroORM, RequestContext } from '@mikro-orm/postgresql';
import express from 'express';

const app = express();

async function bootstrap() {
  const orm = await MikroORM.init(); // Busca automáticamente mikro-orm.config.ts

  // IMPORTANTE: crea un contexto por cada request HTTP
  // Esto aísla el identity map de cada petición
  app.use((req, res, next) => {
    RequestContext.create(orm.em, next);
  });

  // Tus rutas aquí...
  
  app.listen(3000);
}

bootstrap();
```

> Registra el middleware de `RequestContext` **después** de bodyParser/queryParser y **antes** de tus rutas.

### Acceder al EntityManager en rutas

```typescript
import { EntityManager } from '@mikro-orm/postgresql';
import { RequestContext } from '@mikro-orm/core';

app.get('/books', async (req, res) => {
  const em = RequestContext.getEntityManager()!;
  const books = await em.findAll(Book, { populate: ['author'] });
  res.json(books);
});
```

---

## 4. Definición de Entidades

MikroORM v7 ofrece tres formas de definir entidades. La recomendada para proyectos nuevos es **`defineEntity` con clase**.

### Enfoque 1: `defineEntity` + clase (RECOMENDADO)

Combina type-safety total con la posibilidad de agregar métodos propios:

```typescript
// entities/Author.ts
import { defineEntity, p } from '@mikro-orm/core';
import { v4 } from 'uuid';

const AuthorSchema = defineEntity({
  name: 'Author',
  properties: {
    id: p.uuid().primary().onCreate(() => v4()),
    createdAt: p.datetime().onCreate(() => new Date()),
    updatedAt: p.datetime()
      .onCreate(() => new Date())
      .onUpdate(() => new Date()),
    name: p.string(),
    email: p.string().unique(),
    age: p.integer().nullable(),
    bio: p.text().lazy(), // No se carga por defecto (campo pesado)
    books: () => p.oneToMany(Book).mappedBy(book => book.author),
  },
});

export class Author extends AuthorSchema.class {
  // Puedes agregar métodos personalizados
  getDisplayName(): string {
    return `${this.name} <${this.email}>`;
  }
}

AuthorSchema.setClass(Author);
```

```typescript
// entities/Book.ts
import { defineEntity, p } from '@mikro-orm/core';

const BookSchema = defineEntity({
  name: 'Book',
  properties: {
    id: p.integer().primary(),
    title: p.string(),
    price: p.decimal().nullable(),
    author: () => p.manyToOne(Author),
    publisher: () => p.manyToOne(Publisher).ref().nullable(),
    tags: () => p.manyToMany(BookTag).fixedOrder(),
  },
});

export class Book extends BookSchema.class {}
BookSchema.setClass(Book);
```

### Enfoque 2: `defineEntity` sin clase

Útil para entidades simples sin métodos. Usa `InferEntity` para tipar el objeto:

```typescript
import { defineEntity, InferEntity, p } from '@mikro-orm/core';

export const BookTag = defineEntity({
  name: 'BookTag',
  properties: {
    id: p.integer().primary(),
    name: p.string().unique(),
    books: () => p.manyToMany(Book).mappedBy(book => book.tags),
  },
});

export type IBookTag = InferEntity<typeof BookTag>;
```

### Enfoque 3: Decoradores (legacy, requiere configuración extra)

```typescript
import { Entity, PrimaryKey, Property, ManyToOne, ManyToMany, Collection } from '@mikro-orm/decorators/legacy';

@Entity()
export class Book {
  @PrimaryKey()
  id!: number;

  @Property()
  title!: string;

  @ManyToOne(() => Author)
  author!: Author;

  @ManyToMany(() => BookTag, { fixedOrder: true })
  tags = new Collection<BookTag>(this);
}
```

> Para usar decoradores debes configurar el MetadataProvider. Consulta [Using Decorators](https://mikro-orm.io/docs/using-decorators).

---

## 5. Tipos de Propiedades

### Tipos básicos disponibles con `p.*`

```typescript
const EntitySchema = defineEntity({
  name: 'Example',
  properties: {
    // Números
    id: p.integer().primary(),           // INT autoincrement
    bigId: p.bigint().primary(),         // BIGINT
    price: p.decimal(),                  // DECIMAL
    score: p.float(),                    // FLOAT
    
    // Texto
    name: p.string(),                    // VARCHAR(255)
    name2: p.string().length(100),       // VARCHAR(100)
    content: p.text(),                   // TEXT
    
    // Fechas
    createdAt: p.datetime(),             // TIMESTAMP
    birthDate: p.date(),                 // DATE
    loginTime: p.time(),                 // TIME
    
    // Otros
    isActive: p.boolean(),
    metadata: p.json(),                  // JSON/JSONB
    tags: p.array(),                     // Array (texto separado por coma en SQL)
    
    // UUIDs
    uuid: p.uuid().primary().onCreate(() => v4()),
    
    // MongoDB
    _id: p.type(ObjectId).primary(),
    serialId: p.string().serializedPrimaryKey(),
  },
});
```

### Modificadores de propiedades

```typescript
properties: {
  // Nullable
  bio: p.text().nullable(),

  // Valor por defecto (JS-side, antes de persistir)
  status: p.string().onCreate(() => 'active'),

  // Valor por defecto (DB-side, después de persistir)
  score: p.integer().default(0),
  createdAt: p.datetime().defaultRaw('now()'),

  // Actualización automática
  updatedAt: p.datetime().onUpdate(() => new Date()),

  // Propiedad lazy (se omite en SELECT por defecto)
  fullText: p.text().lazy(),

  // Oculta en serialización JSON
  password: p.string().hidden(),

  // Índice simple
  email: p.string().unique(),
  age: p.integer().index(),

  // Columna generada (SQL)
  fullName: p.string()
    .length(100)
    .generated(cols => `(concat(${cols.firstName}, ' ', ${cols.lastName})) stored`),
}
```

### Propiedades virtuales (computed)

```typescript
const UserSchema = defineEntity({
  name: 'User',
  properties: {
    firstName: p.string().hidden(),
    lastName: p.string().hidden(),
    // Virtual: método
    fullName: p.type('method').persist(false).getter().getterName('getFullName'),
    // Virtual: getter JS
    initials: p.type('method').persist(false).getter(),
  },
});

export class User extends UserSchema.class {
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  get initials(): string {
    return `${this.firstName[0]}.${this.lastName[0]}.`;
  }
}
UserSchema.setClass(User);
```

### Propiedad fórmula SQL

```typescript
import { quote } from '@mikro-orm/core';

const BoxSchema = defineEntity({
  name: 'Box',
  properties: {
    length: p.integer(),
    height: p.integer(),
    width: p.integer(),
    // Columna calculada con SQL
    volume: p.integer().formula(
      cols => quote`${cols.length} * ${cols.height} * ${cols.width}`
    ),
  },
});
```

---

## 6. Relaciones entre Entidades

### Many-to-One (N:1)

```typescript
// Muchos libros → un autor
const BookSchema = defineEntity({
  name: 'Book',
  properties: {
    author: () => p.manyToOne(Author),
    
    // Con Ref wrapper (acceso lazy type-safe)
    publisher: () => p.manyToOne(Publisher).ref().nullable(),
  },
});
```

### One-to-Many (1:N)

```typescript
// Un autor → muchos libros
const AuthorSchema = defineEntity({
  name: 'Author',
  properties: {
    books: () => p.oneToMany(Book).mappedBy(book => book.author),
    // Con ordenamiento por defecto en la relación
    recentBooks: () => p.oneToMany(Book)
      .mappedBy(book => book.author)
      .orderBy({ createdAt: QueryOrder.DESC }),
  },
});
```

### Many-to-Many (N:N)

```typescript
// Libro ↔ BookTag (tabla pivot automática)
const BookSchema = defineEntity({
  name: 'Book',
  properties: {
    tags: () => p.manyToMany(BookTag).fixedOrder(), // owner side
  },
});

const BookTagSchema = defineEntity({
  name: 'BookTag',
  properties: {
    books: () => p.manyToMany(Book).mappedBy(book => book.tags), // inverse side
  },
});
```

### One-to-One (1:1)

```typescript
const UserSchema = defineEntity({
  name: 'User',
  properties: {
    profile: () => p.oneToOne(UserProfile).nullable(),
  },
});

const UserProfileSchema = defineEntity({
  name: 'UserProfile',
  properties: {
    user: () => p.oneToOne(User).mappedBy('profile'),
    bio: p.text().nullable(),
  },
});
```

### Usando colecciones

```typescript
// Inicialización y uso de colecciones
const author = await em.findOne(Author, 1, { populate: ['books'] });

// Iteración
for (const book of author.books) {
  console.log(book.title);
}

// Agregar a colección
const newBook = em.create(Book, { title: 'New Book', author });
author.books.add(newBook);
await em.flush();

// Eliminar de colección
author.books.remove(book);
await em.flush();
```

### Ref wrapper para carga lazy type-safe

```typescript
// Con .ref() el publisher es un Ref<Publisher>
const book = await em.findOne(Book, 1);

// Verificar si está cargado
console.log(book.publisher?.isInitialized()); // false

// Cargar bajo demanda
const publisher = await book.publisher?.load();
console.log(publisher?.name);

// O acceder directamente si ya está cargado
const name = book.publisher?.$?.name; // undefined si no está cargado
```

---

## 7. Enums

```typescript
// Enum como string en TypeScript
export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  USER = 'user',
}

// Enum numérico
export const enum UserStatus {
  DISABLED,
  ACTIVE,
}

const UserSchema = defineEntity({
  name: 'User',
  properties: {
    // String enum
    role: p.enum(() => UserRole),
    
    // Enum numérico
    status: p.enum(() => UserStatus),
    
    // Array de enum (valida en flush)
    permissions: p.enum(() => UserRole).array().default([UserRole.USER]),
    
    // Enum nativo de PostgreSQL (en lugar de CHECK constraint)
    roleNative: p.enum(() => UserRole).nativeEnumName('user_role_enum'),
    
    // Enum inline (sin definir enum de TypeScript)
    tier: p.enum(['free', 'pro', 'enterprise']),
  },
});
```

---

## 8. Índices y Restricciones

```typescript
const AuthorSchema = defineEntity({
  name: 'Author',
  properties: {
    email: p.string().unique(),
    age: p.integer().nullable().index(),           // índice con nombre generado
    born: p.date().nullable().index('born_idx'),   // índice con nombre personalizado
    name: p.string(),
    country: p.string(),
    price1: p.integer(),
    price2: p.integer(),
  },
  // Índices compuestos
  indexes: [
    { properties: ['name', 'age'] },
    { name: 'idx_name_country', properties: ['name', 'country'] },
  ],
  // Únicos compuestos
  uniques: [
    { properties: ['name', 'email'] },
  ],
  // Check constraints (solo PostgreSQL)
  checks: [
    { expression: 'price1 >= 0' },
    { name: 'price2_positive', expression: cols => `${cols.price2} >= 0` },
  ],
});
```

---

## 9. Base Entity personalizada

Define propiedades comunes para todas las entidades:

```typescript
// entities/BaseEntity.ts
import { defineEntity, p } from '@mikro-orm/core';
import { v4 } from 'uuid';

// Reutilizable como objeto de propiedades
export const BaseProperties = {
  id: p.uuid().primary().onCreate(() => v4()),
  createdAt: p.datetime().onCreate(() => new Date()).nullable(),
  updatedAt: p.datetime()
    .onCreate(() => new Date())
    .onUpdate(() => new Date())
    .nullable(),
};
```

```typescript
// entities/Article.ts
import { defineEntity, p } from '@mikro-orm/core';
import { BaseProperties } from './BaseEntity';

const ArticleSchema = defineEntity({
  name: 'Article',
  properties: {
    ...BaseProperties,
    title: p.string(),
    content: p.text(),
    author: () => p.manyToOne(Author),
  },
});

export class Article extends ArticleSchema.class {}
ArticleSchema.setClass(Article);
```

### Ordenamiento por defecto de la entidad

```typescript
import { QueryOrder } from '@mikro-orm/core';

const CommentSchema = defineEntity({
  name: 'Comment',
  // Se aplica automáticamente en em.find() y al popular relaciones
  orderBy: { createdAt: QueryOrder.DESC, id: QueryOrder.DESC },
  properties: {
    id: p.integer().primary(),
    createdAt: p.datetime(),
    text: p.string(),
    post: () => p.manyToOne(Post),
  },
});
```

---

## 10. Entity Manager

El `EntityManager` (EM) es el corazón del ORM. Implementa el patrón **Unit of Work**: acumula cambios en memoria y los persiste todos juntos en `flush()`.

### Crear entidades

```typescript
// em.create() registra la entidad automáticamente para persistir
const author = em.create(Author, {
  name: 'Jon Snow',
  email: 'jon@wall.st',
});

const book = em.create(Book, {
  title: 'A Song of Ice and Fire',
  author, // referencia directa al objeto creado
});

// Un solo flush escribe todo en la DB
await em.flush();
```

### Actualizar entidades

```typescript
// Las entidades cargadas son "managed" — solo cambia la propiedad y haz flush
const book = await em.findOne(Book, 1);
book.title = 'New Title';
await em.flush(); // UPDATE automático

// Actualizar referencia no cargada (sin SELECT)
const bookRef = em.getReference(Book, 1);
bookRef.title = 'Updated without loading';
await em.flush();
```

### Eliminar entidades

```typescript
// Por instancia
const book = await em.findOne(Book, 1);
em.remove(book);
await em.flush();

// Por referencia (sin cargar)
em.remove(em.getReference(Book, 2));
await em.flush();

// Query directa (sin hooks)
await em.nativeDelete(Book, { price: { $lt: 0 } });
```

### Buscar entidades

```typescript
// findOne — retorna null si no existe
const book = await em.findOne(Book, 1);
const book2 = await em.findOne(Book, { title: 'My Book' });

// findOneOrFail — lanza Error si no existe
const book3 = await em.findOneOrFail(Book, 99);

// find — múltiples entidades
const books = await em.find(Book, { price: { $gt: 10 } });

// findAll — sin filtro WHERE (equivale a find con {})
const allBooks = await em.findAll(Book);

// Con populate (cargar relaciones)
const booksWithAuthor = await em.find(Book, {}, { populate: ['author', 'tags'] });

// Carga parcial (solo algunas columnas)
const partialBook = await em.findOne(Book, 1, {
  fields: ['title', 'price'],
});

// Con límite, offset y orden
const paginated = await em.find(Book, {}, {
  limit: 10,
  offset: 20,
  orderBy: { createdAt: QueryOrder.DESC },
});
```

### Paginación

```typescript
// Offset-based
const [books, total] = await em.findAndCount(Book, {}, { limit: 10, offset: 0 });
console.log(`Mostrando ${books.length} de ${total}`);

// Cursor-based (más eficiente en tablas grandes)
const cursor = await em.findByCursor(Book, {
  first: 10,
  orderBy: { id: QueryOrder.ASC },
});

// Siguiente página
const nextPage = await em.findByCursor(Book, {
  first: 10,
  after: cursor.endCursor,
  orderBy: { id: QueryOrder.ASC },
});

console.log(cursor.hasNextPage); // boolean
console.log(cursor.totalCount);  // número total
```

### Upsert (insert o update)

```typescript
// Inserta si no existe, actualiza si existe (basado en unique key)
const author = await em.upsert(Author, { email: 'jon@snow.com', age: 33 });

// Múltiples a la vez
const [a1, a2] = await em.upsertMany(Author, [
  { email: 'a1@test.com', name: 'Alice' },
  { email: 'a2@test.com', name: 'Bob' },
]);

// Con control del conflict
await em.upsert(Author, { email: 'jon@snow.com', age: 34 }, {
  onConflictFields: ['email'],
  onConflictAction: 'merge',
  onConflictExcludeFields: ['id', 'createdAt'],
});
```

### Actualización atómica con `raw()`

```typescript
import { raw } from '@mikro-orm/core';

// UPDATE atómico sin race conditions
const author = em.getReference(Author, 1);
author.age = raw<number>('age + 1');
await em.flush();
console.log(author.age); // valor real disponible DESPUÉS del flush
```

### Streaming para datasets grandes

```typescript
const stream = em.stream(Book, {
  where: { price: { $gt: 100 } },
  orderBy: { id: QueryOrder.ASC },
  populate: ['author'],
});

for await (const book of stream) {
  // Procesa un libro a la vez sin cargar todo en memoria
  console.log(book.title);
}
```

---

## 11. Consultas avanzadas

### Operadores de filtro

```typescript
const books = await em.find(Book, {
  // Comparación
  price: { $gt: 10, $lte: 100 },
  
  // IN / NOT IN
  status: { $in: ['published', 'featured'] },
  authorId: { $nin: [1, 2, 3] },
  
  // LIKE / REGEXP
  title: { $like: '%Harry Potter%' },
  slug: { $re: '^hp-' },
  
  // NULL check
  deletedAt: null,
  
  // Operadores lógicos
  $or: [
    { price: { $lt: 5 } },
    { title: { $like: '%free%' } },
  ],
  $and: [
    { id: { $gt: 10 } },
    { id: { $lt: 100 } },
  ],
});
```

### Query Builder

```typescript
import { EntityManager } from '@mikro-orm/postgresql';

const em = orm.em as EntityManager;

const qb = em.createQueryBuilder(Book, 'b');
const books = await qb
  .select(['b.title', 'b.price', 'a.name'])
  .join('b.author', 'a')
  .where({ 'b.price': { $gt: 20 } })
  .andWhere('a.age > ?', [25])
  .orderBy({ 'b.price': QueryOrder.DESC })
  .limit(10)
  .getResultList();
```

### Raw SQL

```typescript
import { sql, raw } from '@mikro-orm/core';

// En WHERE
const users = await em.find(User, {
  [sql`lower(email)`]: 'user@example.com',
});

// En ORDER BY
const results = await em.find(User, {}, {
  orderBy: { [sql`(score * 2)`]: QueryOrder.DESC },
});
```

### Buscar por campos de relaciones

```typescript
// Auto-join en el WHERE (no carga la relación, solo filtra)
const author = await em.findOne(Author, {
  books: { tags: { name: 'sci-fi' } },
});

// Para tener la relación cargada, agrega populate
const authorWithBooks = await em.findOne(Author, {
  books: { tags: { name: 'sci-fi' } },
}, {
  populate: ['books.tags'],
});
```

### Carga lazy de propiedades lazy

```typescript
const book = await em.findOne(Book, 1);
// book.fullText es undefined porque es lazy

const bookWithText = await em.findOne(Book, 1, {
  populate: ['fullText'],
});
// Ahora book.fullText está disponible
```

---

## 12. Migraciones y Schema

### Generar y ejecutar migraciones

```bash
# Crear nueva migración basada en cambios del schema
npx mikro-orm migration:create

# Ejecutar migraciones pendientes
npx mikro-orm migration:up

# Revertir última migración
npx mikro-orm migration:down

# Ver migraciones pendientes
npx mikro-orm migration:pending

# Ver migraciones ejecutadas
npx mikro-orm migration:list

# Limpiar DB y re-ejecutar todo (desarrollo)
npx mikro-orm migration:fresh
```

### Operaciones de schema directas (sin migraciones)

```bash
# Crear schema desde cero
npx mikro-orm schema:create --run

# Actualizar schema según entidades
npx mikro-orm schema:update --run

# Eliminar schema
npx mikro-orm schema:drop --run

# Eliminar y recrear (peligroso en producción)
npx mikro-orm schema:fresh --run
```

### SchemaGenerator en código

```typescript
const generator = orm.getSchemaGenerator();

// Solo mostrar SQL (sin ejecutar)
const sql = await generator.getCreateSchemaSQL();
console.log(sql);

// Ejecutar
await generator.createSchema();
await generator.updateSchema();
```

---

## 13. CLI de MikroORM

### Setup del CLI

```json
// package.json
{
  "mikro-orm": {
    "configPaths": [
      "./src/mikro-orm.config.ts",
      "./dist/mikro-orm.config.js"
    ],
    "preferTs": true
  }
}
```

### Variables de entorno útiles

```bash
MIKRO_ORM_CLI_CONFIG=./src/mikro-orm.config.ts
MIKRO_ORM_CLI_PREFER_TS=true
MIKRO_ORM_CLI_TS_LOADER=tsx   # tsx, swc, oxc, jiti, tsimp
MIKRO_ORM_CLI_VERBOSE=true    # Muestra queries durante migraciones
```

### Comandos disponibles

```bash
npx mikro-orm debug                        # Verifica la configuración
npx mikro-orm cache:clear                  # Limpia caché de metadata
npx mikro-orm generate-entities            # Genera entidades desde la DB existente
npx mikro-orm database:create              # Crea la base de datos si no existe
npx mikro-orm seeder:create NombreSeeder   # Crea un seeder
npx mikro-orm seeder:run                   # Ejecuta seeders
```

---

## 14. Repositorios (Repositories)

Los repositorios son una capa conveniente sobre el `EntityManager`:

```typescript
// Repositorio genérico
const bookRepo = em.getRepository(Book);

const book = await bookRepo.findOne({ title: 'My Book' });
const books = await bookRepo.findAll({ populate: ['author'] });

// Repositorio personalizado
import { EntityRepository } from '@mikro-orm/postgresql';

export class BookRepository extends EntityRepository<Book> {
  async findPublished(): Promise<Book[]> {
    return this.find({ status: 'published' }, {
      orderBy: { createdAt: QueryOrder.DESC },
    });
  }

  async findByAuthorEmail(email: string): Promise<Book[]> {
    return this.find({ author: { email } });
  }
}
```

Registra el repositorio en la entidad:

```typescript
const BookSchema = defineEntity({
  name: 'Book',
  repository: () => BookRepository,
  properties: {
    // ...
  },
});
```

Uso:

```typescript
// TypeScript infiere el tipo correctamente
const bookRepo = em.getRepository(Book) as BookRepository;
const published = await bookRepo.findPublished();
```

---

## 15. Patterns recomendados

### Configuración multi-contexto (multi-tenant, CLI vs app)

```typescript
import { defineConfig } from '@mikro-orm/postgresql';

export default [
  // Config para la app (usuario con permisos limitados)
  defineConfig({
    contextName: 'default',
    entities: [Author, Book],
    dbName: 'myapp',
    user: 'app_user',
  }),
  // Config para el CLI (usuario admin para migraciones)
  defineConfig({
    contextName: 'super',
    entities: [Author, Book],
    dbName: 'myapp',
    user: 'admin',
  }),
];
```

```bash
# Usar config de admin para migraciones
npx mikro-orm migration:up --contextName=super
```

### Extend EntityManager con métodos propios

```typescript
import { MikroORM, EntityManager } from '@mikro-orm/sqlite';

class AppEntityManager extends EntityManager {
  async findOrCreate<T>(entityName: string, data: Partial<T>): Promise<T> {
    const existing = await this.findOne<T>(entityName, data as any);
    if (existing) return existing;
    return this.create<T>(entityName, data as any);
  }
}

const orm = await MikroORM.init({
  entities: [...],
  dbName: ':memory:',
  entityManager: AppEntityManager,
});
```

### Unit of Work pattern en servicios

```typescript
// services/BookService.ts
export class BookService {
  constructor(private em: EntityManager) {}

  async createBookWithTags(
    title: string,
    authorId: string,
    tagNames: string[]
  ): Promise<Book> {
    const author = await this.em.findOneOrFail(Author, authorId);

    // Crear o reutilizar tags
    const tags = await Promise.all(
      tagNames.map(name =>
        this.em.upsert(BookTag, { name }, {
          onConflictFields: ['name'],
          onConflictAction: 'merge',
        })
      )
    );

    const book = this.em.create(Book, { title, author });
    book.tags.set(tags);

    // Un solo flush para todo
    await this.em.flush();
    return book;
  }
}
```

### Transacciones

```typescript
// Transacción explícita
await em.transactional(async (em) => {
  const author = em.create(Author, { name: 'Jon', email: 'jon@example.com' });
  const book = em.create(Book, { title: 'Book 1', author });
  // Si algo falla, se hace rollback automáticamente
});

// O manualmente
const connection = em.getConnection();
await connection.beginTransaction();
try {
  // operaciones...
  await em.flush();
  await connection.commit();
} catch (e) {
  await connection.rollback();
  throw e;
}
```

---

## Resumen de la API `p.*` (defineEntity properties)

| Método | Tipo SQL |
|--------|----------|
| `p.integer()` | INT |
| `p.bigint()` | BIGINT |
| `p.float()` | FLOAT |
| `p.decimal()` | DECIMAL |
| `p.string()` | VARCHAR(255) |
| `p.text()` | TEXT |
| `p.boolean()` | BOOLEAN |
| `p.datetime()` | TIMESTAMP |
| `p.date()` | DATE |
| `p.time()` | TIME |
| `p.uuid()` | UUID |
| `p.json()` | JSON/JSONB |
| `p.array()` | Array |
| `p.enum(...)` | ENUM / VARCHAR + CHECK |
| `p.manyToOne(Entity)` | FK column |
| `p.oneToMany(Entity)` | Virtual (no column) |
| `p.manyToMany(Entity)` | Pivot table |
| `p.oneToOne(Entity)` | FK column |

### Modificadores encadenables

| Modificador | Efecto |
|-------------|--------|
| `.primary()` | Clave primaria |
| `.nullable()` | Permite NULL |
| `.unique()` | Restricción UNIQUE |
| `.index(name?)` | Índice |
| `.default(val)` | Default en DB |
| `.defaultRaw(sql)` | Default con SQL raw |
| `.onCreate(fn)` | Valor al crear |
| `.onUpdate(fn)` | Valor al actualizar |
| `.lazy()` | No incluir en SELECT |
| `.hidden()` | No incluir en JSON |
| `.length(n)` | Longitud de varchar |
| `.ref()` | Envuelve en Ref<T> |
| `.mappedBy(...)` | Inverse side de relación |
| `.fixedOrder()` | Orden estable en M:N |

---

> **Recursos adicionales**
> - Documentación oficial: https://mikro-orm.io/docs
> - Repositorio GitHub: https://github.com/mikro-orm/mikro-orm
> - Discord: https://discord.gg/w8bjxFHS7X
> - Ejemplos: https://mikro-orm.io/docs/examples
