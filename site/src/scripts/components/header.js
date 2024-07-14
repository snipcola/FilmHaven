import { config } from "../config.js";
import { getInnerText, onWindowResize } from "../functions.js";
import { getQuery, setQuery, onQueryChange } from "../query.js";
import { getPage } from "../store/pages.js";

let activeIndex;
let links = [];
let sections = [];

function setSectionsInactive() {
  for (const section of sections) {
    section.classList.remove("active");
  }
}

function setLinksInactive() {
  for (const link of links) {
    link.classList.remove("active");
  }
}

export function getSectionName() {
  const link = links.find((l) => l.classList.contains("active"));

  if (link) {
    return getInnerText(link);
  }
}

export function setTitle() {
  document.title = `${config.name} - ${getSectionName()}`;
}

function setSectionActive() {
  const sectionName = getSectionName();
  const section = document.querySelector(
    `.content > .section.${sectionName.toLowerCase()}`,
  );

  if (!section) {
    console.error(`Failed to find section "${sectionName}".`);
  } else {
    section.classList.add("active");
  }
}

function setLinkActive(link) {
  setLinksInactive();
  link.classList.add("active");

  setSectionsInactive();
  setSectionActive(link);

  setTitle();
}

let desktop;
let brandText;
let brandAccent;

function initializeResizeCheck() {
  function checkResize() {
    const newDesktop = window.innerWidth > config.maxMobileWidth;

    if (desktop !== newDesktop) {
      desktop = newDesktop;
      brandText.innerText = desktop
        ? config.header.name.normal.text
        : config.header.name.mobile.text;
      brandAccent.innerText = desktop
        ? config.header.name.normal.accent
        : config.header.name.mobile.accent;
    }
  }

  onWindowResize(checkResize);
}

function initializePageChangeCheck() {
  function handleQueryChange() {
    const activePage = getQuery(config.query.page);

    const index = links[activePage - 1] ? activePage - 1 : activeIndex || 0;
    const link = links[index];

    if (link && index !== activeIndex) {
      activeIndex = index;
      setLinkActive(link);
      document.documentElement.scrollTo({ top: 0 });
    }

    setQuery(config.query.page, activeIndex + 1);
  }

  handleQueryChange();
  onQueryChange(handleQueryChange);
}

function initializeLinks() {
  links.forEach(function (link, index) {
    link.addEventListener("click", function () {
      if (!link.classList.contains("active")) {
        setQuery(config.query.page, index + 1);
      }
    });
  });
}

export function initializeHeader(element, content) {
  desktop = window.innerWidth > config.maxMobileWidth;

  const container = document.createElement("div");
  const header = document.createElement("div");

  const brand = document.createElement("div");
  brandText = document.createElement("span");
  brandAccent = document.createElement("span");

  const linksElem = document.createElement("div");

  container.className = "header-container";
  header.className = "header";

  brand.className = "brand";
  brandText.className = "text";
  brandText.innerText = config.header.name[desktop ? "normal" : "mobile"].text;
  brandAccent.className = "accent";
  brandAccent.innerText =
    config.header.name[desktop ? "normal" : "mobile"].accent;

  brand.append(brandText);
  brand.append(brandAccent);

  linksElem.className = "links";

  for (const item of config.header.links) {
    if (getPage(item.text) === false) continue;

    const link = document.createElement("div");
    const linkIcon = document.createElement("i");
    const linkText = document.createElement("span");

    link.className = "link";
    linkIcon.className = `icon icon-${item.icon}`;
    linkText.className = "text";
    linkText.innerText = item.text;

    link.append(linkIcon);
    link.append(linkText);
    linksElem.append(link);
  }

  header.append(brand);
  header.append(linksElem);
  container.append(header);

  links = Array.from(linksElem.children);
  sections = Array.from(content.children);

  element.append(container);

  initializeResizeCheck();
  initializePageChangeCheck();
  initializeLinks();
}
