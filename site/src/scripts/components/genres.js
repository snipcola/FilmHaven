import { config } from "../config.js";
import {
  splitArray,
  onWindowResize,
  removeWindowResize,
  elementExists,
  onSwipe,
} from "../functions.js";
import { getGenres } from "../api/genres.js";
import { hideModal, setModal, showModal } from "./modal.js";
import { initializeArea } from "./area.js";
import { preloadImages, getNonCachedImages, unloadImages } from "../cache.js";
import { getTrending } from "../api/trending.js";
import { getRated } from "../api/rated.js";
import { getNew } from "../api/new.js";
import { getQuery, onQueryChange, setQuery, removeQuery } from "../query.js";
import { getPage } from "../store/pages.js";
import { toggleDim } from "./dim.js";

async function modal(info, type) {
  const popularArea = document.createElement("div");
  const ratedArea = document.createElement("div");
  const newArea = document.createElement("div");

  popularArea.className = "area";
  ratedArea.className = "area";
  newArea.className = "area";

  const images = [];

  function cleanup() {
    unloadImages(images, true);
  }

  setModal(info.name, null, [popularArea, ratedArea, newArea], "arrow-left");
  showModal(cleanup);

  async function initializePopular() {
    const label = "Popular";

    initializeArea(popularArea, null, label);
    let popularContent = await getTrending(type, info.id);

    if (!popularContent) {
      initializeArea(popularArea, null, label, true);
    } else {
      popularContent.splice(config.area.amount, popularContent.length);
      const popularContentImages = getNonCachedImages(
        popularContent.map((i) => i.image),
      );
      images.push(...popularContentImages);

      preloadImages(popularContentImages, true);
      initializeArea(popularArea, popularContent, label);
    }
  }

  async function initializeTopRated() {
    const label = "Top-Rated";

    initializeArea(ratedArea, null, label);
    let ratedContent = await getRated(type, info.id);

    if (!ratedContent) {
      initializeArea(ratedArea, null, label, true);
    } else {
      ratedContent.splice(config.area.amount, ratedContent.length);
      const ratedContentImages = getNonCachedImages(
        ratedContent.map((i) => i.image),
      );
      images.push(...ratedContentImages);

      preloadImages(ratedContentImages, true);
      initializeArea(ratedArea, ratedContent, label);
    }
  }

  async function initializeNew() {
    const label = "New";

    initializeArea(newArea, null, label);
    let newContent = await getNew(type, info.id);

    if (!newContent) {
      initializeArea(newArea, null, label, true);
    } else {
      newContent.splice(config.area.amount, newContent.length);
      const newContentImages = getNonCachedImages(
        newContent.map((i) => i.image),
      );
      images.push(...newContentImages);

      preloadImages(newContentImages, true);
      initializeArea(newArea, newContent, label);
    }
  }

  initializePopular();
  initializeTopRated();
  initializeNew();
}

