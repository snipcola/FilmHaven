import { config } from "../config.js";
import { hideModal, setModal, showModal } from "./modal.js";
import { getQuery, onQueryChange } from "../query.js";
import { setTitle } from "./header.js";

function modal() {
  const area = document.createElement("div");
  area.className = "area";

  const label = document.createElement("div");
  label.className = "label";
  label.innerText = "Providers";

  const content = document.createElement("div");
  area.append(label, content);

  const title = document.createElement("h2");
  title.innerText = "This section is not done yet,";
  title.style.margin = "0";

  const text = document.createElement("p");
  text.innerText = "It's still being developed, make sure to check back soon!";
  text.style.margin = "0";
  text.style.marginTop = "5px";

  content.append(title, text);
  setModal("Providers", null, [area], "arrow-left");
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
