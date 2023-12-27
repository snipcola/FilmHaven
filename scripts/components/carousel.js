import { config } from "../config.js";
import { isHovered } from "../functions.js";
import { preloadImages } from "../cache.js";

function initializeCarousel(card, slides) {
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
    let indicatorArray = [];
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
    buttonText.innerText = "Watch Content";

    button.append(buttonIcon);
    button.append(buttonText);
    buttons.append(button);
    
    details.append(title);
    details.append(description);
    details.append(buttons);

    control.className = "control";
    previous.className = "button secondary icon-only previous";
    previousIcon.className = "icon fa-solid fa-arrow-left";
    indicators.className = "indicators";
    next.className = "button secondary icon-only next";
    nextIcon.className = "icon fa-solid fa-arrow-right";

    for (var i = 0; i < slides.length; i++) {
        indicatorArray[i] = document.createElement("div");
        indicatorArray[i].className = "indicator";
        indicators.append(indicatorArray[i]);
    }

    previous.append(previousIcon);
    next.append(nextIcon);

    control.append(previous);
    control.append(indicators);
    control.append(next);

    function set(newIndex) {
        const slide = slides[newIndex];

        if (!slide) {
            return;
        }

        index = newIndex;

        image.src = slide.image;
        title.innerText = slide.title;
        description.innerText = slide.description.length > config.carousel.maxDescriptionLength
            ? slide.description.substring(0, config.carousel.maxDescriptionLength).replace(/\s+\S*$/, "...")
            : slide.description;

        indicatorArray.forEach(function (indicator, i) {
            indicator.classList[index === i ? "add" : "remove"]("active");
        });
    }

    function setPrevious() {
        set(slides[index - 1] ? index - 1 : slides.length - 1);
    }

    function setNext() {
        set(slides[index + 1] ? index + 1 : 0);
    }

    function iterate() {
        if (!isHovered(card)) {
            setNext();
        }
    }
    
    setInterval(iterate, config.carousel.switchSlideInterval);
    set(index);

    card.append(image);
    card.append(vignette);
    card.append(details);
    card.append(control);

    previous.addEventListener("click", setPrevious);
    next.addEventListener("click", setNext);
}

function preload(slides) {
    const images = slides.map((m) => m.image);
    preloadImages(images);
}

export function initializeCarousels() {
    const moviesCard = document.querySelector(".section.movies .carousel");
    const showsCard = document.querySelector(".section.shows .carousel");

    if (!moviesCard || !showsCard) {
        return console.error("Failed to initialize carousels.");
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
            description: "Willy Wonka - chock-full of ideas and determined to change the world one delectable bite at a time - is proof that the best things in life begin with a dream, and if you're lucky enough to meet Willy Wonka, anything is possible.",
            image: "https://image.tmdb.org/t/p/w1280/yOm993lsJyPmBodlYjgpPwBjXP9.jpg"
        }
    ];

    preload(movies);
    initializeCarousel(moviesCard, movies);

    const shows = [
        {
            id: "1396",
            type: "tv",
            title: "Breaking Bad",
            description: "When Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live. He becomes filled with a sense of fearlessness and an unrelenting desire to secure his family's financial future at any cost as he enters the dangerous world of drugs and crime.",
            image: "https://image.tmdb.org/t/p/w1280/9faGSFi5jam6pDWGNd0p8JcJgXQ.jpg"
        },
        {
            id: "60625",
            type: "tv",
            title: "Rick and Morty",
            description: "Rick is a mentally-unbalanced but scientifically gifted old man who has recently reconnected with his family. He spends most of his time involving his young grandson Morty in dangerous, outlandish adventures throughout space and alternate universes. Compounded with Morty's already unstable family life, these events cause Morty much distress at home and school.",
            image: "https://image.tmdb.org/t/p/w1280/rBF8wVQN8hTWHspVZBlI3h7HZJ.jpg"
        },
        {
            id: "387",
            type: "tv",
            title: "SpongeBob SquarePants",
            description: "Deep down in the Pacific Ocean in the subterranean city of Bikini Bottom lives a square yellow sponge named SpongeBob SquarePants. SpongeBob lives in a pineapple with his pet snail, Gary, loves his job as a fry cook at the Krusty Krab, and has a knack for getting into all kinds of trouble without really trying. When he's not getting on the nerves of his cranky next door neighbor Squidward, SpongeBob can usually be found smack in the middle of all sorts of strange situations with his best buddy, the simple yet lovable starfish, Patrick, or his thrill-seeking surfer-girl squirrel pal, Sandy Cheeks.",
            image: "https://image.tmdb.org/t/p/w1280/aasp5EmwclAQbwfGABWLTNLhjwB.jpg"
        }
    ];

    preload(shows);
    initializeCarousel(showsCard, shows);
}