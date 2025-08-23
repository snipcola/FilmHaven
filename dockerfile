ARG NODE_VERSION=24.6.0-alpine
ARG NGINX_VERSION=1.29.1-alpine

FROM node:$NODE_VERSION AS build
USER node
WORKDIR /usr/src/build
COPY --chown=node:node . .
RUN npm install --production && npm run build

FROM nginx:$NGINX_VERSION
COPY --from=build /usr/src/build/out/index.html /usr/share/nginx/html/index.html
RUN sed -i '/^\s*access_log\s\+/c\    access_log off;' /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]