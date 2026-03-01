FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json package.json
COPY bun.lock bun.lock

COPY /apps/server/package.json ./apps/server/package.json
COPY /packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY /packages/schemas/package.json ./packages/schemas/package.json

RUN bun install

COPY /apps/server ./apps/server
COPY /packages/typescript-config ./packages/typescript-config
COPY /packages/schemas ./packages/schemas

RUN bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--outfile server \
	apps/server/src/index.ts

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=build /app/server server

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 8080
