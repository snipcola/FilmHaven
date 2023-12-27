export const config = {
    name: "FilmHaven",
    carousel: {
        maxDescriptionLength: 250,
        switchSlideInterval: 5000
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
        moviesAmount: 5,
        showsAmount: 5
    },
    language: "en-GB"
};