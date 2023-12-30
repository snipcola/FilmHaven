import { store } from "../config.js";
import { checkTheme } from "../components/theme.js";

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
        setTheme("auto");
        return "auto";
    }
}

export function setTheme(theme) {
    set(theme);
    checkTheme();
}