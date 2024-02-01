// Config
const config = {
    hosts: [
        "vidsrc.to",
        "vidsrc.me",
        "flixon.lol",
        "2embed.me",
        "databasegdriveplayer.xyz",
        "remotestre.am"
    ],
    blacklist: {
        status: [
            404, // Not Found
            500 // Internal Server Error
        ],
        text: [
            "not found", // Generic
            "no sources", // Generic
            "onionplay streaming mirrors", // flixon.lol
            "no movie found", // 2embed.me
            "no tv show found", // 2embed.me
            `,"file":"","kind"`, // databasegdriveplayer.xyz
            "video_error.mp4" // remotestre.am
        ]
    },
    cacheMaxAge: 21600,
    timeout: 5000
};

// Imports
import dotenv from "dotenv";
import fetch from "node-fetch";
import proxy from "cors-anywhere";

import { fileURLToPath } from "url";
import path, { dirname } from "path";

import { URL } from "url";

// DotEnv
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

// Variables
const allowedOrigins = process.env.ORIGIN?.split(",") || ["*"];
const allowedHosts = config.hosts || [];

const host = process.env.HOST || "0.0.0.0";
const port = process.env.PORT || 5000;

// Functions
function promiseWithTimeout(promise, timeout) {
    return Promise.race([promise, new Promise((res) => setTimeout(res, timeout))]);
}

async function handleRequest(req, res, _url) {
    // Parse URL
    let url;

    try {
        const tempURL = new URL(`http://localhost${req?.url}`);
        url = new URL(tempURL.searchParams.get("url"));
    }
    catch {
        url = null;
    }

    // Variables
    const hostname = url?.hostname;
    const origin = req?.headers?.origin;

    const allowedHost = allowedHosts.includes(hostname);
    const allowedOrigin = !origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin);

    // Functions
    function sendJSON(status, data) {
        res.writeHead(status, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));
    }

    function unauthorized() {
        sendJSON(401, { success: false, message: "Unauthorized" });
    }

    function notFound() {
        sendJSON(404, { success: false, message: "Not Found" });
    }

    function send(valid) {
        if (valid) sendJSON(200, { success: true });
        else sendJSON(500, { success: false, message: "Invalid" });
    }

    // Origin Check
    if (!allowedOrigin) {
        unauthorized();
        return true;
    } else {
        res.setHeader("Access-Control-Allow-Origin", origin || "*");
    }

    // Host Check
    if (!allowedHost) {
        notFound();
        return true;
    }

    // Response Check
    let response;

    try { response = await promiseWithTimeout(fetch(url?.href), config.timeout) }
    catch {
        send(false);
        return true;
    };

    // Timeout Check
    if (!response) {
        send(false);
        return true;
    }

    // Blacklist Check
    const text = (await response.text())?.toLowerCase() || "";
    const blacklistedStatus = config.blacklist?.status.includes(response.status);
    const blacklistedText = config.blacklist?.text.some((t) => text.includes(t));

    if (blacklistedStatus || blacklistedText) {
        send(false);
        return true;
    }

    // Valid
    send(true);
    return true;
}

function handleLoad() {
    console.log(`Running on ${host}:${port}, origin(s): ${allowedOrigins.join(", ")}`);
}

// Server
const server = proxy.createServer({
    handleInitialRequest: handleRequest,
    corsMaxAge: config.cacheMaxAge || 3600
});

// Listen
server.listen(port, host, handleLoad);