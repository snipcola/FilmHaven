export default {
    providers: [
        {
            base: "vidsrc.to",
            url: function (type, params) {
                switch (type) {
                    case "movie":
                        return `https://${this.base}/embed/movie/${params.id}`;
                    case "tv":
                        return `https://${this.base}/embed/tv/${params.id}/${params.season}/${params.episode}`;
                }
            }
        },
        {
            base: "vidsrc.pro",
            url: function (type, params) {
                switch (type) {
                    case "movie":
                        return `https://${this.base}/embed/movie/${params.id}`;
                    case "tv":
                        return `https://${this.base}/embed/tv/${params.id}/${params.season}/${params.episode}`;
                }
            }
        },
        {
            base: "vidsrc.me",
            url: function (type, params) {
                switch (type) {
                    case "movie":
                        return `https://${this.base}/embed/movie?tmdb=${params.id}`;
                    case "tv":
                        return `https://${this.base}/embed/tv?tmdb=${params.id}&season=${params.season}&episode=${params.episode}`;
                }
            }
        },
        {
            base: "flixon.click",
            url: function (type, params) {
                switch (type) {
                    case "movie":
                        return `https://${this.base}/${params.imdbId}`;
                    case "tv":
                        return `https://${this.base}/${params.id}-${params.season}-${params.episode}`;
                }
            }
        }
    ],
    blacklist: {
        status: [
            404, // Not Found
            500 // Internal Server Error
        ],
        text: [
            "not found",
            "no sources",
            "no movie found",
            "no tv show found",
            "no episode found",
            "no show found",
            "media is unavailable", // vidsrc.me
            "onionplay streaming mirrors" // flixon.click
        ]
    }
};