import { config } from "../config.js";
import { copyText, onKeyPress } from "../functions.js";
import { getQuery, onQueryChange, removeQuery } from "../query.js";
import { setTitle } from "./header.js";

let container;
let headerText;
let headerInfo;
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

export function changeHeaderText(label, info, titleClass) {
    headerText.innerText = label;
    headerText.className = titleClass ? `text ${titleClass}` : "text";
    headerInfo.innerText = info || "";
    headerInfo.className = info ? "info active" : "info";
}

export function setModal(label = "", info, newContent, icon = "times", fill = false, titleClass) {
    container.className = fill ? "modal-container fill" : "modal-container";
    headerText.innerText = label;
    headerText.className = titleClass ? `text ${titleClass}` : "text";
    headerInfo.innerText = info || "";
    headerInfo.className = info ? "info active" : "info";
    headerButtonIcon.className = `icon icon-${icon}`;
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

    container.scrollTo({ top: 0 });
    document.body.classList.add("modal-active");
}

export function hideModal(ignore) {
    if (!ignore) removeQuery(config.query.modal);
    if (!ignore) document.body.classList.remove("modal-active");

    if (!ignore) setModal();
    if (!ignore) setTitle();
    checkCallback();
}

function initializeModalChangeCheck() {
    function handleQueryChange() {
        const modalQuery = getQuery(config.query.modal);
        
        if (!modalQuery) {
            hideModal();
        } else {
            const [modalType] = modalQuery.split("-");

            if (!config.modal.validTypes.includes(modalType)) {
                hideModal();
            }
        }
    }

    handleQueryChange();
    onQueryChange(handleQueryChange);
}

function copyLink() {
    const page = getQuery(config.query.page);
    const modal = getQuery(config.query.modal);

    if (page && modal) {
        copyButton.classList.add("copied");
        copyButtonIcon.className = "icon icon-check";

        copyText(`${window.location.origin || ""}${window.location.pathname}?${config.query.modal}=${modal}`);
        
        setTimeout(function () {
            copyButtonIcon.className = "icon icon-link";
            copyButton.classList.remove("copied");
        }, 2000);
    }
}

export function initializeModal() {
    container = document.createElement("div");
    const modal = document.createElement("div");

    const header = document.createElement("div");
    const headerTextContainer = document.createElement("div");
    headerText = document.createElement("span");
    headerInfo = document.createElement("span");
    buttons = document.createElement("div");
    copyButton = document.createElement("div");
    copyButtonIcon = document.createElement("i");
    const headerButton = document.createElement("div");
    headerButtonIcon = document.createElement("i");
    
    content = document.createElement("div");

    container.className = "modal-container";
    modal.className = "modal";

    header.className = "modal-header";
    headerTextContainer.className = "text-container";
    headerText.className = "text";
    headerInfo.className = "info";
    buttons.className = "header-buttons";
    headerButton.className = "button secondary icon-only";
    headerButtonIcon.className = "icon icon-times";
    copyButton.className = "button secondary icon-only";
    copyButtonIcon.className = "icon icon-link";

    headerTextContainer.append(headerText);
    headerTextContainer.append(headerInfo);

    headerButton.append(headerButtonIcon);
    headerButton.addEventListener("click", function () {
        hideModal();
    });

    copyButton.append(copyButtonIcon);
    copyButton.addEventListener("click", copyLink);

    buttons.append(copyButton);
    buttons.append(headerButton);
    
    header.append(headerTextContainer);
    header.append(buttons);

    content.className = "modal-content";
    
    modal.append(header);
    modal.append(content);

    container.append(modal);
    document.body.append(container);

    initializeModalChangeCheck();
    onKeyPress("x", false, null, null, function () {
        if (document.body.classList.contains("modal-active")) {
            hideModal();
        }
    });
}