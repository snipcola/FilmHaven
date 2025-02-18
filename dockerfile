FROM node:23.8.0-alpine AS build
RUN mkdir -p /usr/src/app && chown -R node:node /usr/src/app
WORKDIR /usr/src/app
COPY package.json src build LICENSE ./
RUN npm install
USER node
COPY --chown=node:node . .
RUN npm run build

FROM nginx:1.27.4-alpine
COPY --from=build /usr/src/app/out/index.html /usr/share/nginx/html/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]