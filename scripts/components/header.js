import { config } from "../config.js";
import { getInnerText, onWindowResize } from "../functions.js";
import { getHash, setHash, onHashChange } from "../hash.js";
import { initializeContent } from "./content.js";

let activeIndex = 0;
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

function getSectionName() {
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
    const section = document.querySelector(`.content > .section.${sectionName.toLowerCase()}`);
    
    if (!section) {
        console.error(`Failed to find section "${sectionName}".`);
    } else {
        section.classList.add("active");
        document.documentElement.scrollTo({ top: 0 });
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
            brandText.innerText = desktop ? config.header.name.normal.text : config.header.name.mobile.text;
            brandAccent.innerText = desktop ? config.header.name.normal.accent : config.header.name.mobile.accent;
        }
    }
    
    onWindowResize(checkResize);
}

function initializePageChangeCheck() {
    function handleHashChange() {
        const activePage = getHash("page");

        const index = links[activePage - 1] ? activePage - 1 : activeIndex;
        const link = links[index];

        if (link) {
            activeIndex = index;
            setLinkActive(link);
            setHash("page", index + 1);
        }
    }

    handleHashChange();
    onHashChange(handleHashChange);
}

function initializeLinks() {
    links.forEach(function (link, index) {
        link.addEventListener("click", function () {
            setHash("page", index + 1);
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
    brandAccent.innerText = config.header.name[desktop ? "normal" : "mobile"].accent;

    brand.append(brandText);
    brand.append(brandAccent);

    linksElem.className = "links";

    for (const item of config.header.links) {
        const link = document.createElement("div");
        const linkIcon = document.createElement("i");
        const linkText = document.createElement("span");

        link.className = "link";
        linkIcon.className = `icon fa-solid fa-${item.icon}`;
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