import { store } from "../config.js";

function get() {
  const query = localStorage.getItem(store.names.query);
  return query;
}

function set(data) {
  localStorage.setItem(store.names.query, data);
}

export function getQueryStore() {
  const query = get();
  return query || null;
}

export function setQueryStore(query) {
  set(query);
}
