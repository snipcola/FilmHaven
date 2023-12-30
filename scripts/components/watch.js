import { getHash, onHashChange, setHash, removeHash } from "../hash.js";
import { setModal, showModal } from "./modal.js";
import { getDetails } from "../tmdb/details.js";
import { elementExists, onWindowResize, removeWindowResize, splitArray } from "../functions.js";
import { config, provider } from "../config.js";
import { preloadImages, unloadImages } from "../cache.js";

export function watchContent(type, id) {
    setHash("modal", `watch-${type}-${id}`);
}

function modal(info) {
    let desktop = window.innerWidth > config.cast.split.max;

    let castSlides;
    let castIndex = 0;

    if (info.cast && info.cast.length !== 0) {
        castSlides = splitArray(info.cast, config.cast.split[desktop ? "desktop" : "mobile"]);
    }

    const watch = document.createElement("div");
    const video = document.createElement("iframe");

    const notice = document.createElement("div");
    const noticeIcon = document.createElement("i");
    const noticeText = document.createElement("span");

    const details = document.createElement("div");
    const left = document.createElement("div");
    const right = document.createElement("div");

    const description = document.createElement("div");
    const descriptionTitle = document.createElement("div");
    const descriptionTitleIcon = document.createElement("i");
    const descriptionTitleText = document.createElement("span");
    const descriptionText = document.createElement("p");

    const cast = document.createElement("div");
    const castTitle = document.createElement("div");
    const castTitleIcon = document.createElement("i");
    const castTitleText = document.createElement("span");
    const castControl = document.createElement("div");
    const castPrevious = document.createElement("div");
    const castPreviousIcon = document.createElement("i");
    const castIndicators = document.createElement("div");
    const castNext = document.createElement("div");
    const castNextIcon = document.createElement("i");
    const castCards = document.createElement("div");

    watch.className = "watch";

    video.className = "video";
    video.setAttribute("allowfullscreen", true);
    video.src = provider.api.movieUrl(info.id);

    notice.className = "notice active";
    noticeIcon.className = "icon fa-solid fa-eye-slash";
    noticeText.className = "text";
    noticeText.innerText = "Not found";

    notice.append(noticeIcon);
    notice.append(noticeText);

    details.className = "details";
    left.className = "left container";
    right.className = "right container";

    details.append(left);
    details.append(right);

    description.className = "details-card";
    descriptionTitle.className = "title";
    descriptionTitleIcon.className = "icon fa-solid fa-file-lines";
    descriptionTitleText.className = "text";
    descriptionTitleText.innerText = "Description";
    descriptionText.className = "text";
    descriptionText.innerText = info.description;

    descriptionTitle.append(descriptionTitleIcon);
    descriptionTitle.append(descriptionTitleText);
    description.append(descriptionTitle);
    
    if (info.description) {
        description.append(descriptionText);
    } else {
        description.append(notice.cloneNode(true));
    }

    cast.className = "details-card";
    castTitle.className = "title";
    castTitleIcon.className = "icon fa-solid fa-user-group";
    castTitleText.className = "text";
    castTitleText.innerText = "Cast";
    castControl.className = "control";
    castPrevious.className = "button secondary icon-only previous";
    castPreviousIcon.className = "icon fa-solid fa-arrow-left";
    castIndicators.className = "indicators";
    castNext.className = "button secondary icon-only next";
    castNextIcon.className = "icon fa-solid fa-arrow-right";
    castCards.className = "cast-cards";

    castPrevious.append(castPreviousIcon);
    castNext.append(castNextIcon);

    castControl.append(castPrevious);
    castControl.append(castIndicators);
    castControl.append(castNext);

    castTitle.append(castTitleIcon);
    castTitle.append(castTitleText);
    cast.append(castTitle);

    function addCast(image) {
        const castCard = document.createElement("img");

        castCard.className = "cast-card";
        castCard.src = image;
        
        castCards.append(castCard);
    }

    function setCastIndicators() {
        castIndicators.innerHTML = "";

        castSlides.forEach(function (_, i) {
            const indicator = document.createElement("div");

            indicator.className = castIndex === i ? "indicator active" : "indicator";
            indicator.addEventListener("click", function () {
                setCast(i);
            });

            castIndicators.append(indicator);
        });
    }

    function setCast(newIndex) {
        castIndex = castSlides[newIndex] ? newIndex : 0;
        const slide = castSlides[castIndex];

        castCards.innerHTML = "";
        slide.forEach(addCast);

        setCastIndicators();
    }

    function setCastPrevious() {
        setCast(castSlides[castIndex - 1] ? castIndex - 1 : castSlides.length - 1);
    }

    function setCastNext() {
        setCast(castSlides[castIndex + 1] ? castIndex + 1 : 0);
    }

    function checkResize() {
        if (!elementExists(watch)) return removeWindowResize(checkResize);
        const newDesktop = window.innerWidth > config.cast.split.max;

        if (desktop !== newDesktop) {
            desktop = newDesktop;
            
            if (castSlides && castSlides.length !== 0) {
                castSlides = splitArray(info.cast, config.cast.split[desktop ? "desktop" : "mobile"]);

                castIndex = castIndex === 0 ? 0 : desktop
                    ? Math.round((castIndex + 1) / (config.cast.split.desktop / config.cast.split.mobile)) - 1
                    : Math.round((castIndex + 1) * (config.cast.split.desktop / config.cast.split.mobile)) - 2;

                setCast(castIndex);
            }
        }
    }

    function cleanup() {
        if (info.cast) unloadImages(info.cast);
    }

    if (castSlides) {
        onWindowResize(checkResize);
        setCast(castIndex);

        castPrevious.addEventListener("click", setCastPrevious);
        castNext.addEventListener("click", setCastNext);
    }

    if (castSlides) {
        castTitle.append(castControl);
        cast.append(castCards);
    } else {
        cast.append(notice.cloneNode(true));
    }

    left.append(description);
    left.append(cast);

    watch.append(video);
    watch.append(details);

    setModal(info.title, watch, "arrow-left", true);
    showModal(cleanup);
}

function initializeWatchModalCheck() {
    async function handleHashChange() {
        const modalHash = getHash("modal");

        if (modalHash) {
            const [modalType, type, id] = modalHash.split("-");

            if (modalType === "watch") {
                const info = await getDetails(type, id);

                if (info) {
                    if (info.cast) preloadImages(info.cast);

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