import { config } from "../config.js";
import { isHovered, onSwipe } from "../functions.js";
import { cacheLoadImage, cacheImages } from "../cache.js";
import { getTrending } from "../api/trending.js";
import { watchContent } from "./watch.js";
import { getPage } from "../store/pages.js";
import { getSectionName } from "./header.js";

function initializeCarousel(carousel, slides, type) {
  carousel.innerHTML = "";

  let index = 0;

  const image = document.createElement("img");
  const vignette = document.createElement("div");

  const details = document.createElement("div");
  const title = document.createElement("h2");
  const description = document.createElement("p");
  const buttons = document.createElement("div");
  const button = document.createElement("div");
  const buttonIcon = document.createElement("i");
  const buttonText = document.createElement("span");

  const control = document.createElement("div");
  const previous = document.createElement("div");
  const previousIcon = document.createElement("i");
  const indicators = document.createElement("div");
  const next = document.createElement("div");
  const nextIcon = document.createElement("i");

  image.className = "image";
  vignette.className = "vignette";

  details.className = "details";
  title.className = "title";
  description.className = "description";

  buttons.className = "buttons";
  button.className = "button";
  buttonIcon.className = "icon icon-play";
  buttonText.className = "text";
  buttonText.innerText = "Watch Content";

  button.append(buttonIcon);
  button.append(buttonText);
  buttons.append(button);

  details.append(title);
  details.append(description);
  details.append(buttons);

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

    button.onclick = function () {
      watchContent(slide.type, slide.id, true);
    };

    cacheLoadImage(image, slide.backdrop);
    image.alt = slide.title;
    title.innerText = slide.title;
    description.innerText = slide.description;

    setIndicators();
  }

  function setPrevious() {
    const newIndex = slides[index - 1] ? index - 1 : slides.length - 1;
    if (index !== newIndex) set(newIndex);
  }

  function setNext() {
    const newIndex = slides[index + 1] ? index + 1 : 0;
    if (index !== newIndex) set(newIndex);
  }

  function iterate() {
    const isMobile =
      navigator.maxTouchPoints || "ontouchstart" in document.documentElement;
    const activeSection =
      getSectionName().toLowerCase() === "movies" ? "movie" : "tv";

    if (
      !isMobile &&
      type === activeSection &&
      !isHovered(carousel) &&
      !document.body.classList.contains("modal-active")
    ) {
      setNext();
    }
  }

  if (slides) {
    set(index);
    setInterval(iterate, config.carousel.switchSlideInterval);

    previous.addEventListener("click", setPrevious);
    next.addEventListener("click", setNext);
  }

  carousel.append(image);
  carousel.append(vignette);

  if (slides) {
    carousel.append(details);
    carousel.append(control);

    onSwipe(carousel, function (right) {
      if (right) setNext();
      else setPrevious();
    });
  }
}

export function initializeCarousels() {
  async function initializeMovies() {
    const moviesSection = document.querySelector(".section.movies");

    if (!moviesSection) {
      return console.error("Failed to find movie section.");
    }

    const moviesCard = document.createElement("div");
    moviesCard.className = "carousel";
    moviesSection.append(moviesCard);

    initializeCarousel(moviesCard, null);
    let movies = await getTrending("movie");

    if (movies) {
      movies.splice(config.carousel.amount, movies.length);
      cacheImages(movies.map((i) => i.backdrop));
      initializeCarousel(moviesCard, movies, "movie");
    }
  }

  async function initializeShows() {
    const showsSection = document.querySelector(".section.shows");

    if (!showsSection) {
      return console.error("Failed to find show section.");
    }

    const showsCard = document.createElement("div");
    showsCard.className = "carousel";
    showsSection.append(showsCard);

    initializeCarousel(showsCard, null);
    let shows = await getTrending("tv");

    if (shows) {
      shows.splice(config.carousel.amount, shows.length);
      cacheImages(shows.map((i) => i.backdrop));
      initializeCarousel(showsCard, shows, "tv");
    }
  }

  if (getPage("movies")) initializeMovies();
  if (getPage("shows")) initializeShows();
}
