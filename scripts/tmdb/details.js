import { sendRequest, getImageUrl } from "./main.js";
import { shortenNumber } from "../functions.js";

function format(item, type) {
    if (item && item.poster_path) {
        const dateString = item.release_date || item.first_air_date;
        const date = new Date(dateString);

        return {
            id: item.id?.toString(),
            type,
            title: item.title || item.name,
            description: item.overview || item.description,
            image: getImageUrl(item.poster_path, "poster"),
            date: dateString ? `${date.getFullYear()}-${date.getMonth().toString().padStart(2, "0")}` : null,
            fullDate: dateString,
            rating: Math.round(item.vote_average / 2).toString(),
            stars: shortenNumber(item.vote_count, 1)
        };
    }

    return null;
}

export async function getDetails(type = "movie", id) {    
    const response = await sendRequest(`${type}/${id}`);
    const json = format(response, type);

    return json;
}