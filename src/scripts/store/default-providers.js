import { store, useDefaultProviders as _defaultProviders } from "../config.js";

function get() {
  const defaultProviders = localStorage.getItem(store.names.defaultProviders);
  return defaultProviders;
}

function set(data) {
  localStorage.setItem(store.names.defaultProviders, data);
}

export function getDefaultProviders() {
  const defaultProviders = get();

  if (defaultProviders) {
    return defaultProviders;
  } else {
    const useDefaultProviders = Object.keys(_defaultProviders)[0];
    setDefaultProviders(useDefaultProviders);
    return useDefaultProviders;
  }
}

export function setDefaultProviders(defaultProviders) {
  set(defaultProviders);
}
