const key = "fh-last-played";

function get() {
    const lastPlayed = localStorage.getItem(key);
    let json;
    
    try { json = JSON.parse(lastPlayed) }
    catch { json = [] };

    return json || [];
}

function set(data) {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
}

export function getLastPlayed(id) {
    const lastPlayed = get();
    const record = lastPlayed.find((i) => i.id === id);

    if (record) {
        return record;
    } else {
        setLastPlayed(id, 0, 0);
        return { s: 0, e: 0 };
    }
}

export function setLastPlayed(id, season, episode) {
    const lastPlayed = get();
    const index = lastPlayed.findIndex((i) => i.id === id);

    if (index !== -1) lastPlayed[index] = { id, s: season, e: episode };
    else lastPlayed.push({ id, s: season, e: episode });

    set(lastPlayed);
}