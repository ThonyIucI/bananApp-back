# Catálogo Maestro de la API de Gemini (Mayo 2026)

> **Precios**: en USD. Para modelos de texto/multimodales el costo es por **1 millón (1M) de tokens** de Entrada / Salida. Los modelos "Preview" suelen ser gratuitos bajo límites de rate (RPM) en Google AI Studio hasta pasar a GA (General Availability). Imagen y video se cobran **por unidad generada**.

## ⚠️ Deprecaciones a vigilar

- Toda la serie **`gemini-2.0-*`** tiene shutdown programado para **junio 2026**. No usar en producción.
- Producción debería apuntar a la rama **`3.5-flash`** / **`3.1-flash-lite`** (o el `-live`/`-tts` equivalente vigente).
- La serie `2.5-*` tiene soporte hasta **octubre 2026**.

## ✅ Modelos en uso en el proyecto (env)

| Variable de entorno | Modelo | Uso |
|---|---|---|
| `GEMINY_LLM_MODEL` | `gemini-2.5-flash` | Chat de texto + function calling (`chat`, `chatWithTools`, `classifyQuery`) |
| `GEMINY_LIVE_MODEL` | `gemini-3.1-flash-live-preview` | Sesión de voz en tiempo real (Live API, `createLiveSession`) — **gratuito** (preview), A2A audio-to-audio |
| `GEMINY_TTS_MODEL` | `gemini-2.5-flash-preview-tts` | Síntesis de voz (TTS) para planes Pro/ProMax |

> La Live API **exige** un modelo de la familia `*-live-*`; no acepta `gemini-2.5-flash` "pelado". Se usa `gemini-3.1-flash-live-preview` por ser **gratuito** (límites preview) y ultrarrápido (audio-to-audio), ideal para un proyecto aún no monetizado. Si en el futuro se requiere SLA de pago/estabilidad GA, el equivalente de paga es `gemini-2.5-flash-live-preview` ($0.75/$4.50 por 1M).

---

## Generativos / Multimodales

| Alias de API | Descripción | Precio (Entrada / Salida) |
|---|---|---|
| `gemini-3.1-pro` | Modelo flagship (estable). Máxima inteligencia, resolución compleja, agentes y código. | $2.00 / $12.00 por 1M |
| `gemini-3.1-pro-preview` | Versión previa de la rama 3.1 Pro con las últimas optimizaciones experimentales. | Gratuito (Límites Preview) |
| `gemini-3.1-pro-preview-customtools` | Endpoint de 3.1 Pro optimizado para orquestar herramientas custom (mix bash/tools). | Gratuito (Límites Preview) |
| `gemini-3.5-flash` | Modelo más inteligente y equilibrado para tareas sostenidas y agentes (estándar mayo 2026). | $1.50 / $9.00 por 1M |
| `gemini-3-flash-preview` | Preview de la rama 3 Flash. Rendimiento de clase frontera a fracción del costo. | Gratuito (Límites Preview) |
| `gemini-3.1-flash-lite` | Reemplazo directo del 2.5-lite. Máxima velocidad y escala para tareas rápidas. | $0.25 / $1.50 por 1M |
| `gemini-2.5-pro` | Modelo estable maduro de la generación anterior. | $1.25 / $10.00 por 1M |
| `gemini-2.5-flash` | Precio/rendimiento estable de la generación anterior (soporte hasta oct 2026). | $0.30 / $2.50 por 1M |
| `gemini-2.5-flash-lite` | Versión ultra-rápida de 2.5 (soporte hasta oct 2026, reemplazado por 3.1-flash-lite). | $0.07 / $0.30 por 1M |
| `gemini-2.0-flash` / `gemini-2.0-flash-001` | Serie 2.0 original (rama lite deprecada, el principal cierra en junio 2026). | $0.15 / $0.60 por 1M |
| `gemini-2.0-flash-lite` / `gemini-2.0-flash-lite-001` | Modelo lite original de la serie 2.0 (cierra en junio 2026). | $0.07 / $0.30 por 1M |

## Visión / Generación de imágenes

