import { getTheme, setTheme } from "../store/theme.js";
import { resetContinueWatching } from "../store/continue.js";
import { resetLastPlayed } from "../store/last-played.js";

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

    const dataLabel = document.createElement("div");
    const dataLabelIcon = document.createElement("i");
    const dataLabelText = document.createElement("span");

    const resetButton = document.createElement("div");
    const resetButtonIcon = document.createElement("i");
    const resetButtonText = document.createElement("span");

    const clearContinueButton = document.createElement("div");
    const clearContinueButtonIcon = document.createElement("i");
    const clearContinueButtonText = document.createElement("span");

    const clearLastWatched = document.createElement("div");
    const clearLastWatchedIcon = document.createElement("i");
    const clearLastWatchedText = document.createElement("span");

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

    dataLabel.className = "label";
    dataLabelIcon.className = "icon fa-solid fa-box";
    dataLabelText.className = "text";
    dataLabelText.innerText = "Data";

    dataLabel.append(dataLabelIcon);
    dataLabel.append(dataLabelText);

    resetButton.className = "button";
    resetButtonIcon.className = "icon fa-solid fa-sync";
    resetButtonText.className = "text";
    resetButtonText.innerText = "Clear Everything";

    resetButton.append(resetButtonIcon);
    resetButton.append(resetButtonText);

    resetButton.addEventListener("click", function () {
        localStorage.clear();
        location.reload(true);
    });

    clearContinueButton.className = "button secondary";
    clearContinueButtonIcon.className = "icon fa-solid fa-eye-slash";
    clearContinueButtonText.className = "text";
    clearContinueButtonText.innerText = "Clear Continue Watching";

    clearContinueButton.append(clearContinueButtonIcon);
    clearContinueButton.append(clearContinueButtonText);

    clearContinueButton.addEventListener("click", function () {
        resetContinueWatching();

        clearContinueButton.classList.add("inactive");
        clearContinueButtonIcon.className = "icon fa-solid fa-check";

        setTimeout(function () {
            clearContinueButtonIcon.className = "icon fa-solid fa-eye-slash";
            clearContinueButton.classList.remove("inactive");
        }, 2500);
    });

    clearLastWatched.className = "button secondary";
    clearLastWatchedIcon.className = "icon fa-solid fa-eye-slash";
    clearLastWatchedText.className = "text";
    clearLastWatchedText.innerText = "Clear Last Watched";

    clearLastWatched.append(clearLastWatchedIcon);
    clearLastWatched.append(clearLastWatchedText);

    clearLastWatched.addEventListener("click", function () {
        resetLastPlayed();

        clearLastWatched.classList.add("inactive");
        clearLastWatchedIcon.className = "icon fa-solid fa-check";

        setTimeout(function () {
            clearLastWatchedIcon.className = "icon fa-solid fa-eye-slash";
            clearLastWatched.classList.remove("inactive");
        }, 2500);
    });

    section.append(label);
    section.append(theme);
    section.append(dataLabel);
    section.append(resetButton);
    section.append(clearContinueButton);
    section.append(clearLastWatched);
}