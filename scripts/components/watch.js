import { getHash, onHashChange, setHash, removeHash } from "../hash.js";
import { setModal, showModal, changeHeaderText } from "./modal.js";
import { getDetails } from "../tmdb/details.js";
import { elementExists, onWindowResize, removeWindowResize, splitArray } from "../functions.js";
import { config, provider } from "../config.js";
import { preloadImages, unloadImages } from "../cache.js";
import { getLastPlayed, setLastPlayed } from "../store/last-played.js"; 
import { addContinueWatching, isInContinueWatching, removeFromContinueWatching } from "../store/continue.js";

export function watchContent(type, id) {
    setHash("modal", `watch-${type}-${id}`);
}

function modal(info) {
    addContinueWatching(info.id, info.type, info.title, info.image);

    if (isInContinueWatching(info.id, info.type)) {
        const headerButtons = document.querySelector(".modal-header .header-buttons");

        if (headerButtons) {
            const button = document.createElement("div");
            const buttonIcon = document.createElement("i");

            button.className = "button secondary icon-only custom";
            buttonIcon.className = "icon fa-solid fa-eye-slash";

            button.addEventListener("click", function () {
                removeFromContinueWatching(info.id, info.type);
                button.remove();
            });

            button.append(buttonIcon);
            headerButtons.prepend(button);
        }
    }

    let desktop = window.innerWidth > config.cast.split.max;

    let castSlides;
    let castIndex = 0;

    if (info.cast && info.cast.length !== 0) {
        castSlides = splitArray(info.cast, config.cast.split[desktop ? "desktop" : "mobile"]);
    }

    let reviewSlides;
    let reviewIndex;

    if (info.reviews && info.reviews.length !== 0) {
        reviewSlides = splitArray(info.reviews, config.reviews.split[desktop ? "desktop" : "mobile"]);
    }

    let seasonIndex;
    let episodeIndex;

    if (info.type === "tv") {
        const lastPlayed = getLastPlayed(info.id);

        seasonIndex = lastPlayed.s;
        episodeIndex = lastPlayed.e;
    }

    const notice = document.createElement("div");
    const noticeIcon = document.createElement("i");
    const noticeText = document.createElement("span");

    const watch = document.createElement("div");
    const video = document.createElement("div");
    const iframe = document.createElement("iframe");

    const details = document.createElement("div");
    const left = document.createElement("div");
    const right = document.createElement("div");

    const seasons = document.createElement("div");
    const seasonsTitle = document.createElement("div");
    const seasonsTitleIcon = document.createElement("i");
    const seasonsTitleText = document.createElement("span");
    const seasonCards = document.createElement("div");

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

    const reviews = document.createElement("div");
    const reviewsTitle = document.createElement("div");
    const reviewsTitleIcon = document.createElement("i");
    const reviewsTitleText = document.createElement("span");
    const reviewsControl = document.createElement("div");
    const reviewsPrevious = document.createElement("div");
    const reviewsPreviousIcon = document.createElement("i");
    const reviewsIndicators = document.createElement("div");
    const reviewsNext = document.createElement("div");
    const reviewsNextIcon = document.createElement("i");
    const reviewCards = document.createElement("div");

    const misc = document.createElement("div");
    const releasedTitle = document.createElement("div");
    const releasedTitleIcon = document.createElement("i");
    const releasedTitleText = document.createElement("span");
    const releasedText = document.createElement("p");

    const ratingTitle = document.createElement("div");
    const ratingTitleIcon = document.createElement("i");
    const ratingTitleText = document.createElement("span");
    const ratingContainer = document.createElement("div");
    const ratingStars = document.createElement("div");
    const ratingStarsAmount = document.createElement("div");

    const genresTitle = document.createElement("div");
    const genresTitleIcon = document.createElement("i");
    const genresTitleText = document.createElement("span");
    const genres = document.createElement("div");

    watch.className = "watch";

    notice.className = "notice active";
    noticeIcon.className = "icon fa-solid fa-eye-slash";
    noticeText.className = "text";
    noticeText.innerText = "Not found";

    notice.append(noticeIcon);
    notice.append(noticeText);

    const videoNoticeContainer = document.createElement("div");
    const videoNotice = notice.cloneNode();
    const videoNoticeIcon = noticeIcon.cloneNode();
    const videoNoticeText = noticeText.cloneNode();

    videoNoticeContainer.className = "video-notice";
    videoNoticeIcon.className = "icon fa-solid fa-sync";
    videoNoticeText.innerText = "Content loading";

    videoNotice.append(videoNoticeIcon);
    videoNotice.append(videoNoticeText);
    videoNoticeContainer.append(videoNotice);

    video.className = "video";
    iframe.className = "iframe";
    iframe.setAttribute("allowfullscreen", true);

    video.append(iframe);

    function playVideo() {
        videoNoticeIcon.className = "icon fa-solid fa-sync";
        videoNoticeText.innerText = "Content loading";

        iframe.src = info.type === "movie"
            ? provider.api.movieUrl(info.id)
            : provider.api.showUrl(info.id, seasonIndex + 1, episodeIndex + 1);

        video.append(videoNoticeContainer);

        iframe.addEventListener("load", function () {
            videoNoticeContainer.remove();
            iframe.classList.add("active");
        });
    }

    playVideo();

    details.className = "details";
    left.className = "left container";
    right.className = "right container";

    details.append(left);
    details.append(right);

    seasons.className = "details-card";
    seasonsTitle.className = "title";
    seasonsTitleIcon.className = "icon fa-solid fa-list";
    seasonsTitleText.className = "text";
    seasonsTitleText.innerText = "Seasons";
    seasonCards.className = "season-cards";

    seasonsTitle.append(seasonsTitleIcon);
    seasonsTitle.append(seasonsTitleText);
    seasons.append(seasonsTitle);
    
    function hideSeasons() {
        const seasons = seasonCards.querySelectorAll(".season-card.active");
        const icons = seasonCards.querySelectorAll(".icon.fa-arrow-up");

        for (const season of Array.from(seasons)) {
            season.classList.remove("active");
        }

        for (const icon of Array.from(icons)) {
            icon.className = "icon fa-solid fa-arrow-down";
        }
    }

    function showSeason(season) {
        const isActive = season.classList.contains("active");
        hideSeasons();

        if (!isActive) {
            const icon = season.querySelector(".fa-arrow-down");

            if (icon)  icon.className = "icon fa-solid fa-arrow-up";
            season.classList.add("active");
            season.scrollIntoView({ block: "start" });
        }
    }

    function unsetEpisodes() {
        const episodes = seasonCards.querySelectorAll(".episode.active");

        for (const episode of Array.from(episodes)) {
            episode.classList.remove("active");
        }
    }

    function setEpisode(episode) {
        unsetEpisodes();
        episode.classList.add("active");
    }

    function checkCurrentlyPlaying() {
        if (info.type === "movie") {
            changeHeaderText(info.title);
            document.title = info.title;
        } else {
            changeHeaderText(`${info.title} <span class="info">S${seasonIndex + 1} E${episodeIndex + 1}</span>`);
            document.title = `${info.title} (S${seasonIndex + 1} E${episodeIndex + 1})`;
        }
    }

    function playSeries() {
        iframe.src = "";
        
        setTimeout(function () {
            setLastPlayed(info.id, seasonIndex, episodeIndex);
            checkCurrentlyPlaying();

            playVideo();
            iframe.scrollIntoView({ block: "end" });
        }, 100);
    }

    if (info.seasons && info.seasons.length > 0) {
        info.seasons.forEach(function (season, sIndex) {
            const card = document.createElement("div");
            const title = document.createElement("div");
            const name = document.createElement("span");
            const amount = document.createElement("span");
            const button = document.createElement("div");
            const buttonIcon = document.createElement("i");
            const episodes = document.createElement("div");

            card.className = sIndex === seasonIndex ? "season-card active" : "season-card";
            title.className = "season-title";
            name.className = "name";
            name.innerText = `Season ${season.numberPadded}`;
            amount.className = "amount";
            amount.innerText = `${season.episodes.length} episodes`;
            button.className = "button secondary icon-only";
            buttonIcon.className = `icon fa-solid ${sIndex === seasonIndex ? "fa-arrow-up" : "fa-arrow-down"}`;

            button.append(buttonIcon);

            button.addEventListener("click", function () {
                showSeason(card);
            });

            title.append(name);
            title.append(amount);
            title.append(button);

            episodes.className = "episodes";

            season.episodes.forEach(function (episodeInfo, eIndex) {
                const episode = document.createElement("div");
                const episodeLeft = document.createElement("div");
                const episodeRight = document.createElement("div");

                const episodeNumber = document.createElement("span");
                const episodePreviewContainer = document.createElement("div");
                const episodePreviewImage = document.createElement("img");

                const episodeTitle = document.createElement("div");
                const episodeTitleText = document.createElement("span");
                const episodeTitleTime = document.createElement("div");
                const episodeTitleTimeIcon = document.createElement("i");
                const episodeTitleTimeText = document.createElement("span");
                const episodeDescription = document.createElement("span");

                episode.className = (sIndex === seasonIndex && eIndex === episodeIndex) ? "episode active" : "episode";
                episodeLeft.className = "episode-left";
                episodeRight.className = "episode-right";

                episode.addEventListener("click", function () {
                    seasonIndex = sIndex;
                    episodeIndex = eIndex;

                    setEpisode(episode);
                    playSeries();
                });

                episodeNumber.className = "number";
                episodeNumber.innerText = episodeInfo.numberPadded;
                episodePreviewContainer.className = "preview";
                episodePreviewImage.className = "image";
                
                if (episodeInfo.image) {
                    episodePreviewImage.src = episodeInfo.image;
                }
                
                episodePreviewContainer.append(episodePreviewImage);

                episodeTitle.className = "episode-title";
                episodeTitleText.className = "name";
                episodeTitleText.innerText = episodeInfo.name;
                episodeTitleTime.className = "time";
                episodeTitleTimeIcon.className = "icon fa-solid fa-clock";
                episodeTitleTimeText.className = "text";
                episodeTitleTimeText.innerText = episodeInfo.time;
                episodeDescription.className = "description";
                episodeDescription.innerText = episodeInfo.description;

                episodeTitleTime.append(episodeTitleTimeIcon);
                episodeTitleTime.append(episodeTitleTimeText);

                if (episodeInfo.name) {
                    episodeTitle.append(episodeTitleText);
                } else {
                    episodeTitle.append(notice.cloneNode(true));
                }
                
                if (episodeInfo.time) {
                    episodeTitle.append(episodeTitleTime);
                }

                episodeLeft.append(episodeNumber);
                episodeLeft.append(episodePreviewContainer);

                episodeRight.append(episodeTitle);
                
                if (episodeInfo.description) {
                    episodeRight.append(episodeDescription);
                } else {
                    episodeRight.append(notice.cloneNode(true));
                }

                episode.append(episodeLeft);
                episode.append(episodeRight);

                episodes.append(episode);
            });

            card.append(title);
            card.append(episodes);

            seasonCards.append(card);
        });

        seasons.append(seasonCards);
    } else {
        seasons.append(notice.cloneNode(true));
    }

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

    castTitle.append(castTitleIcon);
    castTitle.append(castTitleText);
    cast.append(castTitle);

    castPrevious.append(castPreviousIcon);
    castNext.append(castNextIcon);

    castControl.append(castPrevious);
    castControl.append(castIndicators);
    castControl.append(castNext);

    function addCast(info) {
        const cast = document.createElement("div");
        const image = document.createElement("img");

        cast.className = "cast-card";
        image.className = "image";
        image.src = info.image;
        
        cast.append(image);

        cast.addEventListener("click", function () {
            window.open(info.url);
        });

        castCards.append(cast);
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

    reviews.className = "details-card";
    reviewsTitle.className = "title";
    reviewsTitleIcon.className = "icon fa-solid fa-ranking-star";
    reviewsTitleText.className = "text";
    reviewsTitleText.innerText = "Reviews";
    reviewsControl.className = "control";
    reviewsPrevious.className = "button secondary icon-only previous";
    reviewsPreviousIcon.className = "icon fa-solid fa-arrow-left";
    reviewsIndicators.className = "indicators";
    reviewsNext.className = "button secondary icon-only next";
    reviewsNextIcon.className = "icon fa-solid fa-arrow-right";
    reviewCards.className = "review-cards";

    reviewsTitle.append(reviewsTitleIcon);
    reviewsTitle.append(reviewsTitleText);
    reviews.append(reviewsTitle);

    reviewsPrevious.append(reviewsPreviousIcon);
    reviewsNext.append(reviewsNextIcon);

    reviewsControl.append(reviewsPrevious);
    reviewsControl.append(reviewsIndicators);
    reviewsControl.append(reviewsNext);

    function addReview(info) {
        const review = document.createElement("div");
        const title = document.createElement("div");
        const titleText = document.createElement("span");

        const rating = document.createElement("div");
        const stars = document.createElement("div");
        const starsAmount = document.createElement("div");

        const content = document.createElement("span");

        review.className = "review-card";
        title.className = "review-title";
        titleText.className = "author";
        titleText.innerText = info.author;

        rating.className = "rating";
        stars.className = "stars";
        starsAmount.className = "amount rating-text";
        starsAmount.innerText = info.rating;

        for (var i = 0; i < 5; i++) {
            const star = document.createElement("div");
            const starIcon = document.createElement("i");

            star.className = i < info.rating ? "star fill" : "star";
            starIcon.className = "icon fa-solid fa-star";

            star.append(starIcon);
            stars.append(star);
        }

        rating.append(stars);
        rating.append(starsAmount);

        title.append(titleText);
        title.append(rating);

        content.className = "review-content";
        content.innerText = info.content;
        
        review.append(title);
        review.append(content);

        review.addEventListener("click", function () {
            window.open(info.url);
        });

        reviewCards.append(review);
    }

    function setReviewsIndicators() {
        reviewsIndicators.innerHTML = "";

        reviewSlides.forEach(function (_, i) {
            const indicator = document.createElement("div");

            indicator.className = reviewIndex === i ? "indicator active" : "indicator";
            indicator.addEventListener("click", function () {
                setReviews(i);
            });

            reviewsIndicators.append(indicator);
        });
    }

    function setReviews(newIndex) {
        reviewIndex = reviewSlides[newIndex] ? newIndex : 0;
        const slide = reviewSlides[reviewIndex];

        reviewCards.innerHTML = "";
        slide.forEach(addReview);

        setReviewsIndicators();
    }

    function setReviewPrevious() {
        setReviews(reviewSlides[reviewIndex - 1] ? reviewIndex - 1 : reviewSlides.length - 1);
    }

    function setReviewNext() {
        setReviews(reviewSlides[reviewIndex + 1] ? reviewIndex + 1 : 0);
    }

    misc.className = "details-card misc";
    releasedTitle.className = "title";
    releasedTitleIcon.className = "icon fa-solid fa-calendar";
    releasedTitleText.className = "text";
    releasedTitleText.innerText = info.type === "movie" ? "Released" : "First Aired";
    releasedText.className = "text";
    releasedText.innerText = info.date;

    releasedTitle.append(releasedTitleIcon);
    releasedTitle.append(releasedTitleText);
    misc.append(releasedTitle);

    if (info.date) {
        misc.append(releasedText);
    } else {
        misc.append(notice.cloneNode(true));
    }

    ratingTitle.className = "title";
    ratingTitleIcon.className = "icon fa-solid fa-star";
    ratingTitleText.className = "text";
    ratingTitleText.innerText = "Rating";

    ratingTitle.append(ratingTitleIcon);
    ratingTitle.append(ratingTitleText);
    misc.append(ratingTitle);

    ratingContainer.className = "rating";
    ratingStars.className = "stars";
    ratingStarsAmount.className = "amount rating-text";
    ratingStarsAmount.innerText = info.stars;

    for (var i = 0; i < 5; i++) {
        const star = document.createElement("div");
        const starIcon = document.createElement("i");

        star.className = i < info.rating ? "star fill" : "star";
        starIcon.className = "icon fa-solid fa-star";

        star.append(starIcon);
        ratingStars.append(star);
    }

    ratingContainer.append(ratingStars);
    ratingContainer.append(ratingStarsAmount);

    if (info.rating && info.stars) {
        misc.append(ratingContainer);
    } else {
        misc.append(notice.cloneNode(true));
    }

    genresTitle.className = "title";
    genresTitleIcon.className = "icon fa-solid fa-shapes";
    genresTitleText.className = "text";
    genresTitleText.innerText = "Genres";
    genres.className = "genre-cards";

    genresTitle.append(genresTitleIcon);
    genresTitle.append(genresTitleText);
    misc.append(genresTitle);

    if (info.genres && info.genres.length > 0) {
        for (const name of info.genres) {
            const genre = document.createElement("div");
    
            genre.className = "genre-card";
            genre.innerText = name;
    
            genres.append(genre);
        }
        
        misc.append(genres);
    } else {
        misc.append(notice.cloneNode(true));
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

            if (reviewSlides && reviewSlides.length !== 0) {
                reviewSlides = splitArray(info.reviews, config.reviews.split[desktop ? "desktop" : "mobile"]);

                reviewIndex = reviewIndex === 0 ? 0 : desktop
                    ? Math.round((reviewIndex + 1) / (config.reviews.split.desktop / config.reviews.split.mobile)) - 1
                    : Math.round((reviewIndex + 1) * (config.reviews.split.desktop / config.reviews.split.mobile)) - 2;

                setReviews(reviewIndex);
            }
        }
    }

    function cleanup() {
        if (info.cast) unloadImages(info.cast.map((p) => p.image));
        if (info.seasons) unloadImages(info.seasons.map((s) => s.episodes.map((e) => e.image)).flat(1));
    }

    onWindowResize(checkResize);

    if (castSlides) {
        setCast(castIndex);

        castPrevious.addEventListener("click", setCastPrevious);
        castNext.addEventListener("click", setCastNext);

        castTitle.append(castControl);
        cast.append(castCards);
    } else {
        cast.append(notice.cloneNode(true));
    }

    if (reviewSlides) {
        setReviews(reviewIndex);

        reviewsPrevious.addEventListener("click", setReviewPrevious);
        reviewsNext.addEventListener("click", setReviewNext);

        reviewsTitle.append(reviewsControl);
        reviews.append(reviewCards);
    } else {
        reviews.append(notice.cloneNode(true));
    }

    if (info.type === "tv") {
        left.append(seasons);
    }

    left.append(description);
    left.append(cast);
    left.append(reviews);

    right.append(misc);

    watch.append(video);
    watch.append(details);

    setModal(info.title, watch, "arrow-left", true);
    checkCurrentlyPlaying();
    showModal(cleanup);
}

function initializeWatchModalCheck() {
    async function handleHashChange() {
        const modalHash = getHash("modal");

        if (modalHash) {
            const [modalType, type, id] = modalHash.split("-");

            if (modalType === "watch") {
                const info = await getDetails(type, id);

                if (info && info.title) {
                    if (info.cast) preloadImages(info.cast.map((p) => p.image));
                    if (info.seasons) preloadImages(info.seasons.map((s) => s.episodes.map((e) => e.image)).flat(1));

                    modal(info);
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