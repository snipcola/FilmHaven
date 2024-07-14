import { config } from "../config.js";

export function initializeFooter(element) {
  const container = document.createElement("div");
  const footer = document.createElement("div");

  const copyright = document.createElement("p");
  const links = document.createElement("div");

  container.className = "footer-container";
  footer.className = "footer";

  copyright.className = "copyright";
  copyright.innerText = `© ${new Date().getFullYear()} ${config.author}`;
  links.className = "links";

  for (const item of config.footer.links) {
    const link = document.createElement("a");
    const linkIcon = document.createElement("i");

    link.className = "link";
    link.href = item.url;
    link.target = "_blank";
    link.ariaLabel = item.label;
    linkIcon.className = `icon icon-${item.icon}`;

    if (item.download) link.setAttribute("download", item.download);

    link.append(linkIcon);
    links.append(link);
  }

  footer.append(copyright);
  footer.append(links);

  container.append(footer);
  element.append(container);
}
