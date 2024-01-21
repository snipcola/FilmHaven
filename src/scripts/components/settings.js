import { getTheme, setTheme } from "../store/theme.js";
import { config, settings } from "../config.js";

export function initializeSettings() {
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

        if (setting.type === "select") {
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

            for (const item of setting.items()) {
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

            container.append(selection);
        } else if (setting.type === "buttons") {
            const buttons = document.createElement("div");
            buttons.className = "buttons";

            for (const item of setting.items()) {
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

            container.append(buttons);
        }

        section.append(container);
    }
}