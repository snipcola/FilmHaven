import { initializeEnvironmentVariables } from "./src/other/env.js";
import { initializeServer } from "./src/server.js";

initializeEnvironmentVariables();
const { success, address, error } = await initializeServer();

switch (success) {
    case true:
        console.log(`[Server] Running at ${address}`);
        break;
    case false:
        console.error(`[Server] Error caught:\n`, error);
        process.exit(1);
}