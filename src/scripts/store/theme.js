import { store, themes } from "../config.js";
import { initializeTheme } from "../components/theme.js";

function get() {
    const theme = localStorage.getItem(store.names.theme);
    return theme;
}

function set(data) {
    localStorage.setItem(store.names.theme, data);
}

export function getTheme() {
    const theme = get();

    if (theme) {
        return theme;
    } else {
        const defaultTheme = Object.keys(themes)[0];
        setTheme(defaultTheme);
        return defaultTheme;
    }
}

export function getThemeAbsolute() {
    const theme = getTheme();

    if (theme === "auto") {
        return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
            ? "dark"
            : "light";
    } else {
        return theme;
    }
}

export function setTheme(theme) {
    set(theme);
    initializeTheme();
}