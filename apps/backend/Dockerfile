FROM node:22-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY apps/backend/package.json apps/backend/pnpm-lock.yaml ./
RUN pnpm install

COPY apps/backend/ .

RUN npx prisma generate
RUN pnpm run build

EXPOSE 3001

CMD ["node", "dist/src/main.js"]
