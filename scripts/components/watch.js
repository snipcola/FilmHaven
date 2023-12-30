import { getHash, onHashChange, setHash, removeHash } from "../hash.js";
import { setModal, showModal } from "./modal.js";
import { getDetails } from "../tmdb/details.js";
import { provider } from "../config.js";

export function watchContent(type, id) {
    setHash("modal", `watch-${type}-${id}`);
}

function modal(info) {
    const watch = document.createElement("div");
    const video = document.createElement("iframe");

    watch.className = "watch";

    video.className = "video";
    video.setAttribute("allowfullscreen", true);
    video.src = provider.api.movieUrl(info.id);

    watch.append(video);

    setModal(info.title, watch, "arrow-left", true);
    showModal();
}

function initializeWatchModalCheck() {
    async function handleHashChange() {
        const modalHash = getHash("modal");

        if (modalHash) {
            const [modalType, type, id] = modalHash.split("-");

            if (modalType === "watch") {
                const info = await getDetails(type, id);

                if (info) {
                    modal(info);
                    document.title = info.title;
                } else {
                    removeHash("modal");
                }
            }
        }
    }

    handleHashChange();
    onHashChange(handleHashChange);
}

export function initializeWatch() {
    initializeWatchModalCheck();
}