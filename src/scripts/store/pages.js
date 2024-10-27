import { store, config } from "../config.js";

function get() {
  const pages = localStorage.getItem(store.names.pages);
  return JSON.parse(pages);
}

function set(data) {
  localStorage.setItem(store.names.pages, JSON.stringify(data));
}

export function getPages() {
  const pages = get();

  if (pages) {
    return pages;
  } else {
    const defaultPages = Object.assign(
      {},
      ...config.header.links
        .filter((l) => !l.required)
        .map((l) => ({
          [l.text]: { enabled: true, hidden: l.hidden || false },
        })),
    );

    set(defaultPages);
    return defaultPages;
  }
}

export function getPage(name) {
  name = (name || "").toLowerCase();

  const pages = getPages();
  const page = Object.entries(pages).find(
    ([key]) => key?.toLowerCase() === name,
  );

  return page ? page[1]?.enabled : null;
}

export function setPage(name, value) {
  const pages = getPages();
  pages[name].enabled = value;
  set(pages);
}

export function getPageIndex(name) {
  name = (name || "").toLowerCase();
  const index = config.header.links
    .filter((l) => l.text === "Settings" || getPage(l.text))
    .findIndex((l) => l.text?.toLowerCase() === name);

  if (![undefined, null].includes(index)) return index + 1;
}
