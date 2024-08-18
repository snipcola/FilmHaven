import { onRequest, onPlayRequest } from "./request.js";

export function notFound(reply) {
  reply.code(404).send("404: Not Found");
}

async function resolve(type, req) {
  const info = { type, ...req.params };

  if (Object.values(info).some((v) => [undefined, null, ""].includes(v))) {
    return { success: false, message: "Missing Parameters" };
  }

  return await onRequest(info, req);
}

export default function (server) {
  server.setNotFoundHandler((_, reply) => notFound(reply));

  server.get("/api/:id/:imdbId", (...args) => resolve("movie", ...args));
  server.get("/api/:id/:imdbId/:season/:episode", (...args) =>
    resolve("tv", ...args),
  );

  server.get("/api/play/:data/:audio.mpd", onPlayRequest);
}
