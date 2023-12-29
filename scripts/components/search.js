function initializeSearch(area, type, placeholder) {
    const label = document.createElement("div");

    const search = document.createElement("div");
    const icon = document.createElement("i");
    const input = document.createElement("input");

    const clear = document.createElement("i");

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

    function onInput(e) {
        clear.classList[e.target.value.length > 0 ? "add" : "remove"]("active");
    }

    function onClear() {
        input.value = "";
        clear.classList.remove("active");
    }

    clear.addEventListener("click", onClear);

    input.addEventListener("input", onInput);
    input.addEventListener("change", onInput);

    area.append(label);
    area.append(search);

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

    moviesSearchArea.className = "area";
    showsSearchArea.className = "area";

    moviesSection.append(moviesSearchArea);
    showsSection.append(showsSearchArea);

    initializeSearch(moviesSearchArea, "movie", "Search for movies...");
    initializeSearch(showsSearchArea, "tv", "Search for shows...");
}