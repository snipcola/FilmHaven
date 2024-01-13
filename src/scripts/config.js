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
                url: "https://youtube.com/snipcola",
                label: "YouTube"
            },
            {
                icon: "github",
                url: "https://github.com/snipcola",
                label: "GitHub"
            }
        ]
    },
    modal: {
        validTypes: ["g", "m", "s"]
    },
    search: {
        debounce: 500
    },
    carousel: {
        amount: 4,
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
    cast: {
        split: {
            max: 700,
            desktop: 10,
            mobile: 5
        }
    },
    reviews: {
        split: {
            max: 700,
            desktop: 2,
            mobile: 1
        }
    },
    recommendations: {
        amount: 8,
        split: {
            max: 700,
            desktop: 2,
            mobile: 2
        }
    },
    query: {
        page: "p",
        modal: "m"
    },
    maxDescriptionLength: 230,
    maxReviewContentLength: 230,
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
        poster: "w342",
        backdrop: "w1280",
        cast: "w150_and_h150_face",
        avatar: "w150_and_h150_face",
        episode: "w185"
    },
    trending: {
        timeWindow: "week"
    },
    language: "en",
    adult: false
};

export const store = {
    names: {
        cache: function (key) {
            return `fhc-${key}`;
        },
        theme: "fh-theme",
        provider: "fh-provider",
        lastPlayed: "fh-last-played",
        sections: "fh-sections",
        watchSections: "fh-watch-sections",
        continue: function (type) {
            return `fh-continue-${type}`;
        }
    }
};

export const themes = {
    auto: "Auto",
    dark: "Dark",
    light: "Light"
};

export const providers = {
    moviesapi: {
        name: "MoviesAPI",
        movieUrl: function (id) {
            return `https://moviesapi.club/movie/${id}`;
        },
        showUrl: function (id, season, episode) {
            return `https://moviesapi.club/tv/${id}-${season}-${episode}`;
        }
    },
    "vidsrc.to": {
        name: "VidSrc.to",
        movieUrl: function (id) {
            return `https://vidsrc.to/embed/movie/${id}`;
        },
        showUrl: function (id, season, episode) {
            return `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
        }
    },
    "vidsrc.me": {
        name: "VidSrc.me",
        movieUrl: function (id) {
            return `https://vidsrc.me/embed/movie?tmdb=${id}`;
        },
        showUrl: function (id, season, episode) {
            return `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;
        }
    },
    superembed: {
        name: "SuperEmbed",
        supportsThemes: true,
        movieUrl: function (id, theme) {
            return `./providers/superembed.php?v=${id}&t=${theme}`;
        },
        showUrl: function (id, season, episode, theme) {
            return `./providers/superembed.php?v=${id}&s=${season}&e=${episode}&t=${theme}`;
        }
    },
    smashystream: {
        name: "SmashyStream",
        movieUrl: function (id) {
            return `https://embed.smashystream.com/playere.php?tmdb=${id}`;
        },
        showUrl: function (id, season, episode) {
            return `https://embed.smashystream.com/playere.php?tmdb=${id}&season=${season}&episode=${episode}`;
        } 
    }
};

export const sections = {
    Carousel: true,
    Search: true,
    Continue: true,
    Genres: true,
    Trending: true,
    "Top-Rated": true,
    New: true
};

export const watchSections = {
    Video: true,
    Providers: true,
    Seasons: true,
    Description: true,
    Cast: true,
    Reviews: true,
    Misc: true,
    Recommendations: true
};