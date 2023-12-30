import { getTheme, setTheme } from "../store/theme.js";

export function initializeSettings() {
    const section = document.querySelector(".section.settings");

    if (!section) {
        return console.error("Failed to find section.");
    }

    const label = document.createElement("div");
    const labelIcon = document.createElement("i");
    const labelText = document.createElement("span");

    const theme = document.createElement("div");
    const auto = document.createElement("div");
    const dark = document.createElement("div");
    const light = document.createElement("div");

    function themeCheck() {
        const activeTheme = getTheme();
        auto.className = activeTheme === "auto" ? "active" : null;
        dark.className = activeTheme === "dark" ? "active" : null;
        light.className = activeTheme === "light" ? "active" : null;
    }

    label.className = "label";
    labelIcon.className = "icon fa-solid fa-palette";
    labelText.className = "text";
    labelText.innerText = "Theme";

    label.append(labelIcon);
    label.append(labelText);

    theme.className = "theme";
    auto.innerText = "Auto";
    dark.innerText = "Dark";
    light.innerText = "Light";

    themeCheck();
    
    auto.addEventListener("click", function () {
        setTheme("auto");
        themeCheck();
    });

    dark.addEventListener("click", function () {
        setTheme("dark");
        themeCheck();
    });

    light.addEventListener("click", function () {
        setTheme("light");
        themeCheck();
    });

    theme.append(auto);
    theme.append(dark);
    theme.append(light);

    section.append(label);
    section.append(theme);
}