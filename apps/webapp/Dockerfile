FROM docker.io/oven/bun:1 AS pruner
WORKDIR /app

RUN bun install -g turbo

COPY . .

RUN turbo prune --scope=@theapp/webapp --docker

FROM docker.io/oven/bun:1 AS builder
WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock

RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

WORKDIR /app/apps/webapp
RUN bun run build

FROM docker.io/nginx:alpine

RUN printf "server { \n\
    listen 80; \n\
    root /usr/share/nginx/html; \n\
    index index.html; \n\
    location / { \n\
        try_files \$uri \$uri/ /index.html;\n\
    } \n\
}" > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/apps/webapp/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
