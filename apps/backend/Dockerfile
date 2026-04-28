FROM node:22-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

RUN npx prisma generate
RUN pnpm run build

EXPOSE 3001

CMD ["node", "dist/main.js"]
