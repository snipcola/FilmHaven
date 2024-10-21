import { onRequest } from "./request.js";

export function notFound(reply) {
  reply.code(404).send("404: Not Found");
}

async function resolve(server, type, req) {
  const info = { type, ...req.params };

  if (Object.values(info).some((v) => [undefined, null, ""].includes(v))) {
    return { success: false, message: "Missing Parameters" };
  }

  return await onRequest(server, info, req);
}

export default function (server) {
  server.setNotFoundHandler((_, reply) => notFound(reply));

  server.get("/api/:id/:imdbId", (...args) =>
    resolve(server, "movie", ...args),
  );

  server.get("/api/:id/:imdbId/:season/:episode", (...args) =>
    resolve(server, "tv", ...args),
  );
}
