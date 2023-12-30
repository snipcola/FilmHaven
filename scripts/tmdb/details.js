import { sendRequest, getImageUrl } from "./main.js";
import { shortenNumber, cleanText, getSearchUrl } from "../functions.js";
import { config } from "../config.js";

function format(item, type) {
    if (item && item.poster_path) {
        const dateString = item.release_date || item.first_air_date;
        const date = new Date(dateString);

        const cast = (item.credits?.cast || [])
            .filter((p) => p.name && p.profile_path)
            .map(function (person) {
                return {
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

        return {
            id: item.id?.toString(),
            type,
            title: item.title || item.name,
            description: item.overview || item.description,
            image: getImageUrl(item.poster_path, "poster"),
            date: dateString ? `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}` : null,
            rating: Math.round(item.vote_average / 2).toString(),
            stars: shortenNumber(item.vote_count, 1),
            fullDate: dateString,
            cast,
            reviews
        };
    }

    return null;
}

export async function getDetails(type = "movie", id) {    
    const response = await sendRequest(`${type}/${id}`, { append_to_response: ["credits", "reviews"].join(",") });
    const json = format(response, type);

    return json;
}