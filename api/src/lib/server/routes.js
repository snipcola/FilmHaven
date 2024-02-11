import { onRootRequest, onRequest } from "./request.js";

export function applyRoutes(server) {
    server.get("/api", onRootRequest);

    server.get("/api/:provider/:id/:imdbId?", async function (...args) {
        return await onRequest("movie", ...args);
    });

    server.get("/api/:provider/:id/:season/:episode/:imdbId?", async function (...args) {
        return await onRequest("tv", ...args);
    });
}