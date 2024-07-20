import { onRequest } from "./request.js";

export default function (server) {
  server.get("/api", async function (...args) {
    return await onRequest(...args);
  });

  server.setNotFoundHandler(function (_, reply) {
    reply.code(404).send("404 Not Found");
  });
}
