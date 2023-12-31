export function setQuery(key, value) {
    if (key === null || key === undefined) {
        return;
    }

    const params = new URLSearchParams(window.location.search);

    if (value !== null && value !== undefined) {
        params.set(key, encodeURIComponent(value));
    } else {
        params.delete(key);
    }

    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
}

export function removeQuery(key) {
    setQuery(key, null);
}

export function getQuery(key) {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(key);

    return value ? decodeURIComponent(value) : null;
}

const callbacks = [];

export function onQueryChange(callback) {
    callbacks.push(callback);
}

let query = window.location.search;

function checkChange() {
    const newQuery = window.location.search;

    if (query !== newQuery) {
        query = newQuery;
        
        for (const callback of callbacks) {
            callback();
        }
    }
}

if (window.FH_USE_QUERY) {
    setInterval(checkChange, 100);
}