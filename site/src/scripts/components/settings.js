import { settings } from "../config.js";
import { checkMode } from "../store/mode.js";

export function initializeSettings() {
  checkMode();
  const section = document.querySelector(".section.settings");

  if (!section) {
    return console.error("Failed to find section.");
  }

  for (const setting of settings) {
    const container = document.createElement("div");

    const label = document.createElement("div");
    const labelIcon = document.createElement("i");
    const labelText = document.createElement("span");

    container.className = "container";

    label.className = "label";
    labelIcon.className = `icon icon-${setting.label.icon}`;
    labelText.className = "text";
    labelText.innerHTML = setting.label.text;

    label.append(labelIcon);
    label.append(labelText);
    container.append(label);

    if (setting.type === "selection") {
      const selection = document.createElement("div");

      selection.className = "selection";
      if (setting.multi) selection.classList.add("multi");

      function resetOptions() {
        const options = Array.from(selection.children);

        for (const option of options) {
          option.classList.remove("active");
        }
      }

      function setOptionActive(label, toggle) {
        const options = Array.from(selection.children);

        for (const option of options) {
          if (option.innerText === label) {
            option.classList[toggle ? "add" : "remove"]("active");
          }
        }
      }

      function initialize(items) {
        for (const item of items) {
          const option = document.createElement("div");

          option.innerText = item.label;
          if (item.active) option.classList.add("active");

          option.addEventListener("click", function () {
            if (!setting.multi) {
              resetOptions();
              setOptionActive(item.label, true);
            } else {
              const isActive = option.classList.contains("active");
              setOptionActive(item.label, !isActive);
            }

            setting.onClick(item.value);
          });

          selection.append(option);
        }
      }

      const items = setting.items();

      if (items instanceof Promise) items.then(initialize);
      else initialize(items);

      container.append(selection);
    } else if (setting.type === "buttons") {
      const buttons = document.createElement("div");
      buttons.className = "buttons";

      function initialize(items) {
        for (const item of items) {
          const button = document.createElement("div");
          const buttonIcon = document.createElement("i");
          const buttonText = document.createElement("span");

          button.className = "button";
          if (item.class) button.classList.add(item.class);
          buttonIcon.className = `icon icon-${item.label.icon}`;
          buttonText.className = "text";
          buttonText.innerHTML = item.label.text;

          if (item.label.icon) button.append(buttonIcon);
          button.append(buttonText);
          button.addEventListener("click", () => item.onClick(button));

          buttons.append(button);
        }
      }

      const items = setting.items();

      if (items instanceof Promise) items.then(initialize);
      else initialize(items);

      container.append(buttons);
    } else if (setting.type === "select") {
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
          setting.onSelect(select.value);
          if (setting.preventChange) select.value = "";
        });
      }

      const items = setting.items();

      if (items instanceof Promise) items.then(initialize);
      else initialize(items);

      container.append(select);
    }

    section.append(container);
  }
}
