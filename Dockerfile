FROM node:22-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY apps/backend/package.json apps/backend/pnpm-lock.yaml ./
RUN pnpm install

COPY apps/backend/ .

RUN npx prisma generate
RUN pnpm run build

# Verificar donde quedo el build
RUN ls -la /app/dist/ || echo "NO DIST" && find /app -name "main.js" -type f

EXPOSE 3001

CMD ["node", "dist/main.js"]
