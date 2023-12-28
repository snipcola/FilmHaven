export const config = {
    author: "Snipcola",
    name: "FilmHaven",
    carousel: {
        maxDescriptionLength: 230,
        switchSlideInterval: 10000
    }
};

export const tmdb = {
    api: {
        url: "https://api.themoviedb.org",
        version: "3",
        key: "5622cafbfe8f8cfe358a29c53e19bba0"
    },
    image: {
        url: "https://image.tmdb.org/t/p",
        poster: "w500",
        backdrop: "w1280"
    },
    carousel: {
        amount: 5
    },
    area: {
        amount: 12,
        split: {
            max: 700,
            desktop: 4,
            mobile: 2
        }
    },
    trending: {
        timeWindow: "week"
    },
    language: "en-GB"
};