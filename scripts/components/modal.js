import { config } from "../config.js";
import { copyText } from "../functions.js";
import { getHash, onHashChange, removeHash } from "../hash.js";
import { setTitle } from "./header.js";

let container;
let modal;
let headerText;
let buttons;
let copyButton;
let copyButtonIcon;
let headerButtonIcon;
let content;
let callback;

function checkCallback() {
    if (callback && typeof callback === "function") {
        callback();
    }

    callback = null;
}

export function changeHeaderText(label) {
    headerText.innerHTML = label;
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

export function hideModal(ignore) {
    if (!ignore) removeHash(config.hash.modal);
    if (!ignore) document.body.classList.remove("modal-active");

    if (!ignore) setModal();
    if (!ignore) setTitle();
    checkCallback();

    Array.from(buttons.children).forEach(function (button) {
        if (button.classList.contains("custom")) {
            button.remove();
        }
    })
}

function initializeModalChangeCheck() {
    function handleHashChange() {
        const modalHash = getHash(config.hash.modal);
        
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

function copyLink() {
    const modal = getHash(config.hash.modal);
    const page = getHash(config.hash.page);

    if (modal && page) {
        copyButton.classList.add("copied");
        copyButtonIcon.className = "icon fa-solid fa-check";

        copyText(`${window.location.origin}${window.location.pathname}${window.FH_USE_QUERY ? "?" : "#"}${config.hash.page}=${page},${config.hash.modal}=${modal}`);
        
        setTimeout(function () {
            copyButtonIcon.className = "icon fa-solid fa-link";
            copyButton.classList.remove("copied");
        }, 2000);
    }
}

export function initializeModal() {
    container = document.createElement("div");
    modal = document.createElement("div");

    const header = document.createElement("div");
    headerText = document.createElement("span");
    buttons = document.createElement("div");
    copyButton = document.createElement("div");
    copyButtonIcon = document.createElement("i");
    const headerButton = document.createElement("div");
    headerButtonIcon = document.createElement("i");
    
    content = document.createElement("div");

    container.className = "modal-container";
    modal.className = "modal";

    header.className = "modal-header";
    headerText.className = "text";
    buttons.className = "header-buttons";
    headerButton.className = "button secondary icon-only";
    headerButtonIcon.className = "icon fa-solid fa-times";
    copyButton.className = "button secondary icon-only";
    copyButtonIcon.className = "icon fa-solid fa-link"

    headerButton.append(headerButtonIcon);
    headerButton.addEventListener("click", function () {
        hideModal();
    });

    copyButton.append(copyButtonIcon);
    copyButton.addEventListener("click", copyLink);

    buttons.append(copyButton);
    buttons.append(headerButton);
    
    header.append(headerText);
    header.append(buttons);

    content.className = "modal-content";
    
    modal.append(header);
    modal.append(content);

    container.append(modal);
    document.body.append(container);

    initializeModalChangeCheck();
}