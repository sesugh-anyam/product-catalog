FROM node:20-alpine AS base

RUN npm install -g pnpm@8

WORKDIR /app

FROM base AS deps

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/frontend/node_modules ./packages/frontend/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY tsconfig.json* ./
COPY packages/frontend/src ./packages/frontend/src
COPY packages/frontend/index.html ./packages/frontend/
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/frontend/tsconfig.json ./packages/frontend/
COPY packages/frontend/tsconfig.node.json ./packages/frontend/
COPY packages/frontend/vite.config.ts ./packages/frontend/
COPY packages/shared/src ./packages/shared/src
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/

WORKDIR /app/packages/shared
RUN pnpm run build

WORKDIR /app/packages/frontend
RUN pnpm run build

FROM base AS runner

ENV NODE_ENV=production

WORKDIR /app/packages/frontend

COPY --from=builder /app/packages/frontend/dist ./dist
COPY --from=builder /app/packages/frontend/package.json ./package.json
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages/frontend/node_modules ./node_modules

EXPOSE 5173

CMD ["pnpm", "run", "preview", "--host", "0.0.0.0", "--port", "5173"]
