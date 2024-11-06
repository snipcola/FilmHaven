import { store, api } from "../config.js";

function get() {
  const tmdbKey = localStorage.getItem(store.names.tmdbKey);
  return tmdbKey;
}

function set(data) {
  localStorage.setItem(store.names.tmdbKey, data);
}

export function getTMDBKey(onlyLocalStorage) {
  return get() || (!onlyLocalStorage ? api.defaultKey : undefined);
}

export function setTMDBKey(tmdbKey) {
  if (tmdbKey) set(tmdbKey);
}

export function resetTMDBKey() {
  localStorage.removeItem(store.names.tmdbKey);
}
