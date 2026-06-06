/** Metadatos de una respuesta paginada. */
export interface IPaginationMeta {
  total: number;
  limit: number;
  offset: number;
}

/** Envoltura estándar de una colección paginada que devuelve la API. */
export interface IPaginatedData<TShape> {
  data: TShape[];
  meta: IPaginationMeta;
}
