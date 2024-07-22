import { config } from "../config.js";
import { onKeyPress } from "../functions.js";
import { getQuery, onQueryChange, removeQuery } from "../query.js";
import { setTitle } from "./header.js";

let modal;
let container;
let header;
let headerText;
let headerInfo;
let buttons;
let customButtons;
let headerButtonIcon;
let content;
let callback;

function checkCallback() {
  if (callback && typeof callback === "function") {
    callback(modal);
  }

  callback = null;
}

export function changeHeaderText(label, info, titleClass) {
  headerText.innerText = label;
  headerText.className = titleClass ? `text ${titleClass}` : "text";
  headerInfo.innerText = info || "";
  headerInfo.className = info ? "info active" : "info";
}

export function setModal(
  label = "",
  info,
  newContent,
  icon = "times",
  titleClass,
  headerClass,
) {
  container.className = "modal-container";
  header.className = headerClass
    ? `modal-header ${headerClass}`
    : "modal-header";
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
    if (customButtons) setCustomButtons();
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

function createCustomButton(data) {
  if (
    !data ||
    !data.icon ||
    !data.callback ||
    typeof data.callback !== "function"
  )
    return;

  const customButton = document.createElement("div");
  const customButtonIcon = document.createElement("i");

  customButton.className = "button secondary icon-only";
  customButtonIcon.className = `icon icon-${data.icon}`;

  customButton.append(customButtonIcon);
  customButton.addEventListener("click", data.callback);

  customButtons.append(customButton);
}

export function setCustomButtons(data) {
  customButtons.innerHTML = "";
  if (data && Array.isArray(data)) data.forEach(createCustomButton);
}

export function initializeModal() {
  container = document.createElement("div");
  modal = document.createElement("div");

  header = document.createElement("div");
  const headerTextContainer = document.createElement("div");
  headerText = document.createElement("span");
  headerInfo = document.createElement("span");
  buttons = document.createElement("div");
  customButtons = document.createElement("div");
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
  customButtons.className = "custom-buttons";

  headerTextContainer.append(headerText);
  headerTextContainer.append(headerInfo);

  headerButton.append(headerButtonIcon);
  headerButton.addEventListener("click", function () {
    hideModal();
  });

  buttons.append(customButtons);
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
