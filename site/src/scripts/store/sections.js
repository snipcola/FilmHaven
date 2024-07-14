import { store, sections as defaultSections } from "../config.js";

function get() {
  const sections = localStorage.getItem(store.names.sections);
  return JSON.parse(sections);
}

function set(data) {
  localStorage.setItem(store.names.sections, JSON.stringify(data));
}

export function getSections() {
  const sections = get();

  if (sections) {
    return sections;
  } else {
    set(defaultSections);
    return defaultSections;
  }
}

export function getSection(name) {
  const sections = getSections();
  const section = Object.entries(sections).find(([key]) => key === name);

  return section ? section[1] : null;
}

export function setSection(name, value) {
  const sections = getSections();
  sections[name] = value;
  set(sections);
}
