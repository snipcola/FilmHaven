import { onRootRequest, onRequest } from "./request.js";

export default function (server) {
    server.post("/api", onRootRequest);

    server.post("/api/:provider/:id/:imdbId?", async function (...args) {
        return await onRequest("movie", ...args);
    });

    server.post("/api/:provider/:id/:season/:episode/:imdbId?", async function (...args) {
        return await onRequest("tv", ...args);
    });

    server.setNotFoundHandler(function (_, reply) {
        reply.code(404).send("404 Not Found");
    });
}