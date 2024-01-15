import { store } from "../config.js";

function get() {
    const adult = localStorage.getItem(store.names.adult);
    return adult;
}

function set(data) {
    localStorage.setItem(store.names.adult, data);
}

export function getAdult() {
    const adult = get();

    if (adult) {
        return adult;
    } else {
        setAdult("false");
        return "false";
    }
}

export function setAdult(adult) {
    set(adult);
}