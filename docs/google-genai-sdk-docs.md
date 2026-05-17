# @google/genai — Documentación de Uso (SDK JS/TS)

> **Versión más reciente:** v2.3.0 (mayo 2026)  
> **Fuente:** [googleapis/js-genai](https://github.com/googleapis/js-genai) · [Docs oficiales](https://googleapis.github.io/js-genai/release_docs/)  
> **Paquete npm:** `@google/genai`

---

## Tabla de contenidos

1. [Qué es este SDK](#qué-es-este-sdk)
2. [Instalación y prerequisitos](#instalación-y-prerequisitos)
3. [Inicialización](#inicialización)
4. [Módulos principales](#módulos-principales)
5. [generateContent — Texto básico](#generatecontent--texto-básico)
6. [Streaming](#streaming)
7. [Chat (conversaciones multi-turno)](#chat-conversaciones-multi-turno)
8. [Function Calling](#function-calling)
9. [MCP (Model Context Protocol)](#mcp-model-context-protocol-experimental)
10. [Archivos (ai.files)](#archivos-aifiles)
11. [Caché de contexto (ai.caches)](#caché-de-contexto-aicaches)
12. [Live — Tiempo real](#live--tiempo-real-aiLive)
13. [Interactions API (Beta)](#interactions-api-beta)
14. [Manejo de errores](#manejo-de-errores)
15. [Estructura de `contents`](#estructura-de-contents)
16. [Variables de entorno](#variables-de-entorno)
17. [Selección de versión de API](#selección-de-versión-de-api)
18. [Diferencias con otros SDKs de Google](#diferencias-con-otros-sdks-de-google)

---

## Qué es este SDK

`@google/genai` es el SDK oficial de Google DeepMind para TypeScript y JavaScript. Permite usar modelos Gemini 2.0+ a través de:

- **Gemini Developer API** — vía API key desde [Google AI Studio](https://aistudio.google.com/apikey)
- **Gemini Enterprise Agent Platform** — vía Google Cloud / Vertex AI

> **⚠️ Importante:** Los SDKs anteriores (`@google/generative_language`, `@google-cloud/vertexai`) ya no reciben features de Gemini 2.0+. Usar este.

---

## Instalación y prerequisitos

```bash
npm install @google/genai
```

**Requisitos:**
- Node.js **>= 20**

**Para Vertex AI / Enterprise Agent Platform:**
```bash
# 1. Seleccionar o crear proyecto en Google Cloud
# 2. Habilitar facturación
# 3. Habilitar Vertex AI API
# 4. Autenticarse con gcloud
gcloud auth application-default login
```

---

## Inicialización

### Gemini Developer API (API Key)

```typescript
import { GoogleGenAI } from '@google/genai';

// Desde variable de entorno (recomendado)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// O directamente (no recomendado en producción)
const ai = new GoogleGenAI({ apiKey: 'TU_API_KEY' });
```

> **🔒 Seguridad:** Nunca expongas el API key en código del lado cliente. Usa implementaciones server-side en producción.

### Gemini Enterprise Agent Platform (Vertex AI)

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  enterprise: true,
  project: 'mi-proyecto-gcp',
  location: 'us-central1',
});
```

### Sin parámetros (via env vars en Node.js)

```typescript
import { GoogleGenAI } from '@google/genai';

// Lee automáticamente GOOGLE_API_KEY o las vars de Vertex
const ai = new GoogleGenAI();
```

---

## Módulos principales

Todos los features se acceden a través del objeto `ai`:

| Módulo | Descripción |
|--------|-------------|
| `ai.models` | Generar contenido, imágenes, embeddings, listar modelos |
| `ai.chats` | Conversaciones multi-turno con estado local |
| `ai.files` | Subir archivos para referenciar en prompts |
| `ai.caches` | Cachear prefijos de prompt para reducir costos |
| `ai.live` | Sesiones en tiempo real (audio/video/texto) |
| `ai.interactions` | API unificada para agentes (Beta) |

---

## generateContent — Texto básico

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: '¿Por qué el cielo es azul?',
  });

  console.log(response.text);
}

main();
```

### Con configuración avanzada

```typescript
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'Escribe un poema corto.',
  config: {
    temperature: 0.7,
    maxOutputTokens: 256,
    topP: 0.9,
    stopSequences: ['FIN'],
    systemInstruction: 'Eres un poeta español del siglo XVII.',
  },
});
```

### Con contenido multimodal (imagen + texto)

```typescript
import * as fs from 'fs';

const imageData = fs.readFileSync('imagen.jpg');
const base64Image = imageData.toString('base64');

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: [
    {
      role: 'user',
      parts: [
        { text: 'Describe esta imagen:' },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
      ],
    },
  ],
});
```

---

## Streaming

Usa `generateContentStream` para respuestas más rápidas y fluidas:

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const response = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: 'Escribe un poema de 100 palabras.',
  });

  for await (const chunk of response) {
    process.stdout.write(chunk.text ?? '');
  }
  console.log(); // Nueva línea al final
}

main();
```

---

## Chat (conversaciones multi-turno)

`ai.chats` crea un objeto de chat con estado local que mantiene el historial automáticamente:

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'Eres un asistente útil y conciso.',
    },
  });

  // Primer mensaje
  const response1 = await chat.sendMessage({
    message: 'Hola, me llamo Carlos.',
  });
  console.log(response1.text);

  // El historial se mantiene automáticamente
  const response2 = await chat.sendMessage({
    message: '¿Cómo me llamo?',
  });
  console.log(response2.text); // "Te llamas Carlos."
}

main();
```

### Chat con streaming

```typescript
const chat = ai.chats.create({ model: 'gemini-2.5-flash' });

const stream = await chat.sendMessageStream({
  message: 'Explícame qué es la fotosíntesis paso a paso.',
});

for await (const chunk of stream) {
  process.stdout.write(chunk.text ?? '');
}
```

### Inicializar con historial previo

```typescript
const chat = ai.chats.create({
  model: 'gemini-2.5-flash',
  history: [
    { role: 'user', parts: [{ text: 'Hola' }] },
    { role: 'model', parts: [{ text: '¡Hola! ¿En qué puedo ayudarte?' }] },
  ],
});
```

---

## Function Calling

Permite al modelo interactuar con sistemas externos. Flujo de 4 pasos:

1. Declarar la función
2. Llamar `generateContent` con las tools
3. Ejecutar la función real con los parámetros del modelo
4. Enviar el resultado de vuelta

```typescript
import {
  GoogleGenAI,
  FunctionCallingConfigMode,
  FunctionDeclaration,
} from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 1. Declarar la función
const controlLuzDeclaration: FunctionDeclaration = {
  name: 'controlLuz',
  description: 'Controla el brillo y temperatura de color de las luces.',
  parametersJsonSchema: {
    type: 'object',
    properties: {
      brillo: {
        type: 'number',
        description: 'Nivel de brillo entre 0 y 100',
      },
      temperaturaColor: {
        type: 'string',
        enum: ['calida', 'neutra', 'fria'],
        description: 'Temperatura de color de la luz',
      },
    },
    required: ['brillo', 'temperaturaColor'],
  },
};

async function main() {
  // 2. Llamar al modelo con la tool
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Pon las luces tenues y cálidas para ver una película.',
    config: {
      tools: [{ functionDeclarations: [controlLuzDeclaration] }],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY,
          allowedFunctionNames: ['controlLuz'],
        },
      },
    },
  });

  // 3. Obtener los parámetros que el modelo quiere usar
  const functionCalls = response.functionCalls;
  console.log(functionCalls);
  // [{ name: 'controlLuz', args: { brillo: 20, temperaturaColor: 'calida' } }]

  // 4. Ejecutar la función real y enviar resultado (usando chat para historial)
  // Ver ejemplo con chat a continuación...
}

main();
```

### Function Calling con chat (flujo completo)

```typescript
const chat = ai.chats.create({
  model: 'gemini-2.5-flash',
  config: {
    tools: [{ functionDeclarations: [controlLuzDeclaration] }],
  },
});

let response = await chat.sendMessage({
  message: 'Pon las luces para ver una película.',
});

// Procesar function calls
while (response.functionCalls && response.functionCalls.length > 0) {
  const functionResponses = response.functionCalls.map((call) => {
    // Aquí ejecutarías tu función real
    const resultado = ejecutarFuncion(call.name, call.args);

    return {
      name: call.name,
      response: { output: resultado },
    };
  });

  // Enviar resultados de vuelta al modelo
  response = await chat.sendMessage({
    message: functionResponses.map((fr) => ({
      functionResponse: fr,
    })),
  });
}

console.log(response.text);
```

---

## MCP (Model Context Protocol) — experimental

Permite conectar servidores MCP directamente como tools:

```typescript
import { GoogleGenAI, mcpToTool } from '@google/genai';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Configurar servidor MCP (aquí un servidor de clima como ejemplo)
const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', '@philschmid/weather-mcp'],
});

const client = new Client({ name: 'mi-cliente', version: '1.0.0' });
await client.connect(transport);

// Usar el servidor MCP como tool
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: `¿Qué tiempo hace en Madrid hoy, ${new Date().toLocaleDateString()}?`,
  config: {
    tools: [mcpToTool(client)], // El SDK llama las tools automáticamente
  },
});

console.log(response.text);
await client.close();
```

> **Nota:** Requiere `npm install @modelcontextprotocol/sdk`

---

## Archivos (ai.files)

Sube archivos grandes una vez y referencialos en múltiples prompts:

```typescript
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  // Subir archivo
  const archivo = await ai.files.upload({
    file: {
      displayName: 'Mi documento',
      mimeType: 'application/pdf',
      data: fs.readFileSync('documento.pdf'),
    },
  });

  console.log(`Archivo subido: ${archivo.uri}`);

  // Referenciar en un prompt
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: 'Resume el contenido de este documento:' },
          {
            fileData: {
              mimeType: archivo.mimeType,
              fileUri: archivo.uri,
            },
          },
        ],
      },
    ],
  });

  console.log(response.text);
}

main();
```

### Listar y eliminar archivos

```typescript
// Listar archivos subidos
const archivos = await ai.files.list();
for (const archivo of archivos.files ?? []) {
  console.log(archivo.name, archivo.displayName);
}

// Eliminar un archivo
await ai.files.delete(archivo.name);
```

---

## Caché de contexto (ai.caches)

Reduce costos cuando usas el mismo prefijo de prompt repetidamente (textos largos, documentos grandes):

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  // Crear caché con el contenido que se repite
  const cache = await ai.caches.create({
    model: 'gemini-2.5-flash',
    config: {
      contents: [
        {
          role: 'user',
          parts: [{ text: 'DOCUMENTO LARGO: ...' }],
        },
      ],
      systemInstruction: 'Eres un experto en este documento.',
      ttl: '3600s', // Cache por 1 hora
    },
  });

  // Usar el caché en múltiples llamadas
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: '¿Qué dice el documento sobre X?',
    config: {
      cachedContent: cache.name,
    },
  });

  console.log(response.text);

  // Limpiar el caché cuando ya no se necesita
  await ai.caches.delete(cache.name);
}

main();
```

---

## Live — Tiempo real (ai.live)

Para interacciones en tiempo real con audio/video/texto:

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const session = await ai.live.connect({
    model: 'gemini-2.0-flash-live-001',
    callbacks: {
      onopen: () => console.log('Sesión abierta'),
      onmessage: (message) => {
        // Procesar chunks de respuesta en tiempo real
        if (message.serverContent?.modelTurn) {
          for (const part of message.serverContent.modelTurn.parts ?? []) {
            if (part.text) process.stdout.write(part.text);
          }
        }
      },
      onclose: () => console.log('Sesión cerrada'),
      onerror: (error) => console.error('Error:', error),
    },
    config: {
      responseModalities: ['TEXT'],
    },
  });

  // Enviar texto
  session.sendClientContent({
    turns: [{ role: 'user', parts: [{ text: 'Hola, ¿cómo estás?' }] }],
    turnComplete: true,
  });

  // Cuando termines
  // session.close();
}

main();
```

---

## Interactions API (Beta)

API unificada y simplificada para agentes. Gestiona estado, orquestación de tools y tareas largas.

> **⚠️ Beta:** Sujeta a cambios. No usar en producción sin considerar breaking changes.

### Interacción básica

```typescript
const interaction = await ai.interactions.create({
  model: 'gemini-2.5-flash',
  input: 'Hola, ¿cómo estás?',
});

console.log(interaction.outputs);
```

### Conversación con estado (server-side)

```typescript
// Turno 1
const turno1 = await ai.interactions.create({
  model: 'gemini-2.5-flash',
  input: 'Me llamo Carlos.',
});

// Turno 2 — referencia el turno anterior
const turno2 = await ai.interactions.create({
  model: 'gemini-2.5-flash',
  input: '¿Cómo me llamo?',
  previous_interaction_id: turno1.id,
});

console.log(turno2.outputs); // Respuesta: "Te llamas Carlos."
```

### Agente Deep Research

```typescript
// Iniciar investigación en background
const investigacion = await ai.interactions.create({
  input: 'Investiga los avances en computación cuántica en 2025-2026.',
  agent: 'deep-research-pro-preview-12-2025',
  background: true,
});

// Hacer polling hasta que termine
while (true) {
  const estado = await ai.interactions.get(investigacion.id);
  console.log(`Estado: ${estado.status}`);

  if (estado.status === 'completed') {
    console.log('Reporte final:', estado.outputs);
    break;
  } else if (['failed', 'cancelled'].includes(estado.status)) {
    console.error('Falló:', estado.status);
    break;
  }

  await new Promise((r) => setTimeout(r, 10000)); // Esperar 10s
}
```

### Búsqueda con Google (built-in tool)

```typescript
const interaction = await ai.interactions.create({
  model: 'gemini-2.5-flash',
  input: '¿Quién ganó el último Mundial de fútbol?',
  tools: [{ type: 'google_search' }],
});
```

### Ejecución de código (built-in tool)

```typescript
const interaction = await ai.interactions.create({
  model: 'gemini-2.5-flash',
  input: 'Calcula el número de Fibonacci número 50.',
  tools: [{ type: 'code_execution' }],
});
```

---

## Manejo de errores

El SDK expone la clase `ApiError`:

```typescript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hola',
    });
    console.log(response.text);
  } catch (e: any) {
    console.error('Nombre del error:', e.name);
    console.error('Mensaje:', e.message);
    console.error('Status HTTP:', e.status);
    console.error('Detalles:', e.details);
  }
}

main();
```

### Errores comunes

| Status | Causa |
|--------|-------|
| `400` | Request malformado, modelo inválido |
| `401` | API Key inválida o faltante |
| `403` | Sin permisos para el recurso |
| `429` | Rate limit excedido |
| `500` | Error interno del servidor |

---

## Estructura de `contents`

El parámetro `contents` acepta diferentes formatos:

```typescript
// String simple → se convierte en Content con role 'user'
contents: '¿Por qué el cielo es azul?'

// Part simple → se envuelve en Content con role 'user'
contents: { text: 'Hola' }

// Array de strings/parts → se agregan en un solo Content con role 'user'
contents: ['Parte 1', 'Parte 2']

// Content completo → se usa tal cual
contents: {
  role: 'user',
  parts: [{ text: 'Hola' }]
}

// Array de Content → conversación completa
contents: [
  { role: 'user', parts: [{ text: 'Hola' }] },
  { role: 'model', parts: [{ text: '¡Hola!' }] },
  { role: 'user', parts: [{ text: '¿Cómo estás?' }] },
]
```

> **⚠️ Nota:** Para `FunctionCall` y `FunctionResponse` parts, debes proveer la estructura `Content[]` completa. El SDK lanzará una excepción si intentas pasarlos como parte simple.

---

## Variables de entorno

### Gemini Developer API

```bash
export GOOGLE_API_KEY='tu-api-key'
```

### Gemini Enterprise Agent Platform

```bash
export GOOGLE_GENAI_USE_ENTERPRISE=true
export GOOGLE_CLOUD_PROJECT='tu-proyecto-id'
export GOOGLE_CLOUD_LOCATION='us-central1'
```

---

## Selección de versión de API

Por defecto el SDK usa endpoints **beta** (para features de preview). Para estabilidad:

```typescript
// API estable (v1) para Vertex AI
const ai = new GoogleGenAI({
  enterprise: true,
  project: 'mi-proyecto',
  location: 'us-central1',
  apiVersion: 'v1',
});

// API alpha para Gemini Developer
const ai = new GoogleGenAI({
  apiKey: 'GEMINI_API_KEY',
  apiVersion: 'v1alpha',
});
```

---

## Diferencias con otros SDKs de Google

| SDK | Estado | Usar para |
|-----|--------|-----------|
| `@google/genai` ✅ | Activo | Todo — Gemini 2.0+, features nuevas |
| `@google/generative_language` ❌ | Legacy | No usar — sin soporte Gemini 2.0+ |
| `@google-cloud/vertexai` ❌ | Legacy | No usar — sin soporte Gemini 2.0+ |
| `@google/generative-ai` ⚠️ | Deprecado | Migrar a `@google/genai` |

---

## Instrucciones para generación de código (para Claude Code)

> El repo incluye un archivo especial en  
> `https://raw.githubusercontent.com/googleapis/js-genai/refs/heads/main/codegen_instructions.md`  
> que puedes descargar y usar como contexto adicional para que los modelos generen código actualizado:

```bash
curl -o codegen_instructions.md \
  https://raw.githubusercontent.com/googleapis/js-genai/refs/heads/main/codegen_instructions.md
```

Luego agrega ese archivo a tu contexto de Claude Code con:

```bash
# En tu proyecto
claude --context codegen_instructions.md
```

---

## Modelos recomendados (Mayo 2026)

| Modelo | Uso recomendado |
|--------|----------------|
| `gemini-2.5-flash` | Uso general — rápido y económico |
| `gemini-2.5-pro` | Tareas complejas, razonamiento avanzado |
| `gemini-2.0-flash-live-001` | Sesiones Live (tiempo real) |
| `deep-research-pro-preview-12-2025` | Agente de investigación profunda |

---

## Links útiles

- **Repo:** https://github.com/googleapis/js-genai
- **Docs API:** https://googleapis.github.io/js-genai/release_docs/
- **npm:** https://www.npmjs.com/package/@google/genai
- **Google AI Studio (API Keys):** https://aistudio.google.com/apikey
- **Samples del repo:** https://github.com/googleapis/js-genai/tree/main/sdk-samples
- **Gemini Developer API docs:** https://ai.google.dev/gemini-api/docs
- **Vertex AI docs:** https://cloud.google.com/vertex-ai/generative-ai/docs
