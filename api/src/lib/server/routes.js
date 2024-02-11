import { onRootRequest, onRequest } from "./request.js";

export function applyRoutes(server) {
    server.get("/", onRootRequest);

    server.get("/:provider/:id/:imdbId?", async function (...args) {
        return await onRequest("movie", ...args);
    });

    server.get("/:provider/:id/:season/:episode/:imdbId?", async function (...args) {
        return await onRequest("tv", ...args);
    });
}