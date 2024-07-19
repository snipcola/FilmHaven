import { onRequest } from "./request.js";

export default function (server) {
  server.get("/api/:id/:imdbId/:online?", async function (...args) {
    return await onRequest("movie", ...args);
  });

  server.get(
    "/api/:id/:imdbId/:season/:episode/:online?",
    async function (...args) {
      return await onRequest("tv", ...args);
    },
  );

  server.setNotFoundHandler(function (_, reply) {
    reply.code(404).send("404 Not Found");
  });
}
