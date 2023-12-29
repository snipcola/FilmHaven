import { config } from "../config.js";
import { onWindowResize, splitArray, debounce } from "../functions.js";
import { preloadImages } from "../cache.js";
import { getSearchResults } from "../tmdb/search.js";

function initializeSearch(area, type, placeholder) {
    let results = [];
    let slides = [];

    let desktop = window.innerWidth > config.area.split.max;
    let index = 0;

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

    const cards = document.createElement("div");

    label.className = "label";
    label.innerText = "Search";

    search.className = "search";
    icon.className = "icon fa-solid fa-search";
    input.className = "input";
    input.placeholder = placeholder;
    clear.className = "clear fa-solid fa-delete-left";

    search.append(icon);
    search.append(input);
    search.append(clear);

    control.className = "control inactive";
    previous.className = "button secondary icon-only previous";
    previousIcon.className = "icon fa-solid fa-arrow-left";
    indicators.className = "indicators";
    next.className = "button secondary icon-only next";
    nextIcon.className = "icon fa-solid fa-arrow-right";

    previous.append(previousIcon);
    next.append(nextIcon);

    control.append(previous);
    control.append(indicators);
    control.append(next);

    cards.className = "cards inactive";

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
        title.className = "title";

        title.innerText = info.title.length > (config.area.maxTitleLength * 1.75)
            ? info.title.substring(0, (config.area.maxTitleLength * 1.75)).replace(/\s+\S*$/, "...")
            : info.title;

        footer.className = "footer";

        date.className = "date";
        dateIcon.className = "icon fa-solid fa-clock";
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
            starIcon.className = "icon fa-solid fa-star";

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
        playIcon.className = "icon fa-solid fa-play";

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
        const newDesktop = window.innerWidth > config.area.split.max;

        if (desktop !== newDesktop) {
            desktop = newDesktop;
            
            if (slides && slides.length !== 0) {
                slides = splitArray(results, config.area.split[desktop ? "desktop" : "mobile"]);

                index = index === 0 ? 0 : desktop
                    ? Math.round((index + 1) / (config.area.split.desktop / config.area.split.mobile)) - 1
                    : Math.round((index + 1) * (config.area.split.desktop / config.area.split.mobile)) - 2;

                set(index);
            }
        }
    }

    function reset() {
        results = [];
        slides = [];
        index = 0;

        control.className = "control inactive";
        cards.className = "cards inactive";
        
        indicators.innerHTML = "";
        cards.innerHTML = "";
    }

    function populate(newResults) {
        reset();

        if (newResults.length === 0) {
            return;
        }

        results = newResults;
        slides = splitArray(results, config.area.split[desktop ? "desktop" : "mobile"]);
        
        set(index);

        control.className = "control";
        cards.className = "cards";
    }

    async function clearCheck(e) {
        if (e.target.value.length > 0) {
            clear.classList.add("active");
        } else {
            clear.classList.remove("active");
            reset();
        }
    }

    async function onInput(e) {
        const query = e.target.value;

        if (query.length > 0) {
            const searchResults = await getSearchResults(type, query);
            
            if (!searchResults) {
                return console.error(`Failed to search for "${query}".`);
            }

            await preloadImages(searchResults.map((i) => i.image), config.area.split[desktop ? "desktop" : "mobile"]);
            populate(searchResults);
        }
    }

    const debouncedOnInput = debounce(onInput, config.search.debounce);

    function onClear() {
        input.value = "";
        clear.classList.remove("active");
        reset();
    }

    onWindowResize(checkResize);

    previous.addEventListener("click", setPrevious);
    next.addEventListener("click", setNext);

    clear.addEventListener("click", onClear);
    input.addEventListener("input", clearCheck);
    input.addEventListener("input", debouncedOnInput);

    area.append(label);
    area.append(search);
    area.append(control);
    area.append(cards);

    area.classList.add("active");
}

export function initializeSearches() {
    const moviesSection = document.querySelector(".section.movies");
    const showsSection = document.querySelector(".section.shows");

    if (!moviesSection || !showsSection) {
        return console.error("Failed to initialize genres.");
    }

    const moviesSearchArea = document.createElement("div");
    const showsSearchArea = document.createElement("div");

    moviesSearchArea.className = "area search";
    showsSearchArea.className = "area search";

    moviesSection.append(moviesSearchArea);
    showsSection.append(showsSearchArea);

    initializeSearch(moviesSearchArea, "movie", "Search for movies...");
    initializeSearch(showsSearchArea, "tv", "Search for shows...");
}