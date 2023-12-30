import { getTheme } from "../store/theme.js";

export function checkTheme() {
    const theme = getTheme();

    switch (theme) {
        case "auto":
            document.documentElement.className = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light";
            break;
        case "dark":
            document.documentElement.className = "dark";
            break;
        case "light":
            document.documentElement.className = "light";
            break;
    }
}

export function initializeTheme() {
    checkTheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', checkTheme);
}