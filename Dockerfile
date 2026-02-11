# Node 20 LTS
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build || (echo "Build failed!" && exit 1)
RUN ls -la dist/ || (echo "dist directory not found!" && exit 1)
RUN test -f dist/main.js || (echo "ERROR: dist/main.js not found after build" && ls -la dist/ && exit 1)

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
RUN ls -la dist/ && echo "Files in dist directory:" && find dist -name "main*" -type f
USER nestjs
EXPOSE 5050
CMD ["node", "dist/main.js"]
