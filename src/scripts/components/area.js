import { config } from "../config.js";
import { splitArray, onWindowResize, removeWindowResize, elementExists } from "../functions.js";
import { preloadImages } from "../cache.js";
import { getTrending } from "../tmdb/trending.js";
import { getRated } from "../tmdb/rated.js";
import { getNew } from "../tmdb/new.js";
import { watchContent } from "./watch.js";
import { getContinueWatching } from "../store/continue.js";
import { getSection } from "../store/sections.js";
import { getLastPlayed } from "../store/last-played.js";

export function initializeArea(area, initialSlides, labelText, failed, customSplit) {
    area.innerHTML = "";
    const noResults = Array.isArray(initialSlides) && initialSlides.length === 0;

    let desktop = window.innerWidth > (customSplit || config.area.split).max;
    let slides;
    let index = 0;

    if (initialSlides && initialSlides.length !== 0) {
        slides = splitArray(initialSlides, (customSplit || config.area.split)[desktop ? "desktop" : "mobile"]);
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
    noticeIcon.className = `icon icon-${failed ? "warning" : noResults ? "eye-slash" : "sync"}`
    noticeText.className = "text";
    noticeText.innerText = failed ? `Failed to fetch ${labelText.toLowerCase()}` : noResults ? "No results found" : `Fetching ${labelText.toLowerCase()}`;

    notice.append(noticeIcon);
    notice.append(noticeText);

    cards.className = "cards";

    function add(info) {
        const card = document.createElement("div");
        const image = document.createElement("img");
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

        card.className = "card";
        image.className = "image";
        image.src = info.image;
        image.alt = info.title;
        title.className = "title";

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
            }, 1000);

            card.append(seasonInfo);
        }

        card.addEventListener("click", function () {
            watchContent(info.type, info.id);
        });

        title.innerText = info.title.length > config.area.maxTitleLength
            ? info.title.substring(0, config.area.maxTitleLength).replace(/\s+\S*$/, "...")
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

            star.className = i < info.rating ? "star fill" : "star";
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
        const newDesktop = window.innerWidth > (customSplit || config.area.split).max;

        if (desktop !== newDesktop) {
            desktop = newDesktop;

            if (slides && slides.length !== 0) {
                slides = splitArray(initialSlides, (customSplit || config.area.split)[desktop ? "desktop" : "mobile"]);

                index = index === 0 ? 0 : desktop
                    ? Math.round((index + 1) / ((customSplit || config.area.split).desktop / (customSplit || config.area.split).mobile)) - 1
                    : Math.round((index + 1) * ((customSplit || config.area.split).desktop / (customSplit || config.area.split).mobile)) - 2;

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
    } else {
        area.append(notice);
    }
}

