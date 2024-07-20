import { onRequest, onEmbedRequest } from "./request.js";

export default function (server) {
  server.get("/api/:id/:imdbId/:online/:custom?", async function (...args) {
    return await onRequest("movie", ...args);
  });

  server.get(
    "/api/:id/:imdbId/:season/:episode/:online/:custom?",
    async function (...args) {
      return await onRequest("tv", ...args);
    },
  );

  server.get("/api/embed/:id", async function (...args) {
    return await onEmbedRequest("movie", ...args);
  });

  server.get("/api/embed/:id/:season/:episode", async function (...args) {
    return await onEmbedRequest("tv", ...args);
  });

  server.setNotFoundHandler(function (_, reply) {
    reply.code(404).send("404 Not Found");
  });
}
