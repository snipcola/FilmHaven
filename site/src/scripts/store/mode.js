import { store, defaultMode, proxies } from "../config.js";

function get() {
  const mode = localStorage.getItem(store.names.mode);
  return mode;
}

function set(data) {
  localStorage.setItem(store.names.mode, data);
}

export function getMode() {
  const mode = get();

  if (mode) {
    return mode;
  } else {
    setMode(defaultMode);
    return defaultMode;
  }
}

export function checkMode() {
  const mode = get();
  if (mode === "proxy" && proxies.length === 0) setMode("local");
}

export function setMode(mode) {
  if (mode === "proxy" && proxies.length === 0) return;
  set(mode);
}
