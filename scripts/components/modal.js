import { config } from "../config.js";
import { getHash, onHashChange, removeHash } from "../hash.js";
import { setTitle } from "./header.js";

let container;
let modal;
let headerText;
let headerButtonIcon;
let content;
let callback;

function checkCallback() {
    if (callback && typeof callback === "function") {
        callback();
    }

    callback = null;
}

export function setModal(label = "", newContent, icon = "times", fill = false) {
    container.className = fill ? "modal-container fill" : "modal-container";
    headerText.innerText = label;
    headerButtonIcon.className = `icon fa-solid fa-${icon}`;
    content.innerHTML = "";
    
    if (newContent) {
        if (Array.isArray(newContent)) {
            content.append(...newContent);
        } else {
            content.append(newContent);
        }
    }
}

export function showModal(cb) {
    checkCallback();
    callback = cb;

    modal.scrollTo({ top: 0 });
    document.body.classList.add("modal-active");
}

export function hideModal() {
    removeHash("modal");
    document.body.classList.remove("modal-active");

    setModal();
    setTitle();
    checkCallback();
}

function initializeModalChangeCheck() {
    function handleHashChange() {
        const modalHash = getHash("modal");
        
        if (!modalHash) {
            hideModal();
        } else {
            const [modalType] = modalHash.split("-");

            if (!config.modal.validTypes.includes(modalType)) {
                hideModal();
            }
        }
    }

    handleHashChange();
    onHashChange(handleHashChange);
}

export function initializeModal() {
    container = document.createElement("div");
    modal = document.createElement("div");

    const header = document.createElement("div");
    headerText = document.createElement("span");
    const headerButton = document.createElement("div");
    headerButtonIcon = document.createElement("i");
    
    content = document.createElement("div");

    container.className = "modal-container";
    modal.className = "modal";

    header.className = "modal-header";
    headerText.className = "text";
    headerButton.className = "button secondary icon-only";
    headerButtonIcon.className = "icon fa-solid fa-times";

    headerButton.append(headerButtonIcon);
    headerButton.addEventListener("click", hideModal);
    
    header.append(headerText);
    header.append(headerButton);

    content.className = "modal-content";
    
    modal.append(header);
    modal.append(content);

    container.append(modal);
    document.body.append(container);

    initializeModalChangeCheck();
}