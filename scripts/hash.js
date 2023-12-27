export function setHash(key, value) {
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
    setHash(key, null);
}

export function getHash(key) {
    if (key === null || key === undefined) {
        return null;
    }

    const hash = window.location.hash.substring(1);
    const pairs = hash ? hash.split(",") : [];
    const value = pairs.find((p) => p.split("=")[0] === key)?.split("=")[1];

    return value ? decodeURIComponent(value) : null;
}

export function onHashChange(callback) {
    window.addEventListener("hashchange", callback);
}