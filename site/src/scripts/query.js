export function setQueries(queries) {
  const params = new URLSearchParams(window.location.search);

  for (const [key, value] of Object.entries(queries)) {
    if (key === null || key === undefined) {
      continue;
    }

    if (value !== null && value !== undefined) {
      params.set(key, encodeURIComponent(value));
    } else {
      params.delete(key);
    }
  }

  const currentPath = `${window.location.pathname}${window.location.search}`;
  const newPath = `${window.location.pathname}?${params.toString()}`;

  if (currentPath !== newPath) {
    window.history.pushState({}, "", newPath);
  }
}

export function removeQueries(...keys) {
  setQueries(
    keys.reduce((obj, k) => {
      if (![undefined, null].includes(k)) obj[k] = null;
      return obj;
    }, {}),
  );
}

export function getQuery(key) {
  const params = new URLSearchParams(window.location.search);
  const value = params.get(key);

  return value ? decodeURIComponent(value) : null;
}

const callbacks = [];

export function onQueryChange(callback) {
  callbacks.push(callback);
}

let query = window.location.search;

function checkChange() {
  const newQuery = window.location.search;

  if (query !== newQuery) {
    query = newQuery;

    for (const callback of callbacks) {
      callback();
    }
  }
}

setInterval(checkChange, 50);
