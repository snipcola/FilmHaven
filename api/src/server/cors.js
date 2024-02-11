import cors from "@fastify/cors";

export async function applyCors(server, origin) {
    await server.register(cors, { origin: origin || "*" });
}