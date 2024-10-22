import { store, config } from "../config.js";

function get() {
  const language = localStorage.getItem(store.names.language);
  return language;
}

function set(data) {
  localStorage.setItem(store.names.language, data);
}

export function getLanguage() {
  const language = get();

  if (language) {
    return language;
  } else {
    setLanguage(config.defaultLanguage);
    return config.defaultLanguage;
  }
}

export function setLanguage(language) {
  set(language);
}
