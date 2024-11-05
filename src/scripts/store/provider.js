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
  const providerId = get();
  const providers = getProviders();

  if (providerId && providers.find(({ id }) => id === providerId)) {
    return providerId;
  } else {
    const defaultProviderId = getProviders()[0]?.id;
    if (defaultProviderId) setProvider(defaultProviderId);
    return defaultProviderId;
  }
}

export function setProvider(providerId) {
  if (providerId) set(providerId);
}

export function resetProvider() {
  set("");
  getProvider();
}
