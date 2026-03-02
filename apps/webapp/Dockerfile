FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json package.json
COPY bun.lock bun.lock

COPY /apps/webapp/package.json ./apps/webapp/package.json
COPY /apps/server/package.json ./apps/server/package.json
COPY /packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY /packages/schemas/package.json ./packages/schemas/package.json
COPY /packages/ui/package.json ./packages/ui/package.json

RUN bun install

COPY /apps/webapp ./apps/webapp
COPY /apps/server ./apps/server
COPY /packages/typescript-config ./packages/typescript-config
COPY /packages/schemas ./packages/schemas
COPY /packages/ui ./packages/ui

WORKDIR /app/apps/webapp

RUN bun run build

FROM nginx:alpine

RUN printf "server { \n\
    listen 80; \n\
    root /usr/share/nginx/html; \n\
    index index.html; \n\
    location / { \n\
        try_files \$uri \$uri/ /index.html;\n\
    } \n\
}" > /etc/nginx/conf.d/default.conf

COPY --from=build /app/apps/webapp/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
