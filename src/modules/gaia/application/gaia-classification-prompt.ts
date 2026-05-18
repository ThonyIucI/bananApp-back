import { EGaiaQueryCategory } from '../domain/gaia-query-category.enum';

const CATEGORY_DESCRIPTIONS: Record<EGaiaQueryCategory, string> = {
  [EGaiaQueryCategory.FERTILIZERS]:
    'fertilizantes (qué aplicar, cuándo, cómo preparar, tipos según suelo/pH, dosis)',
  [EGaiaQueryCategory.FOLIAR]:
    'aplicaciones foliares, micronutrientes vía foliar, productos foliares',
  [EGaiaQueryCategory.SOIL]:
    'tipo de suelo, pH, análisis de suelo, preparación, enmiendas',
  [EGaiaQueryCategory.PESTS]:
    'plagas, enfermedades, control fitosanitario, diagnóstico de síntomas',
  [EGaiaQueryCategory.IRRIGATION]:
    'riego, frecuencia, sistemas de riego, necesidades hídricas del cultivo',
  [EGaiaQueryCategory.HARVEST]:
    'cosecha, madurez, índices de cosecha, post-cosecha, almacenamiento',
  [EGaiaQueryCategory.CROP_MANAGEMENT]:
    'manejo general del cultivo, podas, densidad de siembra, ciclos, labores culturales',
  [EGaiaQueryCategory.TASK_RECORD]:
    'registrar tareas realizadas, consultar historial de actividades, seguimiento de labores',
  [EGaiaQueryCategory.GENERAL]:
    'cualquier otra consulta no clasificable en las categorías anteriores',
};

const categoryList = Object.entries(CATEGORY_DESCRIPTIONS)
  .map(([key, desc]) => `- ${key}: ${desc}`)
  .join('\n');

/** System prompt para clasificar consultas de GaIA en structured output JSON. */
export const GAIA_CLASSIFICATION_PROMPT = `Eres un clasificador de consultas agrícolas. \
Dado un mensaje de un agricultor, responde ÚNICAMENTE con un objeto JSON con esta estructura:

{
  "category": "<categoría>",
  "topic": "<tema específico en ≤120 caracteres>",
  "summary": "<resumen en una frase de ≤300 caracteres>"
}

Categorías disponibles:
${categoryList}

Instrucciones:
- Elige la categoría más específica que aplique.
- El topic debe ser descriptivo y preciso (ej: "selección de fertilizante nitrogenado para suelo ácido", no solo "fertilizantes").
- El summary es una frase que describe qué preguntó el agricultor.
- Si el mensaje no es una consulta agrícola clara, usa GENERAL.`;
