export const config = {
    author: "Snipcola",
    name: "FilmHaven",
    header: {
        name: {
            normal: {
                text: "Film",
                accent: "Haven"
            },
            mobile: {
                text: "F",
                accent: "H"
            }
        },
        links: [
            {
                icon: "film",
                text: "Movies"
            },
            {
                icon: "tv",
                text: "Shows"
            },
            {
                icon: "cog",
                text: "Settings"
            }
        ]
    },
    footer: {
        links: [
            {
                icon: "youtube",
                url: "https://youtube.com/snipcola"
            },
            {
                icon: "github",
                url: "https://github.com/snipcola"
            }
        ]
    },
    modal: {
        validTypes: ["genre", "watch"]
    },
    search: {
        debounce: 250
    },
    carousel: {
        amount: 4,
        maxDescriptionLength: 230,
        switchSlideInterval: 10000
    },
    area: {
        maxTitleLength: 25,
        amount: 16,
        split: {
            max: 700,
            desktop: 4,
            mobile: 2
        }
    },
    genre: {
        split: {
            max: 900,
            desktop: 5,
            mobile: 2
        }
    },
    maxCacheDays: 5,
    maxMobileWidth: 600
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
    trending: {
        timeWindow: "week"
    },
    language: "en",
    adult: false
};