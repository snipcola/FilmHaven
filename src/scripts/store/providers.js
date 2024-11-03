import { store } from "../config.js";
import { defaultProviders } from "../config.js";
import { getDefaultProviders } from "./default-providers.js";

function get() {
  const providers = localStorage.getItem(store.names.providers);
  return JSON.parse(providers);
}

function set(data) {
  localStorage.setItem(store.names.providers, JSON.stringify(data));
}

export function getProviders() {
  let providers = get();
  if (!providers) set([]);

  providers = [
    ...(getDefaultProviders() === "include"
      ? defaultProviders.map((p) => ({ ...p, default: true }))
      : []),
    ...(providers || []),
  ];

  return providers;
}

export function setProviders(providers) {
  set(providers);
}