| Alias de API | Descripción | Precio |
|---|---|---|
| `gemini-3.1-flash-image` | Nano Banana 2. Creación/edición de imágenes de alta eficiencia y volumen. | $0.03 por imagen |
| `gemini-3-pro-image` | Nano Banana Pro. Motor de diseño profesional (4K, layouts, render preciso de texto). | $0.04 por imagen |
| `gemini-2.5-flash-image` | Nano Banana. Versión anterior de generación y edición (soporte hasta oct 2026). | $0.02 por imagen |

## Audio / Conversacional (Live API)

| Alias de API | Estado | Descripción | Precio |
|---|---|---|---|
| `gemini-3.1-flash-live-preview` | ✅ **EN USO** (`GEMINY_LIVE_MODEL`) | (Live API) Modelo A2A (Audio-to-Audio) ultrarrápido para diálogo en tiempo real. | **Gratuito** (Límites Preview) |
| `gemini-2.5-flash-live-preview` | 💲 Alternativa de paga (solo si se requiere GA/SLA) | (Live API) Agentes de voz y video bidireccionales de baja latencia. | $0.75 / $4.50 por 1M |
| `gemini-2.0-flash-live-001` | ⛔ Deprecado (cierra finales de 2026) | (Live API) Primera versión de audio nativo. | $0.75 / $4.50 por 1M |

## Audio / Text-to-Speech (TTS)

| Alias de API | Descripción | Precio |
|---|---|---|
| `gemini-3.1-flash-tts-preview` | Generación de voz de baja latencia con tags expresivos para control narrativo preciso. | Gratuito (Límites Preview) |
| `gemini-2.5-flash-preview-tts` | Motor TTS rápido y controlable para asistentes diarios. | $0.30 por 1M caracteres |
| `gemini-2.5-pro-preview-tts` | TTS de alta fidelidad para audiolibros, podcasts y workflows largos. | $2.00 por 1M caracteres |

## Embeddings

| Alias de API | Descripción | Precio |
|---|---|---|
| `gemini-embedding-2` / `gemini-embedding-2-preview` | Proyecta texto, imágenes, video, audio y PDF en un espacio unificado (RAG avanzado). | $0.02 por 1M tokens |
| `gemini-embedding-001` | Modelo de embeddings heredado (solo texto). | $0.01 por 1M tokens |
| `text-embedding-005` | Representación vectorial de texto estándar de alta precisión. | $0.02 por 1M tokens |

## Video / Generación

| Alias de API | Descripción | Precio |
|---|---|---|
| `veo-3.1-generate-preview` | Generación cinemática de estado del arte con controles creativos y audio sincronizado. | Gratuito (Límites Preview) |
| `veo-3.1-lite-generate-preview` | Edición y generación de video orientada a desarrolladores (menor costo, alta iteración). | Gratuito (Límites Preview) |
| `veo-3.1-fast-generate-preview` | Modelo enfocado 100% a la velocidad de entrega en creación de video. | Gratuito (Límites Preview) |

## Agentes / Investigación

| Alias de API | Descripción | Precio |
|---|---|---|
| `deep-research-preview-04-2026` | Planifica y ejecuta investigaciones web multi-paso de forma autónoma. | Gratuito (Límites Preview) |
| `deep-research-max-preview-04-2026` | Versión "Max" de Deep Research, síntesis exhaustiva entre cientos de fuentes. | Gratuito (Límites Preview) |

## Robótica / Espacial

| Alias de API | Descripción | Precio |
|---|---|---|
| `gemini-robotics-er-1.6-preview` | Entiende espacios físicos, lee instrumentos y planifica tareas multi-paso para robots. | Gratuito (Límites Preview) |

## Weights abiertos (Gemma)

| Alias de API | Descripción | Precio |
|---|---|---|
| `gemma-4-26b-a4b-it` | Integración en API del modelo Gemma 4 (26B de parámetros). | Free Tier / Costo cómputo |
| `gemma-4-31b-it` | Integración en API del modelo Gemma 4 (31B de parámetros). | Free Tier / Costo cómputo |

---

## Consejos de implementación

- **Deprecación**: cuidado con cualquier variante `gemini-2.0-*` (shutdown junio 2026). Apuntar producción a `3.5-flash` o `3.1-flash-lite`.
- **TTS en PWA**: los modelos `-tts` reciben el texto en el body y devuelven el buffer de audio (LINEAR16, MP3 u OGG_OPUS). Para latencias casi imperceptibles, procesar el stream por chunks en el frontend en lugar de esperar la respuesta completa.
