export enum EGaiaQueryCategory {
  FERTILIZERS = 'FERTILIZERS',
  FOLIAR = 'FOLIAR',
  SOIL = 'SOIL',
  PESTS = 'PESTS',
  IRRIGATION = 'IRRIGATION',
  HARVEST = 'HARVEST',
  CROP_MANAGEMENT = 'CROP_MANAGEMENT',
  TASK_RECORD = 'TASK_RECORD',
  GENERAL = 'GENERAL',
}

export const gaiaQueryCategoryLabels: Record<EGaiaQueryCategory, string> = {
  [EGaiaQueryCategory.FERTILIZERS]: 'Fertilizantes',
  [EGaiaQueryCategory.FOLIAR]: 'Foliares',
  [EGaiaQueryCategory.SOIL]: 'Suelo',
  [EGaiaQueryCategory.PESTS]: 'Plagas y enfermedades',
  [EGaiaQueryCategory.IRRIGATION]: 'Riego',
  [EGaiaQueryCategory.HARVEST]: 'Cosecha',
  [EGaiaQueryCategory.CROP_MANAGEMENT]: 'Manejo del cultivo',
  [EGaiaQueryCategory.TASK_RECORD]: 'Registro de tareas',
  [EGaiaQueryCategory.GENERAL]: 'General',
};
