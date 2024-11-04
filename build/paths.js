import path from "path";

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

export const src = path.resolve(__dirname, "..", "src");
export const dist = path.resolve(__dirname, "..", "dist");
