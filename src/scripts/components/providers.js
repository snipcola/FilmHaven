import { config } from "../config.js";
import { hideModal, setModal, showModal } from "./modal.js";
import { getQuery, onQueryChange } from "../query.js";
import { setTitle } from "./header.js";
import { getProviders, setProviders } from "../store/providers.js";
import { getProviderIndex, setProvider } from "../store/provider.js";
import { useDefaultProviders as defaultProviders } from "../config.js";
import {
  getDefaultProviders,
  setDefaultProviders,
} from "../store/default-providers.js";

export function parseProvider(provider, info) {
  let url = info.type === "movie" ? provider.movie : provider.tv;
  const replacements = [
    {
      text: "%b",
      replace: provider.base,
    },
    {
      text: "%i",
      replace: info.id,
    },
    {
      text: "%i2",
      replace: info.imdbId,
    },
    ...(info.type !== "movie"
      ? [
          {
            text: "%s",
            replace: info.season,
          },
          {
            text: "%e",
            replace: info.episode,
          },
        ]
      : []),
  ];

  for (const replacement of replacements) {
    url = url.replace(new RegExp(replacement.text, "g"), replacement.replace);
  }

  return url;
}

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

function createTable(columns, rows) {
  const table = document.createElement("table");
  const headerRow = document.createElement("tr");

  for (const column of columns) {
    const th = document.createElement("th");
    th.textContent = column;
    headerRow.append(th);
  }

  table.append(headerRow);

  for (const { cells, disabled } of rows) {
    const row = document.createElement("tr");
    if (disabled) row.classList.add("disabled");

    for (const cell of cells) {
      const td = document.createElement("td");

      if (cell instanceof HTMLElement) td.append(cell);
      else td.textContent = cell;

      row.append(td);
    }

    table.append(row);
  }

  return table;
}

function createModal(titleText, buttonText, fields, onButtonClick) {
  const modalContainer = document.createElement("div");
  const modal = document.createElement("div");
  const header = document.createElement("div");
  const content = document.createElement("div");
  const title = document.createElement("span");

  modalContainer.className = "provider-modal-container";
  modal.className = "provider-modal";
  header.className = "provider-header";
  content.className = "provider-content";
  title.className = "title";
  title.textContent = titleText;

  const inputs = [];

  for (const { name, placeholder, value } of fields) {
    const input = document.createElement("input");
    if (placeholder) input.setAttribute("placeholder", placeholder);
    if (value) input.value = value;
    inputs.push({ input, name, value });
    content.append(input);
  }

  function close() {
    modalContainer.classList.remove("active");

    for (const { input, value } of inputs) {
      input.value = value || "";
    }
  }

  const buttons = document.createElement("div");
  buttons.className = "buttons";

  const createButton = document.createElement("div");
  const createButtonText = document.createElement("span");
  createButton.className = "button";
  createButtonText.className = "text";
  createButtonText.innerText = buttonText;
  createButton.append(createButtonText);
  createButton.addEventListener("click", function () {
    const values = inputs.reduce((acc, { name, input }) => {
      acc[name] = input.value;
      return acc;
    }, {});

    const result = onButtonClick(values);

    if (result?.error) alert(result.error);
    else if (result?.success) close();
  });

  const cancelButton = document.createElement("div");
  const cancelButtonText = document.createElement("span");
  cancelButton.className = "button secondary";
  cancelButtonText.className = "text";
  cancelButtonText.innerText = "Cancel";
  cancelButton.append(cancelButtonText);
  cancelButton.addEventListener("click", close);

  buttons.append(createButton, cancelButton);
  content.append(buttons);

  header.append(title);
  modal.append(header, content);
  modalContainer.append(modal);

  return modalContainer;
}

