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
            "not found", // Generic
            "no sources", // Generic
            "no movie found", // Generic
            "no tv show found", // Generic
            "no episode found", // Generic
            "no show found", // Generic
            "media is unavailable", // vidsrc.me
            "onionplay streaming mirrors" // flixon.click
        ]
    }
};