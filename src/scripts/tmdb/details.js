import { sendRequest, getImageUrl, sortByPopularity } from "./main.js";
import { shortenNumber, cleanText, getSearchUrl } from "../functions.js";
import { getSeason } from "./seasons.js";
import { config } from "../config.js";
import { getWatchSection } from "../store/watch-sections.js";

async function format(item, type) {
    if (item && item.poster_path) {
        const dateString = item.release_date || item.first_air_date;
        const date = new Date(dateString);

        const cast = (item.credits?.cast || [])
            .filter((p) => p.name && p.profile_path)
            .map(function (person) {
                return {
                    name: person.name,
                    image: getImageUrl(person.profile_path, "cast"),
                    url: getSearchUrl(person.name)
                };
            });

        const reviews = (item.reviews?.results || [])
            .filter((r) => r.url && r.author_details?.rating)
            .map(function (review) {
                let content = cleanText(review.content);
                content = content.length > config.maxReviewContentLength
                    ? content.substring(0, config.maxReviewContentLength).replace(/\s+\S*$/, "...")
                    : content;

                return {
                    author: review.author,
                    content,
                    rating: Math.round(review.author_details.rating / 2).toString(),
                    url: review.url
                };
            });

        const genres = (item.genres || [])
            .filter((g) => g.name)
            .map((g) => g.name);

        let seasons;
        
        if (getWatchSection("Video") || getWatchSection("Seasons")) seasons = (await Promise.all((item.seasons || [])
            .filter((s) => s.season_number > 0)
            .map(async function (season) {
                return getSeason(item.id, season.season_number);
            })))
            .filter((s) => s.amount > 0);

        const recommendations = sortByPopularity(item.recommendations?.results || [])
            .filter((r) => r.poster_path && r.media_type === type)
            .splice(0, config.recommendations.amount)
            .map(function (recommendation) {
                return {
                    id: recommendation.id?.toString(),
                    type,
                    title: recommendation.title || recommendation.name,
                    image: getImageUrl(recommendation.poster_path, "poster"),
                };
            });

        return {
            id: item.id?.toString(),
            type,
            title: item.title || item.name,
            description: item.overview || item.description,
            image: getImageUrl(item.poster_path, "poster"),
            date: dateString ? date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null,
            rating: Math.round(item.vote_average / 2).toString(),
            stars: shortenNumber(item.vote_count, 1),
            cast,
            reviews,
            genres,
            seasons,
            recommendations
        };
    }

    return null;
}

export async function getDetails(type = "movie", id) {    
    let append_to_response = [];

    if (getWatchSection("Cast")) append_to_response.push("credits");
    if (getWatchSection("Reviews")) append_to_response.push("reviews");
    if (getWatchSection("Recommendations")) append_to_response.push("recommendations");

    const response = await sendRequest(`${type}/${id}`, append_to_response.length > 0 ? { append_to_response: append_to_response.join(",") } : undefined);
    const json = format(response, type);

    return json;
}