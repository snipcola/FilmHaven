import { build } from "./functions.js";

const success = await build();

if (!success) {
  process.exit(1);
}
