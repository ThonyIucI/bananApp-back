export interface ITaskTypeResource {
  id: string;
  key: string;
  label: string;
  isActive: boolean;
  detailSchemas: TaskTypeDetailSchemaDto[];
}

/** Maps a TaskType entity to its response DTO. */
export const mapTaskType = (tt: TaskType): TaskTypeDto => {
  if (!tt)
    return {
      id: '',
      key: '' as string,
      label: '',
      isActive: false,
      detailSchemas: [],
    };

  return {
    id: tt.id,
    key: tt.key,
    label: tt.label,
    isActive: tt.isActive,
    detailSchemas: tt.detailSchemas?.isInitialized()
      ? [...tt.detailSchemas.getItems()]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(mapDetailSchema)
      : [],
  };
};
