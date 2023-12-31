import { setQuery, removeQuery, getQuery, onQueryChange } from "./query.js";

export function setHash(key, value) {
    if (window.FH_USE_QUERY) {
        return setQuery(key, value);
    }

    if (key === null || key === undefined) {
        return;
    }

    const hash = window.location.hash.substring(1);
    const pairs = hash ? hash.split(",") : [];
    const exists = pairs.findIndex((p) => p.split("=")[0] === key);
    const record = `${key}=${encodeURIComponent(value)}`;

    if (exists !== -1) {
        if (value !== null && value !== undefined) {
            pairs[exists] = record;
        } else {
            pairs.splice(exists, 1);
        }
    } else {
        if (value !== null && value !== undefined) {
            pairs.push(record);
        }
    }
    
    window.location.hash = pairs.join(",");
}

export function removeHash(key) {
    if (window.FH_USE_QUERY) {
        return removeQuery(key);
    }

    setHash(key, null);
}

export function getHash(key) {
    if (window.FH_USE_QUERY) {
        return getQuery(key);
    }

    if (key === null || key === undefined) {
        return null;
    }

    const hash = window.location.hash.substring(1);
    const pairs = hash ? hash.split(",") : [];
    const value = pairs.find((p) => p.split("=")[0] === key)?.split("=")[1];

    return value ? decodeURIComponent(value) : null;
}

export function onHashChange(callback) {
    if (window.FH_USE_QUERY) {
        return onQueryChange(callback);
    }

    window.addEventListener("hashchange", callback);
}