function initializeGenreArea(area, initialSlides, type, failed) {
  area.innerHTML = "";
  const noResults = Array.isArray(initialSlides) && initialSlides.length === 0;

  let desktop = window.innerWidth > config.genre.split.max;
  let slides;
  let index = 0;

  if (initialSlides && initialSlides.length !== 0) {
    slides = splitArray(
      initialSlides,
      config.genre.split[desktop ? "desktop" : "mobile"],
    );
  }

  const label = document.createElement("div");

  const control = document.createElement("div");
  const previous = document.createElement("div");
  const previousIcon = document.createElement("i");
  const indicators = document.createElement("div");
  const next = document.createElement("div");
  const nextIcon = document.createElement("i");

  const notice = document.createElement("div");
  const noticeIcon = document.createElement("i");
  const noticeText = document.createElement("span");

  const genres = document.createElement("div");

  label.className = "label";
  label.innerText = "Genres";

  control.className = "control";
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

  notice.className = "notice";
  noticeIcon.className = `icon icon-${failed ? "warning" : noResults ? "eye-slash" : "sync"}`;
  noticeText.className = "text";
  noticeText.innerText = failed
    ? "Failed to fetch genres"
    : noResults
      ? "No results found"
      : "Fetching genres";

  notice.append(noticeIcon);
  notice.append(noticeText);

  genres.className = "genres";

  function add(info) {
    const genre = document.createElement("div");
    const genreText = document.createElement("span");
    const genreIcon = document.createElement("i");

    genre.className = "genre";
    genreText.className = "text";
    genreText.innerText = info.name;
    genreIcon.className = "icon icon-arrow-right";

    genre.addEventListener("click", function () {
      setQuery(
        config.query.modal,
        `g-${type === "movie" ? "m" : "s"}-${info.id}`,
      );
    });

    genre.append(genreText);
    genre.append(genreIcon);

    genres.append(genre);
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

    genres.innerHTML = "";
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
    const newDesktop = window.innerWidth > config.genre.split.max;

    if (desktop !== newDesktop) {
      desktop = newDesktop;

      if (slides && slides.length !== 0) {
        slides = splitArray(
          initialSlides,
          config.genre.split[desktop ? "desktop" : "mobile"],
        );

        index =
          index === 0
            ? 0
            : desktop
              ? Math.round(
                  (index + 1) /
                    (config.genre.split.desktop / config.genre.split.mobile),
                ) - 1
              : Math.round(
                  (index + 1) *
                    (config.genre.split.desktop / config.genre.split.mobile),
                ) - 2;

        set(index);
      }
    }
  }

  if (slides) {
    onWindowResize(checkResize);
    set(index);

    previous.addEventListener("click", setPrevious);
    next.addEventListener("click", setNext);
  }

  area.append(label);

  if (slides) {
    area.append(control);
    area.append(genres);

    onSwipe(area, function (right) {
      if (right) setNext();
      else setPrevious();
    });
  } else {
    area.append(notice);
  }
}

let movieGenres;
let showGenres;

function initializeGenreModalCheck() {
  function handleQueryChange() {
    const modalQuery = getQuery(config.query.modal);

    if (modalQuery) {
      const [modalType, type, id] = modalQuery.split("-");

      if (modalType === "g") {
        hideModal(true);
        toggleDim(true);

        const info =
          type === "m"
            ? (movieGenres || []).find((g) => g.id?.toString() === id)
            : (showGenres || []).find((g) => g.id?.toString() === id);

        if (info) {
          modal(info, type === "m" ? "movie" : "tv");
          document.title = `${type === "m" ? "Movies" : "Shows"} - ${info.name}`;
        } else {
          removeQuery(config.query.modal);
        }

        toggleDim(false);
      }
    }
  }

  handleQueryChange();
  onQueryChange(handleQueryChange);
}

export async function initializeGenres() {
  async function initializeMovies() {
    const type = "movie";
    const moviesSection = document.querySelector(".section.movies");

    if (!moviesSection) {
      return console.error("Failed to find movies section.");
    }

    const moviesGenresArea = document.createElement("div");
    moviesGenresArea.className = "area genres";
    moviesSection.append(moviesGenresArea);

    initializeGenreArea(moviesGenresArea, null, type);
    movieGenres = await getGenres("movie");

    if (!movieGenres) {
      initializeGenreArea(moviesGenresArea, null, type, true);
    } else {
      initializeGenreArea(moviesGenresArea, movieGenres, type);
    }
  }

  async function initializeShows() {
    const type = "tv";
    const showsSection = document.querySelector(".section.shows");

    if (!showsSection) {
      return console.error("Failed to find shows section.");
    }

    const showsGenresArea = document.createElement("div");
    showsGenresArea.className = "area genres";
    showsSection.append(showsGenresArea);

    initializeGenreArea(showsGenresArea, null, type);
    showGenres = await getGenres("tv");

    if (!showGenres) {
      initializeGenreArea(showsGenresArea, null, type, true);
    } else {
      initializeGenreArea(showsGenresArea, showGenres, type);
    }
  }

  const promises = [];

  if (getPage("Movies")) promises.push(initializeMovies());
  if (getPage("Shows")) promises.push(initializeShows());

  await Promise.all(promises);
  initializeGenreModalCheck();
}
