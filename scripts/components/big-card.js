import { preloadImages } from "../functions.js";

function initializeBigCard(card, slides) {
    let currentIndex = 0;

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
    const next = document.createElement("div");
    const nextIcon = document.createElement("i");

    image.className = "image";
    vignette.className = "vignette";

    details.className = "details";
    title.className = "title";
    description.className = "description";

    buttons.className = "buttons";
    button.className = "button";
    buttonIcon.className = "icon fa-solid fa-play";
    buttonText.className = "text";
    buttonText.innerText = "Watch Now";

    button.append(buttonIcon);
    button.append(buttonText);
    buttons.append(button);
    
    details.append(title);
    details.append(description);
    details.append(buttons);

    control.className = "control";
    previous.className = "action previous";
    previousIcon.className = "icon fa-solid fa-angle-left";
    next.className = "action next";
    nextIcon.className = "icon fa-solid fa-angle-right";

    previous.append(previousIcon);
    next.append(nextIcon);

    control.append(previous);
    control.append(next);

    function get(index) {
        return slides[index];
    }

    function set(index) {
        const slide = get(index);

        if (!slide) {
            return;
        }
        
        currentIndex = index;

        image.src = slide.image;
        title.innerText = slide.title;
        description.innerText = slide.description.length > 250 ? slide.description.substring(0, 250).replace(/\s+\S*$/, '...') : slide.description;

        previous.classList[get(index - 1) ? "remove" : "add"]("inactive");
        next.classList[get(index + 1) ? "remove" : "add"]("inactive");
    }

    set(currentIndex);

    card.append(image);
    card.append(vignette);
    card.append(details);
    card.append(control);

    previous.addEventListener("click", function () {
        set(currentIndex - 1);
    });

    next.addEventListener("click", function () {
        set(currentIndex + 1);
    });
}

function preload(slides) {
    const images = slides.map((m) => m.image);
    images.shift();

    preloadImages(images);
}

export function initializeBigCards() {
    const moviesCard = document.querySelector(".section.movies .big-card");

    if (!moviesCard) {
        return console.error("Failed to initialize big cards.");
    }

    const movies = [
        {
            id: "299534",
            type: "movie",
            title: "Avengers: Endgame",
            description: "With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos's actions and undo the chaos to the universe, no matter what consequences may be in store, and no matter who they face... Avenge the fallen.",
            image: "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg"
        },
        {
            id: "558",
            type: "movie",
            title: "Spider-Man 2",
            description: "Peter Parker is going through a major identity crisis. Burned out from being Spider-Man, he decides to shelve his superhero alter ego, which leaves the city suffering in the wake of carnage left by the evil Doc Ock. In the meantime, Parker still can't act on his feelings for Mary Jane Watson, a girl he's loved since childhood. A certain anger begins to brew in his best friend Harry Osborn as well...",
            image: "https://image.tmdb.org/t/p/w1280/aqaSgTT6jiAdx9aJ4xUI4G2MEXe.jpg"
        },
        {
            id: "787699",
            type: "movie",
            title: "Wonka",
            description: "Willy Wonka – chock-full of ideas and determined to change the world one delectable bite at a time – is proof that the best things in life begin with a dream, and if you’re lucky enough to meet Willy Wonka, anything is possible.",
            image: "https://image.tmdb.org/t/p/w1280//qhb1qOilapbapxWQn9jtRCMwXJF.jpg"
        }
    ];

    initializeBigCard(moviesCard, movies);
    preload(movies);
}