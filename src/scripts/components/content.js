import { config } from "../config.js";
import { getPage } from "../store/pages.js";

export function initializeContent(element) {
  const content = document.createElement("div");
  content.className = "content";

  for (const item of config.header.links) {
    if (getPage(item.text) === false) continue;

    const section = document.createElement("div");
    section.className = `section ${item.text.toLowerCase()}`;
    content.append(section);
  }

  element.append(content);
  return content;
}
