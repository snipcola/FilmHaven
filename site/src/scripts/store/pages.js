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
        .filter((l) => l.text !== "Settings")
        .map((l) => ({ [l.text]: true })),
    );

    set(defaultPages);
    return defaultPages;
  }
}

export function getPage(name) {
  const pages = getPages();
  const page = Object.entries(pages).find(([key]) => key === name);

  return page ? page[1] : null;
}

export function setPage(name, value) {
  const pages = getPages();
  pages[name] = value;
  set(pages);
}
