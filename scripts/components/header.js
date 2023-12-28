import { config } from "../config.js";
import { getInnerText } from "../functions.js";
import { getHash, setHash, onHashChange } from "../hash.js";

let links = [];
let sections = [];

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
        const activePage = getHash("page");

        const defaultLinkIndex = links[activePage - 1] ? activePage - 1 : 0;
        const defaultLink = links[defaultLinkIndex];

        if (defaultLink) {
            setLinkActive(defaultLink);
            setHash("page", defaultLinkIndex + 1);
        }
    }

    handlePageChange();
    onHashChange(handlePageChange);

    for (var i = 0; i < links.length; i++) {
        const linkIndex = i;
        const link = links[linkIndex];

        link.addEventListener("click", function () {
            setLinkActive(link);
            setHash("page", linkIndex + 1);
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