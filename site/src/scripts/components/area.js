import { config } from "../config.js";
import {
  splitArray,
  onWindowResize,
  removeWindowResize,
  elementExists,
  onSwipe,
  transparentImage,
} from "../functions.js";
import { preloadImages } from "../cache.js";
import { getTrending } from "../api/trending.js";
import { getRated } from "../api/rated.js";
import { getNew } from "../api/new.js";
import { watchContent } from "./watch.js";
import { getPage } from "../store/pages.js";
import { getSection } from "../store/sections.js";
import { getLastPlayed } from "../store/last-played.js";

export function initializeArea(
  area,
  initialSlides,
  labelText,
  failed,
  customSplit,
) {
  area.innerHTML = "";
  const noResults = Array.isArray(initialSlides) && initialSlides.length === 0;

  let desktop = window.innerWidth > (customSplit || config.area.split).max;
  let slides;
  let index = 0;

  if (initialSlides && initialSlides.length !== 0) {
    slides = splitArray(
      initialSlides,
      (customSplit || config.area.split)[desktop ? "desktop" : "mobile"],
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

  const cards = document.createElement("div");

  label.className = "label";
  label.innerText = labelText;

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
    ? `Failed to fetch ${labelText.toLowerCase()}`
    : noResults
      ? "No results found"
      : `Fetching ${labelText.toLowerCase()}`;

  notice.append(noticeIcon);
  notice.append(noticeText);

  cards.className = "cards";

  function add(info) {
    const card = document.createElement("div");
    const image = document.createElement("img");
    const loadImage = document.createElement("img");
    const title = document.createElement("div");

    const footer = document.createElement("div");

    const date = document.createElement("div");
    const dateIcon = document.createElement("i");
    const dateText = document.createElement("span");

    const rating = document.createElement("div");
    const stars = document.createElement("div");
    const starsAmount = document.createElement("div");

    const play = document.createElement("div");
    const playIcon = document.createElement("i");

    if (info.id) card.setAttribute("data-id", info.id);
    if (info.type) card.setAttribute("data-type", info.type);

    card.className = "card";
    image.className = "image";
    image.src = info.image;
    image.alt = info.title;
    loadImage.className = "image load-image";
    loadImage.src = transparentImage();
    loadImage.alt = "";
    title.className = "title";

    image.addEventListener("load", function () {
      card.classList.add("loaded");
    });

    if (info.continue) {
      const typeInfo = document.createElement("div");

      typeInfo.className = "type-info";
      typeInfo.innerText = info.type?.toUpperCase();

      card.append(typeInfo);
    }

    if (info.type === "tv" && info.continue) {
      let lastPlayed = getLastPlayed(info.id);
      const seasonInfo = document.createElement("div");

      seasonInfo.className = "season-info";
      seasonInfo.innerText = `S${lastPlayed.s} E${lastPlayed.e}`;

      const checkInterval = setInterval(function () {
        if (!elementExists(card)) return clearInterval(checkInterval);
        const newLastPlayed = getLastPlayed(info.id);

        if (JSON.stringify(newLastPlayed) !== JSON.stringify(lastPlayed)) {
          lastPlayed = newLastPlayed;
          seasonInfo.innerText = `S${lastPlayed.s} E${lastPlayed.e}`;
        }
      }, 500);

      card.append(seasonInfo);
    }

    card.addEventListener("click", function () {
      if (!card.classList.contains("disabled")) {
        watchContent(info.type, info.id);
      }
    });

    title.innerText =
      info.title.length > config.area.maxTitleLength
        ? info.title
            .substring(0, config.area.maxTitleLength)
            .replace(/\s+\S*$/, "...")
        : info.title;

    footer.className = "footer";

    date.className = "date";
    dateIcon.className = `icon icon-${info.continue ? "eye" : "clock"}`;
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
    const newDesktop =
      window.innerWidth > (customSplit || config.area.split).max;

    if (desktop !== newDesktop) {
      desktop = newDesktop;

      if (slides && slides.length !== 0) {
        slides = splitArray(
          initialSlides,
          (customSplit || config.area.split)[desktop ? "desktop" : "mobile"],
        );

        index =
          index === 0
            ? 0
            : desktop
              ? Math.round(
                  (index + 1) /
                    ((customSplit || config.area.split).desktop /
                      (customSplit || config.area.split).mobile),
                ) - 1
              : Math.round(
                  (index + 1) *
                    ((customSplit || config.area.split).desktop /
                      (customSplit || config.area.split).mobile),
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
    area.append(cards);

    onSwipe(area, function (right) {
      if (right) setNext();
      else setPrevious();
    });
  } else {
    area.append(notice);
  }
}

export function initializeAreas() {
  const moviesActive = getPage("Movies");
  const showsActive = getPage("Shows");

  const trendingActive = getSection("Trending");
  const ratedActive = getSection("Top-Rated");
  const newActive = getSection("New");

  function initializeTrending() {
    const label = "Trending";

    async function initializeMovies() {
      const moviesSection = document.querySelector(".section.movies");

      if (!moviesSection) {
        return console.error("Failed to find movies section.");
      }

      const moviesTrendingArea = document.createElement("div");
      moviesTrendingArea.className = "area";
      moviesSection.append(moviesTrendingArea);

      initializeArea(moviesTrendingArea, null, label);
      let trendingMovies = await getTrending("movie");

      if (!trendingMovies) {
        initializeArea(moviesTrendingArea, null, label, true);
      } else {
        trendingMovies.splice(0, config.carousel.amount);
        trendingMovies.splice(config.area.amount, trendingMovies.length);

        preloadImages(
          trendingMovies.map((i) => i.image),
          true,
        );
        initializeArea(moviesTrendingArea, trendingMovies, label);
      }
    }

    async function initializeShows() {
      const showsSection = document.querySelector(".section.shows");

      if (!showsSection) {
        return console.error("Failed to find shows section.");
      }

      const showsTrendingArea = document.createElement("div");
      showsTrendingArea.className = "area";
      showsSection.append(showsTrendingArea);

      initializeArea(showsTrendingArea, null, label);
      let trendingShows = await getTrending("tv");

      if (!trendingShows) {
        initializeArea(showsTrendingArea, null, label, true);
      } else {
        trendingShows.splice(0, config.carousel.amount);
        trendingShows.splice(config.area.amount, trendingShows.length);

        preloadImages(
          trendingShows.map((i) => i.image),
          true,
        );
        initializeArea(showsTrendingArea, trendingShows, label);
      }
    }

    if (moviesActive) initializeMovies();
    if (showsActive) initializeShows();
  }

  function initializeTopRated() {
    const label = "Top-Rated";

    async function initializeMovies() {
      const moviesSection = document.querySelector(".section.movies");

      if (!moviesSection) {
        return console.error("Failed to find movies section.");
      }

      const moviesRatedArea = document.createElement("div");
      moviesRatedArea.className = "area";
      moviesSection.append(moviesRatedArea);

      initializeArea(moviesRatedArea, null, label);
      let ratedMovies = await getRated("movie");

      if (!ratedMovies) {
        initializeArea(moviesRatedArea, null, label, true);
      } else {
        ratedMovies.splice(config.area.amount, ratedMovies.length);
        preloadImages(
          ratedMovies.map((i) => i.image),
          true,
        );
        initializeArea(moviesRatedArea, ratedMovies, label);
      }
    }

    async function initializeShows() {
      const showsSection = document.querySelector(".section.shows");

      if (!showsSection) {
        return console.error("Failed to find shows section.");
      }

      const showsRatedArea = document.createElement("div");
      showsRatedArea.className = "area";
      showsSection.append(showsRatedArea);

      initializeArea(showsRatedArea, null, label);
      let ratedShows = await getRated("tv");

      if (!ratedShows) {
        initializeArea(showsRatedArea, null, label, true);
      } else {
        ratedShows.splice(config.area.amount, ratedShows.length);
        preloadImages(
          ratedShows.map((i) => i.image),
          true,
        );
        initializeArea(showsRatedArea, ratedShows, label);
      }
    }

    if (moviesActive) initializeMovies();
    if (showsActive) initializeShows();
  }

  function initializeNew() {
    const label = "New";

    async function initializeMovies() {
      const moviesSection = document.querySelector(".section.movies");

      if (!moviesSection) {
        return console.error("Failed to find movies section.");
      }

      const moviesNewArea = document.createElement("div");
      moviesNewArea.className = "area";
      moviesSection.append(moviesNewArea);

      initializeArea(moviesNewArea, null, label);
      let newMovies = await getNew("movie");

      if (!newMovies) {
        initializeArea(moviesNewArea, null, label, true);
      } else {
        newMovies.splice(config.area.amount, newMovies.length);
        preloadImages(
          newMovies.map((i) => i.image),
          true,
        );
        initializeArea(moviesNewArea, newMovies, label);
      }
    }

    async function initializeShows() {
      const showsSection = document.querySelector(".section.shows");

      if (!showsSection) {
        return console.error("Failed to find shows section.");
      }

      const showsNewArea = document.createElement("div");
      showsNewArea.className = "area";
      showsSection.append(showsNewArea);

      initializeArea(showsNewArea, null, label);
      let newShows = await getNew("tv");

      if (!newShows) {
        initializeArea(showsNewArea, null, label, true);
      } else {
        newShows.splice(config.area.amount, newShows.length);
        preloadImages(
          newShows.map((i) => i.image),
          true,
        );
        initializeArea(showsNewArea, newShows, label);
      }
    }

    if (moviesActive) initializeMovies();
    if (showsActive) initializeShows();
  }

  if (trendingActive) initializeTrending();
  if (ratedActive) initializeTopRated();
  if (newActive) initializeNew();
}
