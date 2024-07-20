import { store, customProviders as _customProviders } from "../config.js";

function get() {
  const customProviders = localStorage.getItem(store.names.customProviders);
  return customProviders;
}

function set(data) {
  localStorage.setItem(store.names.customProviders, data);
}

export function getCustomProviders() {
  const customProviders = get();

  if (customProviders) {
    return customProviders;
  } else {
    const defaultCustomProviders = Object.keys(_customProviders)[0];
    setCustomProviders(defaultCustomProviders);
    return defaultCustomProviders;
  }
}

export function setCustomProviders(customProviders) {
  set(customProviders);
}
