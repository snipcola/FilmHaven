import { config } from "../config.js";
import { getInnerText } from "../functions.js";
import { getHash, setHash, onHashChange } from "../hash.js";

let links = [];
let sections = [];

function setPage(index) {
    setHash("page", index);
}

function getPage() {
    return getHash("page");
}

function isActive(link) {
    return link.classList.contains("active");
}

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
    if (isActive(link)) {
        return;
    }

    setLinksInactive();
    setSectionsInactive();

    setSectionActive(link);
    link.classList.add("active");
}

function initializeLinks() {
    function handlePageChange() {
        const activePage = getPage();

        const defaultLinkIndex = links[activePage] ? activePage : 0;
        const defaultLink = links[defaultLinkIndex];

        if (defaultLink) {
            setLinkActive(defaultLink);
            setPage(defaultLinkIndex);
        }
    }

    handlePageChange();
    onHashChange(handlePageChange);

    for (var i = 0; i < links.length; i++) {
        const linkIndex = i;
        const link = links[linkIndex];

        link.addEventListener("click", function () {
            setLinkActive(link);
            setPage(linkIndex);
        });
    }
}

export function initializeHeader() {
    links = document.querySelectorAll(".header .links .link");
    sections = document.querySelectorAll(".content > .section");

    if (!links || !sections) {
        return console.error("Failed to initialize header.");
    }
    
    initializeLinks();
}