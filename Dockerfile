# 1. Stage de construcción
FROM node:22-alpine AS builder
WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./
RUN npm ci

# Copiamos TODO el código y construimos
COPY . .
RUN npm run build

# 2. Stage de producción
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copiamos las dependencias y el build desde el stage anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Railway asigna el puerto automáticamente
EXPOSE 8080

# Comando de ejecución
CMD ["node", "dist/main.js"]