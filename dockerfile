ARG NODE_VERSION=24.1.0-alpine
ARG NGINX_VERSION=1.28.0-alpine

FROM node:$NODE_VERSION AS build
USER node
WORKDIR /usr/src/build
COPY --chown=node:node . .
RUN npm install --production && npm run build

FROM nginx:$NGINX_VERSION
COPY --from=build /usr/src/build/out/index.html /usr/share/nginx/html/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]