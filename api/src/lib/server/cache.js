import caching from "fastify-response-caching";

export default async function (server, time) {
  await server.register(caching, { ttl: (time || 300) * 60 * 1000 });
}
