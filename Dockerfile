FROM node:23.3.0-alpine AS build
RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app
WORKDIR /usr/src/app
COPY package.json src LICENSE .
RUN npm install -g pnpm && pnpm install
USER node
COPY --chown=node:node . .
RUN pnpm build

FROM nginx:1.27.3-alpine
COPY --from=build /usr/src/app/dist/index.html /usr/share/nginx/html/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]