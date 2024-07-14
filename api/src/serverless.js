import { initializeEnvironmentVariables } from "./lib/other/env.js";
import { initializeServer } from "./lib/server.js";

initializeEnvironmentVariables();
export default await initializeServer(true);
