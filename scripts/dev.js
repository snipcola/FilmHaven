import { watch } from "fs";
import open from "open";
import { config, build, serve } from "./functions.js";

const success = await build(true);

if (!success) {
  console.warn("Initial build failed");
}

serve(config.dev.port);
setTimeout(
  () => open(`http://localhost:${config.dev.port}`),
  config.dev.openTimeout,
);

console.log("Watching for changes");
let building = false;

watch(config.src, { recursive: true }, async function (event, filename) {
  if (building || !filename) {
    return;
  }

  building = true;
  console.log(`\n${event.toUpperCase()}: ${filename}`);

  await build(true);
  building = false;
});
