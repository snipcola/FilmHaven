import { config } from "../config.js";
import { getInnerText, onWindowResize } from "../functions.js";
import { getHash, setHash, onHashChange } from "../hash.js";
import { initializeContent } from "./content.js";

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

function setSectionActive(link) {
    const sectionName = getInnerText(link);
    const section = document.querySelector(`.content > .section.${sectionName.toLowerCase()}`);

    document.title = `${config.name} - ${sectionName}`;
    
    if (!section) {
        return console.error(`Failed to find section "${sectionName}".`);
    }

    section.classList.add("active");
}

function setLinkActive(link) {
    setLinksInactive();
    setSectionsInactive();

    setSectionActive(link);
    link.classList.add("active");
}

export function resetTitle() {
    const activePage = getHash("page");
    const link = links[activePage - 1];

    if (link) {
        setLinkActive(link);
    }
}

function initializeLinks() {
    function handleHashChange() {
        const activePage = getHash("page");

        const defaultLinkIndex = links[activePage - 1] ? activePage - 1 : 0;
        const defaultLink = links[defaultLinkIndex];

        if (defaultLink) {
            setLinkActive(defaultLink);
            setHash("page", defaultLinkIndex + 1);
        }
    }

    handleHashChange();
    onHashChange(handleHashChange);

    for (var i = 0; i < links.length; i++) {
        const linkIndex = i;
        const link = links[linkIndex];

        link.addEventListener("click", function () {
            setLinkActive(link);
            setHash("page", linkIndex + 1);
        });
    }
}

export function initializeHeader(element) {
    let desktop = window.innerWidth > config.maxMobileWidth;

    const container = document.createElement("div");
    const header = document.createElement("div");

    const brand = document.createElement("div");
    const brandText = document.createElement("span");
    const brandAccent = document.createElement("span");

    const linksElem = document.createElement("div");

    container.className = "header-container";
    header.className = "header";

    brand.className = "brand";
    brandText.className = "text";
    brandText.innerText = desktop ? config.header.name.normal.text : config.header.name.mobile.text;
    brandAccent.className = "accent";
    brandAccent.innerText = desktop ? config.header.name.normal.accent : config.header.name.mobile.accent;

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

    function checkResize() {
        const newDesktop = window.innerWidth > config.maxMobileWidth;

        if (desktop !== newDesktop) {
            desktop = newDesktop;
            brandText.innerText = desktop ? config.header.name.normal.text : config.header.name.mobile.text;
            brandAccent.innerText = desktop ? config.header.name.normal.accent : config.header.name.mobile.accent;
        }
    }
    
    onWindowResize(checkResize);
    element.append(container);

    sections = Array.from(initializeContent(element).children);
    initializeLinks();
}