export function initializeAreas() {
    const desktop = window.innerWidth > config.area.split.max;

    const moviesSection = document.querySelector(".section.movies");
    const showsSection = document.querySelector(".section.shows");

    if (!moviesSection || !showsSection) {
        return console.error("Failed to find sections.");
    }

    const moviesContinueArea = document.createElement("div");
    const showsContinueArea = document.createElement("div");

    const moviesTrendingArea = document.createElement("div");
    const showsTrendingArea = document.createElement("div");

    const moviesRatedArea = document.createElement("div");
    const showsRatedArea = document.createElement("div");

    const moviesNewArea = document.createElement("div");
    const showsNewArea = document.createElement("div");

    moviesContinueArea.className = "area inactive";
    showsContinueArea.className = "area inactive";

    moviesTrendingArea.className = "area";
    showsTrendingArea.className = "area";

    moviesRatedArea.className = "area";
    showsRatedArea.className = "area";

    moviesNewArea.className = "area";
    showsNewArea.className = "area";

    const continueActive = getSection("Continue");
    const trendingActive = getSection("Trending");
    const ratedActive = getSection("Top-Rated");
    const newActive = getSection("New");

    if (continueActive) {
        moviesSection.append(moviesContinueArea);
        showsSection.append(showsContinueArea);
    }

    if (trendingActive) {
        moviesSection.append(moviesTrendingArea);
        showsSection.append(showsTrendingArea);
    }

    if (ratedActive) {
        moviesSection.append(moviesRatedArea);
        showsSection.append(showsRatedArea);
    }

    if (newActive) {
        moviesSection.append(moviesNewArea);
        showsSection.append(showsNewArea);
    }

    function initializeContinueWatching() {
        const label = "Continue";

        let continueMovies = [];
        let continueShows = [];
        
        async function initializeMovies() {
            initializeArea(moviesContinueArea, null, label);

            if (!continueMovies || continueMovies.length === 0) {
                moviesContinueArea.classList.add("inactive");
            } else {
                await preloadImages(continueMovies.map((i) => i.image), config.area.split[desktop ? "desktop" : "mobile"]);    
                initializeArea(moviesContinueArea, continueMovies, label);
                moviesContinueArea.classList.remove("inactive");
            }
        }

        async function initializeShows() {
            initializeArea(showsContinueArea, null, label);

            if (!continueShows || continueShows.length === 0) {
                showsContinueArea.classList.add("inactive");
            } else {
                await preloadImages(continueShows.map((i) => i.image), config.area.split[desktop ? "desktop" : "mobile"]);
                initializeArea(showsContinueArea, continueShows, label);
                showsContinueArea.classList.remove("inactive");
            }
        }

        function check() {
            const newContinueMovies = getContinueWatching("movie");
            const newContinueShows = getContinueWatching("tv");

            if (continueMovies.length === 0 && newContinueMovies.length > 0 || JSON.stringify(newContinueMovies) !== JSON.stringify(continueMovies)) {
                continueMovies = newContinueMovies;
                initializeMovies();
            }

            if (continueShows.length === 0 && newContinueMovies.length > 0 || JSON.stringify(newContinueShows) !== JSON.stringify(continueShows)) {
                continueShows = newContinueShows;
                initializeShows();
            }
        }

        check();
        setInterval(check, 500);
    }

    function initializeTrending() {
        const label = "Trending";

        async function initializeMovies() {
            initializeArea(moviesTrendingArea, null, label);
            let trendingMovies = await getTrending("movie");

            if (!trendingMovies) {
                initializeArea(moviesTrendingArea, null, label, true);
            } else {
                trendingMovies.splice(0, config.carousel.amount);    
                trendingMovies.splice(config.area.amount, trendingMovies.length);
    
                await preloadImages(trendingMovies.map((i) => i.image), config.area.split[desktop ? "desktop" : "mobile"], true);
                initializeArea(moviesTrendingArea, trendingMovies, label);
            }
        }

        async function initializeShows() {
            initializeArea(showsTrendingArea, null, label);
            let trendingShows = await getTrending("tv");

            if (!trendingShows) {
                initializeArea(showsTrendingArea, null, label, true);
            } else {
                trendingShows.splice(0, config.carousel.amount);
                trendingShows.splice(config.area.amount, trendingShows.length);
    
                await preloadImages(trendingShows.map((i) => i.image), config.area.split[desktop ? "desktop" : "mobile"], true);
                initializeArea(showsTrendingArea, trendingShows, label);
            }
        }

        initializeMovies();
        initializeShows();
    }

    function initializeTopRated() {
        const label = "Top-Rated";

        async function initializeMovies() {
            initializeArea(moviesRatedArea, null, label);
            let ratedMovies = await getRated("movie");

            if (!ratedMovies) {
                initializeArea(moviesRatedArea, null, label, true);
            } else {
                ratedMovies.splice(config.area.amount, ratedMovies.length);
                await preloadImages(ratedMovies.map((i) => i.image), config.area.split[desktop ? "desktop" : "mobile"], true);
                initializeArea(moviesRatedArea, ratedMovies, label);
            }
        }

        async function initializeShows() {
            initializeArea(showsRatedArea, null, label);
            let ratedShows = await getRated("tv");

            if (!ratedShows) {
                initializeArea(showsRatedArea, null, label, true);
            } else {
                ratedShows.splice(config.area.amount, ratedShows.length);
                await preloadImages(ratedShows.map((i) => i.image), config.area.split[desktop ? "desktop" : "mobile"], true);
                initializeArea(showsRatedArea, ratedShows, label);
            }
        }

        initializeMovies();
        initializeShows();
    }

    function initializeNew() {
        const label = "New";
        
        async function initializeMovies() {
            initializeArea(moviesNewArea, null, label);
            let newMovies = await getNew("movie");

            if (!newMovies) {
                initializeArea(moviesNewArea, null, label, true);
            } else {
                newMovies.splice(config.area.amount, newMovies.length);
                await preloadImages(newMovies.map((i) => i.image), config.area.split[desktop ? "desktop" : "mobile"], true);
                initializeArea(moviesNewArea, newMovies, label);
            }
        }

        async function initializeShows() {
            initializeArea(showsNewArea, null, label);
            let newShows = await getNew("tv");

            if (!newShows) {
                initializeArea(showsNewArea, null, label, true);
            } else {
                newShows.splice(config.area.amount, newShows.length);
                await preloadImages(newShows.map((i) => i.image), config.area.split[desktop ? "desktop" : "mobile"], true);
                initializeArea(showsNewArea, newShows, label);
            }
        }

        initializeMovies();
        initializeShows();
    }

    if (continueActive) initializeContinueWatching();
    if (trendingActive) initializeTrending();
    if (ratedActive) initializeTopRated();
    if (newActive) initializeNew();
}