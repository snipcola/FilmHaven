import { store } from "../config.js";
import { providers } from "../../../../api/src/config.js";

function get() {
  const provider = localStorage.getItem(store.names.provider);
  return provider;
}

function set(data) {
  localStorage.setItem(store.names.provider, data);
}

export function getProvider() {
  const provider = get();

  if (provider) {
    return provider;
  } else {
    const defaultProvider = providers[0].base;
    setProvider(defaultProvider);
    return defaultProvider;
  }
}

export function setProvider(provider) {
  set(provider);
}
