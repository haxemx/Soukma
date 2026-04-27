FROM node:20-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./

COPY lib ./lib
COPY artifacts/api-server ./artifacts/api-server

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @workspace/api-server build

EXPOSE 3000

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