function modal() {
  const [settingsArea, settingsContent] = createArea("Settings");
  const [providersArea, providersContent] = createArea("Providers");

  let providers = getProviders();
  let providersTable;

  const notice = document.createElement("div");
  const noticeIcon = document.createElement("i");
  const noticeText = document.createElement("span");
  notice.className = "notice";
  noticeIcon.className = "icon icon-censor";
  noticeText.className = "text";
  noticeText.innerText = "No Providers";
  notice.append(noticeIcon, noticeText);

  let editModal = document.createElement("div");
  editModal.className = "provider-modal-container";

  function updateTable() {
    const tableRows = [];

    for (const [index, provider] of providers.entries()) {
      const actions = document.createElement("div");
      actions.className = "actions";

      const moveUpButton = document.createElement("div");
      const moveUpButtonIcon = document.createElement("i");
      moveUpButton.className = "button secondary icon-only";
      moveUpButtonIcon.className = "icon icon-arrow-up";
      moveUpButton.append(moveUpButtonIcon);
      moveUpButton.addEventListener("click", function () {
        [providers[index], providers[index - 1]] = [
          providers[index - 1],
          providers[index],
        ];

        setProviders(providers.filter((p) => !p.default));

        const providerIndex = getProviderIndex();
        let newIndex;

        if (providerIndex === index) {
          newIndex = providerIndex - 1;
        } else if (providerIndex === index - 1) {
          newIndex = providerIndex + 1;
        }

        if (newIndex && providers[newIndex]) setProvider(newIndex);
        updateTable();
      });

      const previousProvider = providers[index - 1];

      if (
        !provider.default &&
        (!previousProvider || previousProvider.default)
      ) {
        moveUpButton.classList.add("disabled");
      }

      const moveDownButton = document.createElement("div");
      const moveDownButtonIcon = document.createElement("i");
      moveDownButton.className = "button secondary icon-only";
      moveDownButtonIcon.className = "icon icon-arrow-down";
      moveDownButton.append(moveDownButtonIcon);
      moveDownButton.addEventListener("click", function () {
        [providers[index], providers[index + 1]] = [
          providers[index + 1],
          providers[index],
        ];

        setProviders(providers.filter((p) => !p.default));

        const providerIndex = getProviderIndex();
        let newIndex;

        if (providerIndex === index) {
          newIndex = providerIndex + 1;
        } else if (providerIndex === index + 1) {
          newIndex = providerIndex - 1;
        }

        if (newIndex && providers[newIndex]) setProvider(newIndex);
        updateTable();
      });

      const nextProvider = providers[index + 1];

      if (!provider.default && (!nextProvider || nextProvider.default)) {
        moveDownButton.classList.add("disabled");
      }

      const editButton = document.createElement("div");
      const editButtonIcon = document.createElement("i");
      editButton.className = "button secondary icon-only";
      editButtonIcon.className = "icon icon-pencil";
      editButton.append(editButtonIcon);
      editButton.addEventListener("click", function () {
        const newEditModal = createModal(
          `Edit ${provider.name || provider.base}`,
          "Edit",
          [
            {
              name: "name",
              placeholder: "Name (optional)",
              value: provider.name,
            },
            {
              name: "base",
              placeholder: "Base (e.g. example.org)",
              value: provider.base,
            },
            {
              name: "movie",
              placeholder: "Movie URL",
              value: provider.movie,
            },
            {
              name: "tv",
              placeholder: "Series URL",
              value: provider.tv,
            },
          ],
          function ({ name, base, movie, tv }) {
            if ([base, movie, tv].includes("")) {
              return {
                success: false,
                error: "Ensure required fields are provided.",
              };
            }

            if (
              providers.find(
                (p, i) => i !== index && (p.name || p.base) === (name || base),
              )
            ) {
              return {
                success: false,
                error: "Similar provider already exists.",
              };
            }

            providers[index] = { base, movie, tv };
            if (name) providers[index].name = name;

            setProviders(providers.filter((p) => !p.default));
            updateTable();

            return { success: true };
          },
        );

        newEditModal.classList.add("active");
        editModal.replaceWith(newEditModal);
        editModal = newEditModal;
      });

      const deleteButton = document.createElement("div");
      const deleteButtonIcon = document.createElement("i");
      deleteButton.className = "button secondary icon-only";
      deleteButtonIcon.className = "icon icon-trash";
      deleteButton.append(deleteButtonIcon);
      deleteButton.addEventListener("click", function () {
        providers = providers.filter((_, i) => i !== index);
        setProviders(providers.filter((p) => !p.default));

        const providerIndex = getProviderIndex();
        let newIndex;

        if (providerIndex === index) {
          if (index === 0) {
            newIndex = 0;
          } else {
            newIndex = providers[providerIndex + 1]
              ? providerIndex + 1
              : providers[providerIndex - 1]
                ? providerIndex - 1
                : providers.length - 1;
          }
        } else if (providerIndex > index) {
          newIndex = providers[providerIndex - 1]
            ? providerIndex - 1
            : providers.length - 1;
        }

        if (newIndex && providers[newIndex]) setProvider(newIndex);
        updateTable();
      });

      actions.append(moveUpButton, moveDownButton, editButton, deleteButton);

      tableRows.push({
        cells: [provider.name || provider.base, actions],
        disabled: provider.default || false,
      });
    }

    const newTable =
      tableRows.length > 0
        ? createTable(["Provider", "Actions"], tableRows)
        : notice;

    if (providersTable) providersTable.replaceWith(newTable);
    providersTable = newTable;
  }

  updateTable();

  const buttons = document.createElement("div");
  buttons.className = "buttons";

  const creationModal = createModal(
    "Create Provider",
    "Create",
    [
      {
        name: "name",
        placeholder: "Name (optional)",
      },
      {
        name: "base",
        placeholder: "Base (e.g. example.org)",
      },
      {
        name: "movie",
        placeholder: "Movie URL",
        value: "https://%b/embed/movie/%i",
      },
      {
        name: "tv",
        placeholder: "Series URL",
        value: "https://%b/embed/tv/%i/%s/%e",
      },
    ],
    function ({ name, base, movie, tv }) {
      if ([base, movie, tv].includes("")) {
        return {
          success: false,
          error: "Ensure required fields are provided.",
        };
      }

      if (providers.find((p) => (p.name || p.base) === (name || base))) {
        return {
          success: false,
          error: "Similar provider already exists.",
        };
      }

      const provider = { base, movie, tv };
      if (name) provider.name = name;

      providers.push(provider);
      setProviders(providers.filter((p) => !p.default));
      updateTable();

      return { success: true };
    },
  );

  const createButton = document.createElement("div");
  const createButtonIcon = document.createElement("i");
  const createButtonText = document.createElement("span");
  createButton.className = "button";
  createButtonIcon.className = "icon icon-plus";
  createButtonText.className = "text";
  createButtonText.innerText = "Create";
  createButton.append(createButtonIcon, createButtonText);
  createButton.addEventListener("click", function () {
    creationModal.classList.add("active");
  });

  const resetButton = document.createElement("div");
  const resetButtonIcon = document.createElement("i");
  const resetButtonText = document.createElement("span");
  resetButton.className = "button secondary";
  resetButtonIcon.className = "icon icon-sync";
  resetButtonText.className = "text";
  resetButtonText.innerText = "Reset";
  resetButton.append(resetButtonIcon, resetButtonText);

  buttons.append(createButton, resetButton);
  providersContent.append(providersTable, buttons);

  const useDefaultProviders = getDefaultProviders();
  const defaultProvidersSelect = createSelect(
    "Default Providers",
    "cog",
    function () {
      return Object.entries(defaultProviders).map(([value, label]) => ({
        label,
        value,
        active: useDefaultProviders === value,
      }));
    },
    function (defaults) {
      setDefaultProviders(defaults);
      providers = getProviders();
      updateTable();
    },
  );

  resetButton.addEventListener("click", function () {
    defaultProvidersSelect.querySelector("select").value = "include";
    setDefaultProviders("include");
    setProviders([]);
    setProvider(0);
    providers = getProviders();
    updateTable();
  });

  settingsContent.append(defaultProvidersSelect);

  setModal(
    "Providers",
    null,
    [creationModal, editModal, settingsArea, providersArea],
    "arrow-left",
  );
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
