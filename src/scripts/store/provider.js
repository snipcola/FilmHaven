import { store } from "../config.js";
import { getProviders } from "./providers.js";

function get() {
  const provider = localStorage.getItem(store.names.provider);
  return provider;
}

function set(data) {
  localStorage.setItem(store.names.provider, data);
}

export function getProvider() {
  const provider = get();

  if (provider && getProviders(provider)) {
    return provider;
  } else {
    const defaultProvider = getProviders()[0];
    if (defaultProvider) setProvider(0);
    return defaultProvider;
  }
}

export function getProviderIndex() {
  const index = get() || "0";

  try {
    return parseInt(index);
  } catch {
    return 0;
  }
}

export function setProvider(provider) {
  set(provider);
}
