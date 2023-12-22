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
    const sectionName = link.innerText.toLowerCase();
    const section = document.querySelector(`.content > .section.${sectionName}`);
    
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
    for (const link of links) {
        link.addEventListener("click", function () {
            setLinkActive(link);
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