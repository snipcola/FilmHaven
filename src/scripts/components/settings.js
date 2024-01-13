import { getTheme, setTheme } from "../store/theme.js";
import { themes } from "../config.js";
import { getSections, getSection, setSection } from "../store/sections.js";
import { getWatchSections, getWatchSection, setWatchSection } from "../store/watch-sections.js";
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

    const presetsLabel = document.createElement("div");
    const presetsLabelIcon = document.createElement("i");
    const presetsLabelText = document.createElement("span");
    const presetsElem = document.createElement("div");

    const sectionsLabel = document.createElement("div");
    const sectionsLabelIcon = document.createElement("i");
    const sectionsLabelText = document.createElement("span");
    const sectionsElem = document.createElement("div");

    const watchSectionsLabel = document.createElement("div");
    const watchSectionsLabelIcon = document.createElement("i");
    const watchSectionsLabelText = document.createElement("span");
    const watchSectionsElem = document.createElement("div");

    const dataLabel = document.createElement("div");
    const dataLabelIcon = document.createElement("i");
    const dataLabelText = document.createElement("span");
    const dataButtons = document.createElement("div");

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

    presetsLabel.className = "label";
    presetsLabelIcon.className = "icon icon-list";
    presetsLabelText.className = "text";
    presetsLabelText.innerText = "Presets";
    presetsElem.className = "selection";

    presetsLabel.append(presetsLabelIcon);
    presetsLabel.append(presetsLabelText);

    ["Full", "Minimal"].forEach(function (presetName) {
        const preset = document.createElement("div");

        preset.innerText = presetName;
        preset.addEventListener("click", function () {
            if (presetName === "Full") {                
                Object.keys(getSections()).forEach(function (sectionName) {
                    setSection(sectionName, true);
                });

                Object.keys(getWatchSections()).forEach(function (watchSectionName) {
                    setWatchSection(watchSectionName, true);
                });
            } else if (presetName === "Minimal") {
                Object.keys(getSections()).forEach(function (sectionName) {
                    setSection(sectionName, ["Search", "Continue"].includes(sectionName) ? true : false);
                });

                Object.keys(getWatchSections()).forEach(function (watchSectionName) {
                    setWatchSection(watchSectionName, ["Video", "Providers", "Seasons"].includes(watchSectionName) ? true : false);
                });
            }

            sectionsCheck();
            watchSectionsCheck();

            window.location.reload();
        });

        presetsElem.append(preset);
    });

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

    watchSectionsLabel.className = "label";
    watchSectionsLabelIcon.className = "icon icon-play";
    watchSectionsLabelText.className = "text";
    watchSectionsLabelText.innerText = "Watch Sections (requires refresh)";
    watchSectionsElem.className = "selection multi";

    watchSectionsLabel.append(watchSectionsLabelIcon);
    watchSectionsLabel.append(watchSectionsLabelText);

    function watchSectionsCheck() {
        Array.from(watchSectionsElem.children).forEach(function (watchSection) {
            watchSection.classList[getWatchSection(watchSection.innerText) ? "add" : "remove"]("active");
        });
    }

    Object.keys(getWatchSections()).forEach(function (watchSectionName) {
        const watchSection = document.createElement("div");

        watchSection.innerText = watchSectionName;
        watchSection.addEventListener("click", function () {
            setWatchSection(watchSectionName, !getWatchSection(watchSectionName));
            watchSectionsCheck();
        });

        watchSectionsElem.append(watchSection);
    });

    watchSectionsCheck();

    dataLabel.className = "label";
    dataLabelIcon.className = "icon icon-box";
    dataLabelText.className = "text";
    dataLabelText.innerText = "Data";
    dataButtons.className = "buttons";

    dataLabel.append(dataLabelIcon);
    dataLabel.append(dataLabelText);

    resetButton.className = "button";
    resetButtonIcon.className = "icon icon-sync";
    resetButtonText.className = "text";
    resetButtonText.innerText = "Clear Everything";

    resetButton.append(resetButtonIcon);
    resetButton.append(resetButtonText);
    dataButtons.append(resetButton);

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
    dataButtons.append(clearContinueButton);

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
    dataButtons.append(clearLastWatched);

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
    section.append(presetsLabel);
    section.append(presetsElem);
    section.append(sectionsLabel);
    section.append(sectionsElem);
    section.append(watchSectionsLabel);
    section.append(watchSectionsElem);
    section.append(dataLabel);
    section.append(dataButtons);
}