import { sendRequest, getImageUrl } from "./main.js";
import { shortenNumber } from "../functions.js";

function format(item, type) {
    if (item && item.poster_path) {
        const dateString = item.release_date || item.first_air_date;
        const date = new Date(dateString);

        const cast = (item.credits?.cast || [])
            .filter((p) => p.profile_path)
            .map((p) => getImageUrl(p.profile_path, "cast"));

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
            cast
        };
    }

    return null;
}

export async function getDetails(type = "movie", id) {    
    const response = await sendRequest(`${type}/${id}`, { append_to_response: ["credits"].join(",") });
    const json = format(response, type);

    return json;
}