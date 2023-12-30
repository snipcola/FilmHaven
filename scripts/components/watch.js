import { setHash } from "../hash.js";

export function watchContent(type, id) {
    setHash("modal", `watch-${type}-${id}`);
}