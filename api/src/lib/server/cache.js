import caching from "fastify-response-caching";

export async function applyCaching(server, time) {
    await server.register(caching, { ttl: (time || 300) * 60 * 1000 });
}