FROM node:23.11.0-alpine AS build
USER node
WORKDIR /usr/src/build
COPY --chown=node:node . .
RUN npm install --production && npm run build

FROM nginx:1.28.0-alpine
COPY --from=build /usr/src/build/out/index.html /usr/share/nginx/html/index.html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]