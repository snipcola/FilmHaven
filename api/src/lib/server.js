import fastify from "fastify";

import applyCors from "./server/cors.js";
import applyCaching from "./server/cache.js";
import applyRoutes from "./server/routes.js";

function runServer(server, host, port) {
  return new Promise(function (res) {
    server.listen(
      {
        host: host || "0.0.0.0",
        port: port || 2000,
      },
      function (error, address) {
        if (error) res({ success: false, error });
        res({ success: true, address });
      },
    );
  });
}

export function initializeServer(serverless) {
  return new Promise(async function (res) {
    const server = fastify();

    await applyCors(
      server,
      process.env.NODE_ENV === "production" ? process.env.ORIGIN : "*",
    );
    await applyCaching(server, process.env.CACHE_TIMEOUT);
    applyRoutes(server);

    if (serverless) {
      res(async function (req, res) {
        await server.ready();
        server.server.emit("request", req, res);
      });
    } else {
      const response = await runServer(
        server,
        process.env.HOST,
        process.env.PORT,
      );
      res(response);
    }
  });
}
