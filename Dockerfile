# ─── Stage: deps ────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Instalamos todas las dependencias para poder buildear
RUN npm ci

# ─── Stage: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Genera la carpeta dist
RUN npm run build 
# Limpia dependencias de desarrollo para que la imagen pese menos
RUN npm prune --omit=dev 

# ─── Stage: production ───────────────────────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app

# Crear usuario seguro
RUN addgroup -g 1001 -S app && adduser -S app -u 1001
USER app

COPY --from=build --chown=app:app /app/dist ./dist
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/package.json ./

ENV NODE_ENV=production

# ¡IMPORTANTE! No hardcodear el puerto 3000 aquí. 
# Railway inyecta la variable PORT.
ENV PORT=8080 
EXPOSE 8080

# Eliminamos el HEALTHCHECK del Dockerfile porque Railway tiene su propio 
# sistema de Healthcheck en el Dashboard y suele entrar en conflicto.

CMD ["node", "dist/main.js"]