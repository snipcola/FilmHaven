import cors from "@fastify/cors";

export default async function (server, origin) {
  await server.register(cors, { origin: origin || "*" });
}
