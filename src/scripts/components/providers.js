import { config } from "../config.js";
import { hideModal, setModal, showModal } from "./modal.js";
import { getQuery, onQueryChange } from "../query.js";
import { setTitle } from "./header.js";
import { getProviders, setProviders } from "../store/providers.js";
import { getProvider, setProvider, resetProvider } from "../store/provider.js";
import { useDefaultProviders as defaultProviders } from "../config.js";
import {
  getDefaultProviders,
  setDefaultProviders,
} from "../store/default-providers.js";
import { generateUUID } from "../functions.js";
import { getTMDBKey, resetTMDBKey, setTMDBKey } from "../store/tmdb-key.js";

export function parseProvider(provider, info) {
  let url = info.type === "movie" ? provider.movie : provider.tv;
  const replacements = [
    {
      text: "%b",
      replace: provider.base,
    },
    {
      text: "%i2",
      replace: info.imdbId,
    },
    {
      text: "%i",
      replace: info.id,
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

  for (const cells of rows) {
    const row = document.createElement("tr");

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

function createButton(text, icon, buttonClasses, buttonText, onClick) {
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

  const button = document.createElement("div");
  const buttonTextElem = document.createElement("span");
  button.className = "button";
  if (buttonClasses) button.classList.add(...buttonClasses);
  buttonTextElem.className = "text";
  buttonTextElem.innerText = buttonText;
  button.append(buttonTextElem);
  button.addEventListener("click", onClick);

  container.append(button);
  return container;
}

function createModal(titleText, buttonText, fields, onButtonClick, textarea) {
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
    const input = document.createElement(textarea ? "textarea" : "input");
    input.className = "input";
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

  const _createButton = document.createElement("div");
  const createButtonText = document.createElement("span");
  _createButton.className = "button";
  createButtonText.className = "text";
  createButtonText.innerText = buttonText;
  _createButton.append(createButtonText);
  _createButton.addEventListener("click", function () {
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

  buttons.append(_createButton, cancelButton);
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

  let rawModal = document.createElement("div");
  rawModal.className = "provider-modal-container";

  function updateTable() {
    const tableRows = [];
    const selectedProviderId = getProvider();

    for (const [index, provider] of providers.entries()) {
      const actions = document.createElement("div");
      actions.className = "actions";

      const selectButton = document.createElement("div");
      const selectButtonIcon = document.createElement("i");
      selectButton.className = "button secondary icon-only";
      selectButtonIcon.className = "icon icon-check";
      selectButton.append(selectButtonIcon);
      selectButton.addEventListener("click", function () {
        setProvider(provider.id);
        updateTable();
      });

      if (provider.id === selectedProviderId) {
        selectButton.classList.add("disabled");
      }

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

            providers[index] = { id: provider.id, base, movie, tv };
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
        providers = providers.filter(({ id }) => id !== provider.id);
        setProviders(providers.filter((p) => !p.default));

        if (provider.id === selectedProviderId) resetProvider();
        updateTable();
      });

      actions.append(
        ...(provider.default
          ? [selectButton]
          : [
              selectButton,
              moveUpButton,
              moveDownButton,
              editButton,
              deleteButton,
            ]),
      );

      tableRows.push([provider.name || provider.base, actions]);
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

      const provider = { id: generateUUID(), base, movie, tv };
      if (name) provider.name = name;

      providers.push(provider);
      setProviders(providers.filter((p) => !p.default));
      updateTable();

      return { success: true };
    },
  );

  const _createButton = document.createElement("div");
  const createButtonIcon = document.createElement("i");
  const createButtonText = document.createElement("span");
  _createButton.className = "button";
  createButtonIcon.className = "icon icon-plus";
  createButtonText.className = "text";
  createButtonText.innerText = "Create";
  _createButton.append(createButtonIcon, createButtonText);
  _createButton.addEventListener("click", function () {
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

  const rawButton = document.createElement("div");
  const rawButtonIcon = document.createElement("i");
  const rawButtonText = document.createElement("span");
  rawButton.className = "button secondary";
  rawButtonIcon.className = "icon icon-file";
  rawButtonText.className = "text";
  rawButtonText.innerText = "Raw";
  rawButton.append(rawButtonIcon, rawButtonText);
  rawButton.addEventListener("click", function () {
    const newRawModal = createModal(
      "Edit Providers (Raw JSON)",
      "Edit",
      [
        {
          name: "providers",
          placeholder: "JSON Array",
          value: JSON.stringify(
            providers.filter((p) => !p.default).map(({ id, ...p }) => p),
          ),
        },
      ],
      function ({ providers: newProviders }) {
        if (newProviders === "") {
          return {
            success: false,
            error: "Providers field is empty.",
          };
        }

        let jsonArray;

        try {
          jsonArray = JSON.parse(newProviders);
        } catch {
          return {
            success: false,
            error: "Failed to parse JSON.",
          };
        }

        if (!Array.isArray(jsonArray)) {
          return {
            success: false,
            error: "Not a JSON array.",
          };
        }

        const forcedProperties = ["base", "movie", "tv"];
        const optionalProperties = ["name"];

        function improperlyStructured() {
          return {
            success: false,
            error: "JSON is improperly structured.",
          };
        }

        for (const object of jsonArray) {
          if (typeof object !== "object") {
            return improperlyStructured();
          }

          for (const forcedProperty of forcedProperties) {
            if (!object[forcedProperty]) {
              return improperlyStructured();
            }
          }

          for (const [key, value] of Object.entries(object)) {
            if (
              ![...forcedProperties, ...optionalProperties].includes(key) ||
              typeof value !== "string" ||
              value === ""
            ) {
              return improperlyStructured();
            }
          }
        }

        setProviders(jsonArray.map((p) => ({ id: generateUUID(), ...p })));
        resetProvider();
        providers = getProviders();
        updateTable();
        return { success: true };
      },
      true,
    );

    newRawModal.classList.add("active");
    rawModal.replaceWith(newRawModal);
    rawModal = newRawModal;
  });

  buttons.append(_createButton, resetButton, rawButton);
  providersContent.append(providersTable, buttons);

  const tmdbApiKeyModal = createModal(
    "TMDB API Key",
    "Set",
    [
      {
        name: "apiKey",
        placeholder: "Key (leave blank for default)",
        value: getTMDBKey(true),
      },
    ],
    function ({ apiKey }) {
      if (apiKey && apiKey !== "") setTMDBKey(apiKey);
      else resetTMDBKey();

      window.location.reload();
      return { success: true };
    },
  );

  const tmdbApiKeyButton = createButton(
    "TMDB API Key",
    "key",
    ["secondary"],
    "Edit",
    function () {
      tmdbApiKeyModal.classList.add("active");
    },
  );

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
      const selectedProviderId = getProvider();
      const selectedProvider = providers.find(
        ({ id }) => id === selectedProviderId,
      );

      if (defaults === "exclude" && selectedProvider?.default) {
        resetProvider();
      }

      updateTable();
    },
  );

  resetButton.addEventListener("click", function () {
    defaultProvidersSelect.querySelector("select").value = "include";
    setDefaultProviders("include");
    setProviders([]);
    resetProvider();
    providers = getProviders();
    updateTable();
  });

  settingsContent.className = "settings-content";
  settingsContent.append(tmdbApiKeyButton, defaultProvidersSelect);

  setModal(
    "Providers",
    null,
    [
      tmdbApiKeyModal,
      creationModal,
      editModal,
      rawModal,
      settingsArea,
      providersArea,
    ],
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
