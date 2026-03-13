FROM docker.io/oven/bun:1 AS pruner
WORKDIR /app

RUN bun install -g turbo

COPY . .

RUN turbo prune --scope=@theapp/server --docker

FROM oven/bun:1 AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock

RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

RUN bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--target bun \
	--outfile server \
	apps/server/src/index.ts

FROM gcr.io/distroless/base
WORKDIR /app

COPY --from=builder /app/server server
COPY --from=builder /app/apps/server/drizzle ./migrations

ENV NODE_ENV=production

EXPOSE 3000

CMD ["./server"]
