import { onRequest } from "./request.js";

async function resolve(type, req) {
  const info = { type, ...req.params };

  if (Object.values(info).some((v) => [undefined, null, ""].includes(v))) {
    return { success: false, message: "Missing Parameters" };
  }

  return await onRequest(info);
}

export default function (server) {
  server.get("/api/:id/:imdbId", (...args) => resolve("movie", ...args));
  server.get("/api/:id/:imdbId/:season/:episode", (...args) =>
    resolve("tv", ...args),
  );

  server.setNotFoundHandler((_, reply) =>
    reply.code(404).send("404: Not Found"),
  );
}
