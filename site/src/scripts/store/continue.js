import { config, store } from "../config.js";
import { isDeletable, unloadImages } from "../cache.js";

function get() {
  const continueWatching = localStorage.getItem(store.names.continue);
  let json;

  try {
    json = JSON.parse(continueWatching);
  } catch {
    json = [];
  }

  return json || [];
}

function set(data) {
  const jsonData = JSON.stringify(data);
  localStorage.setItem(store.names.continue, jsonData);
}

function cleanup(record) {
  if (isDeletable(record?.image)) unloadImages([record.image]);
}

export function getContinueWatching() {
  const continueWatching = get();
  return continueWatching
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(function (item) {
      const date = new Date(item.date);

      return {
        ...item,
        continue: true,
        date: date
          ? `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
          : null,
      };
    });
}

export function isInContinueWatching(id, type) {
  const continueWatching = getContinueWatching();
  return continueWatching.find((i) => i.id === id && i.type === type) !== null;
}

export function addContinueWatching(id, type, title, image) {
  const records = getContinueWatching();

  const existingRecord = records.findIndex((r) => r.id === id);
  const newRecord = { id, type, title, image, date: new Date().toISOString() };

  if (existingRecord !== -1) {
    records[existingRecord] = newRecord;
  } else {
    records.unshift(newRecord);

    if (records.length > config.area.amount) {
      const record = records.pop();
      cleanup(record);
    }
  }

  set(records);
}

export function removeFromContinueWatching(id, type) {
  const records = getContinueWatching();
  const newRecords = records.filter((r) => !(r.id === id && r.type === type));

  const record = records.find((r) => r.id === id && r.type === type);
  cleanup(record);

  set(newRecords);
}

export function resetContinueWatching() {
  for (const record of getContinueWatching()) {
    cleanup(record);
  }

  localStorage.removeItem(store.names.continue);
}
