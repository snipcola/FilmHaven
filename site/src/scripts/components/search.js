import { config } from "../config.js";
import {
  onWindowResize,
  splitArray,
  debounce,
  removeWindowResize,
  elementExists,
  scrollToElement,
  onKeyPress,
  onSwipe,
  transparentImage,
} from "../functions.js";
import { preloadImages, getNonCachedImages, unloadImages } from "../cache.js";
import { getSearchResults } from "../api/search.js";
import { watchContent } from "./watch.js";
import { hideModal } from "./modal.js";
import { setQuery, getQuery, removeQuery, onQueryChange } from "../query.js";

function initializeSearch(area, placeholder) {
  let results = [];
  let slides = [];

  let desktop = window.innerWidth > config.area.split.max;
  let index = 0;

  let images = [];

  const label = document.createElement("div");

  const control = document.createElement("div");
  const previous = document.createElement("div");
  const previousIcon = document.createElement("i");
  const indicators = document.createElement("div");
  const next = document.createElement("div");
  const nextIcon = document.createElement("i");

  const search = document.createElement("div");
  const icon = document.createElement("i");
  const input = document.createElement("input");
  const clear = document.createElement("i");

  const notice = document.createElement("div");
  const noticeIcon = document.createElement("i");
  const noticeText = document.createElement("span");

  const cards = document.createElement("div");

  label.className = "label";
  label.innerText = "Search";

  control.className = "control inactive";
  previous.className = "button secondary icon-only previous";
  previousIcon.className = "icon icon-arrow-left";
  indicators.className = "indicators";
  next.className = "button secondary icon-only next";
  nextIcon.className = "icon icon-arrow-right";

  previous.append(previousIcon);
  next.append(nextIcon);

  control.append(previous);
  control.append(indicators);
  control.append(next);

  search.className = "search";
  icon.className = "icon icon-search";
  input.className = "input";
  input.placeholder = placeholder;
  clear.className = "clear icon-trash";

  search.append(icon);
  search.append(input);
  search.append(clear);

  search.addEventListener("click", function (e) {
    if (e.target !== clear) {
      input.focus();
    }
  });

  notice.className = "notice";
  noticeIcon.className = "icon icon-eye-slash";
  noticeText.className = "text";

  notice.append(noticeIcon);
  notice.append(noticeText);

  cards.className = "cards inactive";

  function add(info) {
    const card = document.createElement("div");
    const image = document.createElement("img");
    const loadImage = document.createElement("img");
    const title = document.createElement("div");
    const typeInfo = document.createElement("div");

    const footer = document.createElement("div");

    const date = document.createElement("div");
    const dateIcon = document.createElement("i");
    const dateText = document.createElement("span");

    const rating = document.createElement("div");
    const stars = document.createElement("div");
    const starsAmount = document.createElement("div");

    const play = document.createElement("div");
    const playIcon = document.createElement("i");

    card.className = "card";
    image.className = "image";
    image.src = info.image;
    image.alt = info.title;
    loadImage.className = "image load-image";
    loadImage.src = transparentImage();
    loadImage.alt = "";
    title.className = "title";
    typeInfo.className = "type-info";
    typeInfo.innerText = info.type?.toUpperCase();

    image.addEventListener("load", function () {
      card.classList.add("loaded");
    });

    card.addEventListener("click", function () {
      input.value = "";
      clear.classList.remove("active");

      reset();
      cleanup();

      watchContent(info.type, info.id);
    });

    title.innerText =
      info.title.length > config.area.maxTitleLength * 1.75
        ? info.title
            .substring(0, config.area.maxTitleLength * 1.75)
            .replace(/\s+\S*$/, "...")
        : info.title;

    footer.className = "footer";

    date.className = "date";
    dateIcon.className = "icon icon-clock";
    dateText.className = "text";
    dateText.innerText = info.date;

    date.append(dateIcon);
    date.append(dateText);

    rating.className = "rating";
    stars.className = "stars";
    starsAmount.className = "amount text";
    starsAmount.innerText = info.stars;

    for (var i = 0; i < 5; i++) {
      const star = document.createElement("div");
      const starIcon = document.createElement("i");

      const floored = Math.floor(info.rating);
      const decimal = info.rating - floored;

      if (i < floored) star.className = "star fill";
      else if (decimal >= 0.5 && i === floored)
        star.className = "star half-fill";
      else star.className = "star";

      starIcon.className = "icon icon-star";

      star.append(starIcon);
      stars.append(star);
    }

    rating.append(stars);
    rating.append(starsAmount);

    if (info.date) {
      footer.append(date);
    }

    if (info.rating && info.stars) {
      footer.append(rating);
    }

    play.className = "play";
    playIcon.className = "icon icon-play";

    play.append(playIcon);

    card.append(image);
    card.append(loadImage);
    card.append(title);
    card.append(typeInfo);
    card.append(footer);
    card.append(play);

    cards.append(card);
  }

  function setIndicators() {
    indicators.innerHTML = "";

    slides.forEach(function (_, i) {
      const indicator = document.createElement("div");

      indicator.className = index === i ? "indicator active" : "indicator";
      indicator.addEventListener("click", function () {
        set(i);
      });

      indicators.append(indicator);
    });
  }

  function set(newIndex) {
    index = slides[newIndex] ? newIndex : 0;
    const slide = slides[index];

    cards.innerHTML = "";
    slide.forEach(add);

    setIndicators();
  }

  function setPrevious() {
    set(slides[index - 1] ? index - 1 : slides.length - 1);
  }

  function setNext() {
    set(slides[index + 1] ? index + 1 : 0);
  }

  function checkResize() {
    if (!elementExists(area)) return removeWindowResize(checkResize);
    const newDesktop = window.innerWidth > config.area.split.max;

    if (desktop !== newDesktop) {
      desktop = newDesktop;

      if (slides && slides.length !== 0) {
        slides = splitArray(
          results,
          config.area.split[desktop ? "desktop" : "mobile"],
        );

        index =
          index === 0
            ? 0
            : desktop
              ? Math.round(
                  (index + 1) /
                    (config.area.split.desktop / config.area.split.mobile),
                ) - 1
              : Math.round(
                  (index + 1) *
                    (config.area.split.desktop / config.area.split.mobile),
                ) - 2;

        set(index);
      }
    }
  }

  function notify(toggle, label, icon) {
    notice.classList[toggle ? "add" : "remove"]("active");
    noticeText.innerText = label || "";
    noticeIcon.className = `icon icon-${icon || "eye-slash"}`;
  }

  function reset() {
    results = [];
    slides = [];
    index = 0;

    notify(false);
    control.className = "control inactive";
    cards.className = "cards inactive";

    indicators.innerHTML = "";
    cards.innerHTML = "";
  }

  function populate(newResults) {
    reset();

    if (newResults.length === 0) {
      notify(true, "No results found");
      return;
    }

    results = newResults;
    slides = splitArray(
      results,
      config.area.split[desktop ? "desktop" : "mobile"],
    );

    set(index);

    control.className = "control";
    cards.className = "cards";
  }

  function cleanup() {
    unloadImages(images, true);
    images = [];
  }

  function onFocus() {
    scrollToElement(area, -30);
  }

  function clearCheck() {
    reset();
    cleanup();

    if (input.value.length > 0) {
      clear.classList.add("active");
      notify(true, "Waiting for text completion", "keyboard");
    } else {
      clear.classList.remove("active");
    }
  }

  async function onInput() {
    const query = input.value;

    if (query.length > 0) {
      reset();
      cleanup();

      notify(true, "Fetching results", "sync");
      const searchResults = await getSearchResults(query);

      if (!searchResults) {
        notify(true, "Failed to fetch results", "warning");
      } else {
        const searchImages = getNonCachedImages(
          searchResults.map((i) => i.image),
        );
        images.push(...searchImages);

        preloadImages(searchImages, true);

        if (input.value.length === 0) {
          cleanup();
        } else {
          populate(searchResults);
        }
      }
    }
  }

  const debouncedOnInput = debounce(onInput, config.search.debounce);

  function onClear() {
    input.value = "";
    clear.classList.remove("active");

    reset();
    cleanup();
    queryCheck();
  }

  function forceSearch(query) {
    input.value = query;
    clearCheck();
    onInput();
  }

  function queryCheck() {
    const query = input.value;

    if (query.length > 0) setQuery(config.query.search, query);
    else removeQuery(config.query.search);
  }

  onWindowResize(checkResize);
  onQueryChange(queryCheck);

  previous.addEventListener("click", setPrevious);
  next.addEventListener("click", setNext);

  onSwipe(area, function (right) {
    if (right) setNext();
    else setPrevious();
  });

  const searchQuery = getQuery(config.query.search);
  if (searchQuery) forceSearch(searchQuery);

  clear.addEventListener("click", onClear);
  input.addEventListener("input", clearCheck);
  input.addEventListener("input", debouncedOnInput);
  input.addEventListener("input", queryCheck);
  input.addEventListener("focusin", onFocus);

  area.append(label);
  area.append(control);
  area.append(search);
  area.append(notice);
  area.append(cards);
}

export function initializeSearches() {
  const homeSection = document.querySelector(".section.home");

  if (!homeSection) {
    return console.error("Failed to find home section.");
  }

  const homeSearchArea = document.createElement("div");

  homeSearchArea.className = "area search";
  homeSection.append(homeSearchArea);

  initializeSearch(homeSearchArea, "Search for movies & shows...");

  const homeInput = homeSearchArea.querySelector(".input");

  if (homeInput) {
    function focus() {
      hideModal();
      setQuery(config.query.page, 1);

      setTimeout(function () {
        scrollToElement(homeSearchArea, -30);
        homeInput.focus();
      }, 100);
    }

    onKeyPress("/", true, homeInput, null, focus);
  }
}
