import { store, watchSections as defaultWatchSections } from "../config.js";

function get() {
  const watchSections = localStorage.getItem(store.names.watchSections);
  return JSON.parse(watchSections);
}

function set(data) {
  localStorage.setItem(store.names.watchSections, JSON.stringify(data));
}

export function getWatchSections() {
  const watchSections = get();

  if (watchSections) {
    return watchSections;
  } else {
    set(defaultWatchSections);
    return defaultWatchSections;
  }
}

export function getWatchSection(name) {
  const watchSections = getWatchSections();
  const watchSection = Object.entries(watchSections).find(
    ([key]) => key === name,
  );

  return watchSection ? watchSection[1] : null;
}

export function setWatchSection(name, value) {
  const watchSections = getWatchSections();
  watchSections[name] = value;
  set(watchSections);
}
