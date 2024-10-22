import { sendRequest, getImageUrl } from "./main.js";
import { convertMinutesToText } from "../functions.js";
import { config } from "../config.js";

function format(item) {
  if (item) {
    const episodes = (item.episodes || []).map(function (episode) {
      let description = episode.overview || episode.description;
      if (description)
        description =
          description.length > config.maxDescriptionLength
            ? description
                .substring(0, config.maxDescriptionLength)
                .replace(/\s+\S*$/, "...")
            : description;

      return {
        number: episode.episode_number,
        numberPadded: episode.episode_number.toString().padStart(2, "0"),
        name: episode.name,
        description,
        image: getImageUrl(episode.still_path, "episode"),
        time: episode.runtime ? convertMinutesToText(episode.runtime) : null,
      };
    });

    return {
      number: item.season_number,
      numberPadded: item.season_number.toString().padStart(2, "0"),
      episodes,
    };
  } else {
    return null;
  }
}

export async function getSeason(id, number) {
  const response = await sendRequest(`tv/${id}/season/${number}`);
  const json = format(response);

  return json;
}
