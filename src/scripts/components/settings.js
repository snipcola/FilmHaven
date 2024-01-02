import { getTheme, setTheme } from "../store/theme.js";
import { providers, themes } from "../config.js";
import { getProvider, setProvider } from "../store/provider.js";
import { getSections, getSection, setSection } from "../store/sections.js";
import { resetContinueWatching } from "../store/continue.js";
import { resetLastPlayed } from "../store/last-played.js";

export function initializeSettings() {
    const section = document.querySelector(".section.settings");

    if (!section) {
        return console.error("Failed to find section.");
    }

    const themeLabel = document.createElement("div");
    const themeLabelIcon = document.createElement("i");
    const themeLabelText = document.createElement("span");
    const themesElem = document.createElement("div");

    const providerLabel = document.createElement("div");
    const providerLabelIcon = document.createElement("i");
    const providerLabelText = document.createElement("span");
    const providersElem = document.createElement("div");

    const sectionsLabel = document.createElement("div");
    const sectionsLabelIcon = document.createElement("i");
    const sectionsLabelText = document.createElement("span");
    const sectionsElem = document.createElement("div");

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

    themeLabel.className = "label";
    themeLabelIcon.className = "icon icon-paint-brush";
    themeLabelText.className = "text";
    themeLabelText.innerText = "Theme";
    themesElem.className = "selection";

    themeLabel.append(themeLabelIcon);
    themeLabel.append(themeLabelText);

    function themeCheck() {
        const activeTheme = getTheme();
        
        Array.from(themesElem.children).forEach(function (theme) {
            theme.classList[activeTheme === theme.innerText.toLowerCase() ? "add" : "remove"]("active");
        });
    }

    Object.values(themes).forEach(function (themeName) {
        const theme = document.createElement("div");

        theme.innerText = themeName;
        theme.addEventListener("click", function () {
            setTheme(themeName.toLowerCase());
            themeCheck();
        });

        themesElem.append(theme);
    });

    themeCheck();

    providerLabel.className = "label";
    providerLabelIcon.className = "icon icon-tv";
    providerLabelText.className = "text";
    providerLabelText.innerText = "Providers";
    providersElem.className = "selection";

    providerLabel.append(providerLabelIcon);
    providerLabel.append(providerLabelText);

    function providerCheck() {
        const activeProvider = getProvider();
        
        Array.from(providersElem.children).forEach(function (provider) {
            provider.classList[activeProvider === provider.innerText.toLowerCase() ? "add" : "remove"]("active");
        });
    }

    Object.values(providers).forEach(function (providerObj) {
        const provider = document.createElement("div");

        provider.innerText = providerObj.name;
        provider.addEventListener("click", function () {
            setProvider(providerObj.name.toLowerCase());
            providerCheck();
        });

        providersElem.append(provider);
    });

    providerCheck();

    sectionsLabel.className = "label";
    sectionsLabelIcon.className = "icon icon-tags";
    sectionsLabelText.className = "text";
    sectionsLabelText.innerText = "Sections (requires refresh)";
    sectionsElem.className = "selection multi";

    sectionsLabel.append(sectionsLabelIcon);
    sectionsLabel.append(sectionsLabelText);

    function sectionsCheck() {
        Array.from(sectionsElem.children).forEach(function (section) {
            section.classList[getSection(section.innerText) ? "add" : "remove"]("active");
        });
    }

    Object.keys(getSections()).forEach(function (sectionName) {
        const section = document.createElement("div");

        section.innerText = sectionName;
        section.addEventListener("click", function () {
            setSection(sectionName, !getSection(sectionName));
            sectionsCheck();
        });

        sectionsElem.append(section);
    });

    sectionsCheck();

    dataLabel.className = "label";
    dataLabelIcon.className = "icon icon-box";
    dataLabelText.className = "text";
    dataLabelText.innerText = "Data";

    dataLabel.append(dataLabelIcon);
    dataLabel.append(dataLabelText);

    resetButton.className = "button";
    resetButtonIcon.className = "icon icon-sync";
    resetButtonText.className = "text";
    resetButtonText.innerText = "Clear Everything";

    resetButton.append(resetButtonIcon);
    resetButton.append(resetButtonText);

    resetButton.addEventListener("click", function () {
        localStorage.clear();
        location.reload(true);

        resetButton.classList.add("inactive");
        resetButtonIcon.className = "icon icon-check";
    });

    clearContinueButton.className = "button secondary";
    clearContinueButtonIcon.className = "icon icon-eye-slash";
    clearContinueButtonText.className = "text";
    clearContinueButtonText.innerText = "Clear Continue Watching";

    clearContinueButton.append(clearContinueButtonIcon);
    clearContinueButton.append(clearContinueButtonText);

    clearContinueButton.addEventListener("click", function () {
        resetContinueWatching();

        clearContinueButton.classList.add("inactive");
        clearContinueButtonIcon.className = "icon icon-check";

        setTimeout(function () {
            clearContinueButtonIcon.className = "icon icon-eye-slash";
            clearContinueButton.classList.remove("inactive");
        }, 2500);
    });

    clearLastWatched.className = "button secondary";
    clearLastWatchedIcon.className = "icon icon-eye-slash";
    clearLastWatchedText.className = "text";
    clearLastWatchedText.innerText = "Clear Last Watched";

    clearLastWatched.append(clearLastWatchedIcon);
    clearLastWatched.append(clearLastWatchedText);

    clearLastWatched.addEventListener("click", function () {
        resetLastPlayed();

        clearLastWatched.classList.add("inactive");
        clearLastWatchedIcon.className = "icon icon-check";

        setTimeout(function () {
            clearLastWatchedIcon.className = "icon icon-eye-slash";
            clearLastWatched.classList.remove("inactive");
        }, 2500);
    });

    section.append(themeLabel);
    section.append(themesElem);
    section.append(providerLabel);
    section.append(providersElem);
    section.append(sectionsLabel);
    section.append(sectionsElem);
    section.append(dataLabel);
    section.append(resetButton);
    section.append(clearContinueButton);
    section.append(clearLastWatched);
}