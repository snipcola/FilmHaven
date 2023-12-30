import { sendRequest, getImageUrl, sortByPopularity } from "./main.js";
import { shortenNumber } from "../functions.js";

function format(obj, type, query) {
    let result = obj
        ? sortByPopularity(obj).filter((i) => i.poster_path).map(function (item) {
            const dateString = item.release_date || item.first_air_date;
            const date = new Date(dateString);

            return {
                id: item.id?.toString(),
                type,
                title: item.title || item.name,
                description: item.overview || item.description,
                image: getImageUrl(item.poster_path, "poster"),
                backdrop: getImageUrl(item.backdrop_path, "backdrop"),
                date: dateString ? `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}` : null,
                rating: Math.round(item.vote_average / 2).toString(),
                stars: shortenNumber(item.vote_count, 1)
            };
        })
        : null;

    if (result) {
        const matchIndex = result.findIndex((i) => i.title.toLowerCase() === query.toLowerCase());

        if (matchIndex !== -1) {
            const match = result.splice(matchIndex, 1)[0];
            result.unshift(match);
        }
    }

    return result;
}

export async function getSearchResults(type = "movie", query) {
    const response = await sendRequest(`search/${type}`, { query });
    const json = format(response?.results, type, query);

    return json;
}