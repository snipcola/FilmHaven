ARG BUN_VERSION=1.3.5-alpine
ARG NGINX_VERSION=1.29.4-alpine

FROM oven/bun:$BUN_VERSION AS build
WORKDIR /usr/src/build
COPY package.json bun.lock ./
RUN bun ci --production
COPY . .
RUN bun run build

FROM nginx:$NGINX_VERSION
COPY --from=build /usr/src/build/out/index.html /usr/share/nginx/html/index.html
RUN sed -i '/^\s*access_log\s\+/c\    access_log off;' /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
