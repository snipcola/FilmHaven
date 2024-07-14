import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

export function initializeEnvironmentVariables() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  dotenv.config({ path: path.join(__dirname, "..", "..", "..", ".env") });
}
