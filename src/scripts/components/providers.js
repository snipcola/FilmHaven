import { config } from "../config.js";
import { hideModal, setModal, showModal } from "./modal.js";
import { getQuery, onQueryChange } from "../query.js";
import { setTitle } from "./header.js";

function createArea(text) {
  const area = document.createElement("div");
  area.className = "area providers";

  const label = document.createElement("div");
  label.className = "label";
  label.innerText = text;

  const content = document.createElement("div");
  area.append(label, content);

  return [area, content];
}

function createSelect(text, icon, _items, onSelect) {
  const container = document.createElement("div");

  const label = document.createElement("div");
  const labelIcon = document.createElement("i");
  const labelText = document.createElement("span");

  container.className = "container";

  label.className = "label";
  labelIcon.className = `icon icon-${icon}`;
  labelText.className = "text";
  labelText.innerHTML = text;

  label.append(labelIcon);
  label.append(labelText);
  container.append(label);

  const select = document.createElement("select");
  select.className = "select";

  function initialize(items) {
    for (const item of items) {
      const option = document.createElement("option");

      option.value = item.value;
      option.innerHTML = item.label;

      if (item.placeholder) {
        option.setAttribute("selected", true);
      }

      select.append(option);
    }

    const activeItem = items.find((i) => i.active);
    if (activeItem) select.value = activeItem.value;

    select.addEventListener("change", function () {
      if (onSelect) onSelect(select.value);
    });
  }

  const items = _items();

  if (items instanceof Promise) items.then(initialize);
  else initialize(items);

  container.append(select);
  return container;
}

function modal() {
  const [settingsArea, settingsContent] = createArea("Settings");
  const [providersArea, providersContent] = createArea("Providers");
  const useDefaultProviders = createSelect(
    "Default Providers",
    "cog",
    function () {
      return [
        {
          label: "Include",
          value: "yes",
          active: true,
        },
        {
          label: "Exclude",
          value: "no",
        },
      ];
    },
    function (defaults) {},
  );

  settingsContent.append(useDefaultProviders);

  setModal("Providers", null, [settingsArea, providersArea], "arrow-left");
  showModal();
}

function initializeProvidersModalCheck() {
  function handleQueryChange() {
    const modalQuery = getQuery(config.query.modal);

    if (modalQuery) {
      const [modalType] = modalQuery.split("-");

      if (modalType === "p") {
        hideModal(true, true);
        modal();
        setTitle("Providers");
      }
    }
  }

  handleQueryChange();
  onQueryChange(handleQueryChange);
}

export async function initializeProviders() {
  initializeProvidersModalCheck();
}
