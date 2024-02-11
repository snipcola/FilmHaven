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
        },
        {
            base: "2embed.me",
            url: function (type, params) {
                switch (type) {
                    case "movie":
                        return `https://${this.base}/player/movie/${params.imdbId}`;
                    case "tv":
                        return `https://${this.base}/player/tv/${params.id}/S${params.season}/E${params.episode}`;
                }
            }
        },
        {
            base: "databasegdriveplayer.xyz",
            url: function (type, params) {
                switch (type) {
                    case "movie":
                        return `https://${this.base}/player.php?tmdb=${params.id}`;
                    case "tv":
                        return `https://${this.base}/player.php?type=series&tmdb=${params.id}&season=${params.season}&episode=${params.episode}`;
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
            "media is unavailable", // vidsrc.xyz
            "onionplay streaming mirrors", // flixon.click
            "no movie found", // 2embed.me
            "no tv show found", // 2embed.me
            `,"file":"","kind"` // databasegdriveplayer.xyz
        ]
    }
};