import { sendRequest, getImageUrl, sortByPopularity } from "./main.js";
import { shortenNumber } from "../functions.js";

function format(obj, query) {
    return obj
        ? sortByPopularity(obj).filter((i) => i.poster_path).map(function (item) {
            const date = new Date(item.release_date || item.first_air_date);

            return {
                id: item.id?.toString(),
                type: item.media_type,
                title: item.title || item.name,
                description: item.overview || item.description,
                image: getImageUrl(item.poster_path, "poster"),
                backdrop: getImageUrl(item.backdrop_path, "backdrop"),
                date: `${date.getFullYear()}-${date.getMonth()}`,
                rating: Math.round(item.vote_average / 2).toString(),
                stars: shortenNumber(item.vote_count)
            };
        }).sort(function (a, b) {
            const queryLower = query.toLowerCase();

            if (a.title.toLowerCase() === queryLower) return -1;
            if (b.title.toLowerCase() === queryLower) return 1;
            else return 0;
        })
        : null;
}

export async function getSearchResults(type = "movie", query) {
    const response = await sendRequest(`search/${type}`, { query });
    const json = format(response?.results, query);

    return json;
}