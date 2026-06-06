import { Collection } from '@mikro-orm/core';
import { IPaginatedData, IPaginationMeta } from './pagination.interface';

/**
 * Serializador de salida base, al estilo de los API Resources de Laravel.
 *
 * Las subclases solo implementan `toShape()` (entidad → forma JSON) y heredan los
 * helpers `toItem` / `toList` / `toNullable` / `whenLoaded` / `toPaginated`.
 *
 * Cada resource concreto se exporta como **singleton** (instancia en camelCase), no
 * como clase: se importa y se usa, nunca se redefine ni se vuelve a instanciar.
 *
 * Notas de diseño:
 * - Los métodos son arrow-bound para poder pasarse como callbacks sin perder `this`
 *   (ej. `entities.map(fieldTaskResource.toItem)`).
 * - `context` es un genérico (`TContext`, default `undefined`) en vez de `any`, para
 *   inyectar datos extra a `toShape` cuando un caso lo necesite, manteniendo el tipado.
 */
export abstract class ApiResource<
  TEntity extends object,
  TShape,
  TContext = undefined,
> {
  protected abstract toShape(entity: TEntity, context?: TContext): TShape;

  /** Serializa una entidad individual. */
  toItem = (entity: TEntity, context?: TContext): TShape =>
    this.toShape(entity, context);

  /** Serializa un array de entidades. */
  toList = (entities: TEntity[], context?: TContext): TShape[] =>
    entities.map((entity) => this.toShape(entity, context));

  /** Serializa una relación que puede no existir (devuelve `null` si es ausente). */
  toNullable = (
    entity: TEntity | null | undefined,
    context?: TContext,
  ): TShape | null => (entity ? this.toShape(entity, context) : null);

  /**
   * Serializa una relación to-many SOLO si está inicializada; si no, `[]`.
   * Reemplaza los ternarios `rel?.isInitialized() ? [...].map(...) : []`.
   * El `prepare` opcional transforma los items crudos antes de serializar (ej. ordenar).
   */
  whenLoaded = (
    relation: Collection<TEntity>,
    prepare?: (items: TEntity[]) => TEntity[],
  ): TShape[] => {
    if (!relation.isInitialized()) return [];
    const items = relation.getItems();
    return this.toList(prepare ? prepare(items) : items);
  };

  /**
   * Arma una respuesta paginada. Recibe 2 parámetros separados (regla ≤2 → separados):
   * la lista de entidades y el `meta` ya construido.
   */
  toPaginated = (
    entities: TEntity[],
    meta: IPaginationMeta,
  ): IPaginatedData<TShape> => ({
    data: this.toList(entities),
    meta,
  });
}
