import { config, store } from "../config.js";

function get(type) {
    const continueWatching = localStorage.getItem(store.names.continue(type));
    let json;
    
    try { json = JSON.parse(continueWatching) }
    catch { json = [] };

    return json || [];
}

function set(data, type) {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(store.names.continue(type), jsonData);
}

export function getContinueWatching(type) {
    const continueWatching = get(type);
    return continueWatching
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(function (item) {
            const date = new Date(item.date);

            return {
                ...item,
                continue: true,
                date: date
                    ? `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
                    : null
            };
        });
}

export function isInContinueWatching(id, type) {
    const continueWatching = getContinueWatching(type);
    return continueWatching.find((i) => i.id === id) !== null;
}

export function addContinueWatching(id, type, title, image) {
    const records = getContinueWatching(type);

    const existingRecord = records.findIndex((r) => r.id === id);
    const newRecord = { id, type, title, image, date: new Date().toISOString() };

    if (existingRecord !== -1) {
        records[existingRecord] = newRecord;
    } else {
        records.unshift(newRecord);
        if (records.length > config.area.amount) records.pop();
    }

    set(records, type);
}

export function removeFromContinueWatching(id, type) {
    const records = getContinueWatching(type);
    const newRecords = records.filter((r) => r.id !== id);

    set(newRecords, type);
}