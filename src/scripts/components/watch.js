import { getQuery, onQueryChange, setQuery, removeQuery } from "../query.js";
import { setModal, showModal, changeHeaderText, hideModal } from "./modal.js";
import { getDetails } from "../tmdb/details.js";
import { elementExists, onWindowResize, removeWindowResize, splitArray } from "../functions.js";
import { config, providers } from "../config.js";
import { getProvider } from "../store/provider.js";
import { preloadImages, getNonCachedImages, unloadImages } from "../cache.js";
import { getLastPlayed, setLastPlayed } from "../store/last-played.js"; 
import { addContinueWatching, isInContinueWatching, removeFromContinueWatching } from "../store/continue.js";
import { getWatchSection } from "../store/watch-sections.js";
import { getThemeAbsolute } from "../store/theme.js";
import { initializeArea } from "./area.js";

export function watchContent(type, id) {
    setQuery(config.query.modal, `${type === "movie" ? "m" : "s"}-${id}`);
}

function modal(info, recommendationImages) {
    addContinueWatching(info.id, info.type, info.title, info.image);

    if (isInContinueWatching(info.id, info.type)) {
        const headerButtons = document.querySelector(".modal-header .header-buttons");
        const customButtons = headerButtons.querySelectorAll(".custom");

        for (const button of Array.from(customButtons)) {
            button.remove();
        }

        if (headerButtons) {
            const button = document.createElement("div");
            const buttonIcon = document.createElement("i");

            button.className = "button secondary icon-only custom";
            buttonIcon.className = "icon icon-eye-slash";

            button.addEventListener("click", function () {
                removeFromContinueWatching(info.id, info.type);
                button.remove();
            });

            button.append(buttonIcon);
            headerButtons.prepend(button);
        }
    }

    const videoActive = getWatchSection("Video");
    const seasonsActive = getWatchSection("Seasons");
    const descriptionActive = getWatchSection("Description");
    const castActive = getWatchSection("Cast");
    const reviewsActive = getWatchSection("Reviews");
    const miscActive = getWatchSection("Misc");
    const recommendationsActive = getWatchSection("Recommendations");

    let desktop = window.innerWidth > config.cast.split.max;

    let castSlides;
    let castIndex = 0;

    if (castActive && info.cast && info.cast.length !== 0) {
        castSlides = splitArray(info.cast, config.cast.split[desktop ? "desktop" : "mobile"]);
    }

    let reviewSlides;
    let reviewIndex;

    if (reviewsActive && info.reviews && info.reviews.length !== 0) {
        reviewSlides = splitArray(info.reviews, config.reviews.split[desktop ? "desktop" : "mobile"]);
    }

    let seasonNumber;
    let episodeNumber;

    if (info.type === "tv") {
        const lastPlayed = getLastPlayed(info.id);

        seasonNumber = lastPlayed.s;
        episodeNumber = lastPlayed.e;
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

    const recommendations = document.createElement("div");
    const recommendationsTitle = document.createElement("div");
    const recommendationsTitleIcon = document.createElement("i");
    const recommendationsTitleText = document.createElement("span");
    const recommendationsArea = document.createElement("div");

    watch.className = "watch";

    notice.className = "notice active";
    noticeIcon.className = "icon icon-eye-slash";
    noticeText.className = "text";
    noticeText.innerText = "Not found";

    notice.append(noticeIcon);
    notice.append(noticeText);

    const videoNoticeContainer = document.createElement("div");
    const videoNotice = notice.cloneNode();
    const videoNoticeIcon = noticeIcon.cloneNode();
    const videoNoticeText = noticeText.cloneNode();

    videoNoticeContainer.className = "video-notice";
    videoNoticeIcon.className = "icon icon-sync";
    videoNoticeText.innerText = "Content loading";

    videoNotice.append(videoNoticeIcon);
    videoNotice.append(videoNoticeText);
    videoNoticeContainer.append(videoNotice);

    video.className = "video";
    iframe.className = "iframe";
    iframe.setAttribute("allowfullscreen", true);

    video.append(iframe);
    video.append(videoNoticeContainer);

    function playVideo() {
        videoNoticeIcon.className = "icon icon-sync";
        videoNoticeText.innerText = "Content loading";
        iframe.classList.remove("active");

        const provider = providers[getProvider()];
        const supportsThemes = provider.supportsThemes;

        if (supportsThemes) {
            const theme = getThemeAbsolute();

            iframe.src = info.type === "movie"
                ? provider.movieUrl(info.id, theme)
                : provider.showUrl(info.id, seasonNumber, episodeNumber, theme);
        } else {
            iframe.src = info.type === "movie"
                ? provider.movieUrl(info.id)
                : provider.showUrl(info.id, seasonNumber, episodeNumber);
        }

        video.classList[supportsThemes ? "add" : "remove"]("theme");
        videoNoticeContainer.classList.add("active");

        iframe.addEventListener("load", function () {
            videoNoticeContainer.classList.remove("active");
            iframe.classList.add("active");
        });
    }

    if (videoActive) playVideo();

    details.className = videoActive ? "details" : "details no-video";
    left.className = "left container";
    right.className = "right container";

    details.append(left);
    details.append(right);

    seasons.className = "details-card";
    seasonsTitle.className = "title";
    seasonsTitleIcon.className = "icon icon-list";
    seasonsTitleText.className = "text";
    seasonsTitleText.innerText = "Seasons";
    seasonCards.className = "season-cards";

    seasonsTitle.append(seasonsTitleIcon);
    seasonsTitle.append(seasonsTitleText);
    seasons.append(seasonsTitle);
    
    function hideSeasons() {
        const seasons = seasonCards.querySelectorAll(".season-card.active");
        const icons = seasonCards.querySelectorAll(".icon.icon-arrow-up");

        for (const season of Array.from(seasons)) {
            season.classList.remove("active");
        }

        for (const icon of Array.from(icons)) {
            icon.className = "icon icon-arrow-down";
        }
    }

    function showSeason(season) {
        const isActive = season.classList.contains("active");
        hideSeasons();

        if (!isActive) {
            const icon = season.querySelector(".fa-arrow-down");

            if (icon) icon.className = "icon icon-arrow-up";
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
        if (info.type === "movie" || info.type === "tv" && !videoActive) {
            changeHeaderText(info.title, null, info.type);
            document.title = info.title;
        } else {
            changeHeaderText(info.title, `S${seasonNumber} E${episodeNumber}`, info.type);
            document.title = `${info.title} (S${seasonNumber} E${episodeNumber})`;
        }
    }

    function playSeries(dontScroll) {
        setLastPlayed(info.id, seasonNumber, episodeNumber);
        checkCurrentlyPlaying();

        playVideo();
        if (!dontScroll) video.scrollIntoView({ block: "end" });
    }

    let playEpisodeCallbacks = [];
    let playEpisodeLock = false;
    let playEpisodeEpisode;

    function playEpisode(sNumber, eNumber, episode, dontScroll) {
        if (!videoActive) return;

        seasonNumber = sNumber;
        episodeNumber = eNumber;
        if (episode) playEpisodeEpisode = episode;

        if (playEpisodeLock) return;
        playEpisodeLock = true;

        iframe.src = "";

        setTimeout(function () {
            playEpisodeLock = false;

            if (playEpisodeEpisode) {
                setEpisode(playEpisodeEpisode);
                playEpisodeEpisode = null;
            }

            playSeries(dontScroll);

            for (const callback of playEpisodeCallbacks) {
                callback();
            }
        }, 10);
    }

    function getNextEpisode() {
        const seasonIndex = info.seasons.findIndex((s) => s.number === seasonNumber);
        if (seasonIndex === -1) return;

        const episodeIndex = info.seasons[seasonIndex].episodes.findIndex((e) => e.number === episodeNumber);
        if (episodeIndex === -1) return;

        let nextSeasonIndex = seasonIndex;
        let nextEpisodeIndex = episodeIndex + 1;

        if (nextEpisodeIndex >= info.seasons[seasonIndex].episodes.length) {
            nextSeasonIndex = seasonIndex + 1;
            nextEpisodeIndex = 0;
        }

        if (nextSeasonIndex >= info.seasons.length) return;

        const nextSeasonNumber = info.seasons[nextSeasonIndex].number;
        const nextEpisodeNumber = info.seasons[nextSeasonIndex].episodes[nextEpisodeIndex].number;

        return { s: nextSeasonNumber, e: nextEpisodeNumber, sIndex: nextSeasonIndex, eIndex: nextEpisodeIndex };
    }

    function getPreviousEpisode() {
        const seasonIndex = info.seasons.findIndex((s) => s.number === seasonNumber);
        if (seasonIndex === -1) return;

        const episodeIndex = info.seasons[seasonIndex].episodes.findIndex((e) => e.number === episodeNumber);
        if (episodeIndex === -1) return;

        let nextSeasonIndex = seasonIndex;
        let nextEpisodeIndex = episodeIndex - 1;

        if (nextEpisodeIndex < 0) {
            nextSeasonIndex = seasonIndex - 1;
            if (!info.seasons[nextSeasonIndex]) return;

            nextEpisodeIndex = info.seasons[nextSeasonIndex].episodes.length - 1;
            if (!info.seasons[nextSeasonIndex].episodes[nextEpisodeIndex]) return;
        }

        const nextSeasonNumber = info.seasons[nextSeasonIndex].number;
        const nextEpisodeNumber = info.seasons[nextSeasonIndex].episodes[nextEpisodeIndex].number;

        return { s: nextSeasonNumber, e: nextEpisodeNumber, sIndex: nextSeasonIndex, eIndex: nextEpisodeIndex };
    }

    if (seasonsActive && info.seasons && info.seasons.length > 0) {
        info.seasons.forEach(function (season) {
            const card = document.createElement("div");
            const title = document.createElement("div");
            const name = document.createElement("span");
            const amount = document.createElement("span");
            const button = document.createElement("div");
            const buttonIcon = document.createElement("i");
            const episodes = document.createElement("div");

            card.className = (videoActive && season.number === seasonNumber) ? "season-card active" : "season-card";
            title.className = "season-title";
            name.className = "name";
            name.innerText = `Season ${season.numberPadded}`;
            amount.className = "amount";
            amount.innerText = `${season.episodes.length} episodes`;
            button.className = "button secondary icon-only";
            buttonIcon.className = `icon icon-${(videoActive && season.number === seasonNumber) ? "arrow-up" : "arrow-down"}`;

            button.append(buttonIcon);

            button.addEventListener("click", function () {
                showSeason(card);
            });

            title.append(name);
            title.append(amount);
            title.append(button);

            episodes.className = "episodes";

            season.episodes.forEach(function (episodeInfo) {
                const episode = document.createElement("div");
                const episodeLeft = document.createElement("div");
                const episodeRight = document.createElement("div");

                const episodeNumberText = document.createElement("span");
                const episodePreviewContainer = document.createElement("div");
                const episodePreviewImage = document.createElement("img");

                const episodeTitle = document.createElement("div");
                const episodeTitleText = document.createElement("span");
                const episodeTitleTime = document.createElement("div");
                const episodeTitleTimeIcon = document.createElement("i");
                const episodeTitleTimeText = document.createElement("span");
                const episodeDescription = document.createElement("span");

                episode.className = (videoActive && season.number === seasonNumber && episodeInfo.number === episodeNumber) ? "episode active" : "episode";
                episodeLeft.className = "episode-left";
                episodeRight.className = "episode-right";

                episode.addEventListener("click", function () {
                    if (videoActive) playEpisode(season.number, episodeInfo.number, episode);
                });

                episodeNumberText.className = "number";
                episodeNumberText.innerText = episodeInfo.numberPadded;
                episodePreviewContainer.className = "preview";
                episodePreviewImage.className = "image";
                
                if (episodeInfo.image) {
                    episodePreviewImage.src = episodeInfo.image;
                }

                if (episodeInfo.name) {
                    episodePreviewImage.alt = episodeInfo.name;
                }
                
                episodePreviewContainer.append(episodePreviewImage);

                episodeTitle.className = "episode-title";
                episodeTitleText.className = "name";
                episodeTitleText.innerText = episodeInfo.name;
                episodeTitleTime.className = "time";
                episodeTitleTimeIcon.className = "icon icon-clock";
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

                episodeLeft.append(episodeNumberText);
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

    if (info.type === "tv" && videoActive) {
        const showControl = document.createElement("div");
        const buttonPrevious = document.createElement("div");
        const buttonPreviousIcon = document.createElement("i");
        const buttonNext = document.createElement("div");
        const buttonNextIcon = document.createElement("i");

        showControl.className = "show-control";
        buttonPrevious.className = getPreviousEpisode() ? "button secondary icon-only" : "button secondary icon-only inactive";
        buttonPreviousIcon.className = "icon icon-arrow-left";
        buttonNext.className = getNextEpisode() ? "button secondary icon-only" : "button secondary icon-only inactive";
        buttonNextIcon.className = "icon icon-arrow-right";

        function checkShowControl() {
            const previous = getPreviousEpisode();
            const next = getNextEpisode();

            buttonPrevious.classList[previous ? "remove" : "add"]("inactive");
            buttonNext.classList[next ? "remove" : "add"]("inactive");

            showControl.classList[(previous || next) ? "remove" : "add"]("inactive");
        }

        playEpisodeCallbacks.push(checkShowControl);

        function showControlChange(next) {
            const episode = next ? getNextEpisode() : getPreviousEpisode();

            if (episode) {
                if (seasonsActive) {
                    const seasonCard = Array.from(seasonCards.children)[episode.sIndex];
                    const seasonCardEpisodes = seasonCard ? seasonCard.querySelector(".episodes") : null;
                    const episodeCard = seasonCardEpisodes ? Array.from(seasonCardEpisodes.children)[episode.eIndex] : null;

                    if (episodeCard) {
                        playEpisode(episode.s, episode.e, episodeCard, true);

                        hideSeasons();
                        seasonCard.classList.add("active");

                        const seasonCardIcon = seasonCard.querySelector(".fa-arrow-down");
                        if (seasonCardIcon) seasonCardIcon.className = "icon icon-arrow-up";
                    }
                } else {
                    playEpisode(episode.s, episode.e, null, true);
                }
            }

            checkShowControl();
        }

        buttonPrevious.addEventListener("click", function () {
            showControlChange(false);
        });

        buttonNext.addEventListener("click", function () {
            showControlChange(true);
        });

        buttonPrevious.append(buttonPreviousIcon);
        buttonNext.append(buttonNextIcon);

        showControl.append(buttonPrevious);
        showControl.append(buttonNext);

        video.append(showControl);
    }

    description.className = "details-card";
    descriptionTitle.className = "title";
    descriptionTitleIcon.className = "icon icon-file";
    descriptionTitleText.className = "text";
    descriptionTitleText.innerText = "Description";
    descriptionText.className = "text";
    descriptionText.innerText = info.description;

    descriptionTitle.append(descriptionTitleIcon);
    descriptionTitle.append(descriptionTitleText);
    description.append(descriptionTitle);
    
    if (info.description && descriptionActive) {
        description.append(descriptionText);
    } else {
        description.append(notice.cloneNode(true));
    }

    cast.className = "details-card";
    castTitle.className = "title";
    castTitleIcon.className = "icon icon-group";
    castTitleText.className = "text";
    castTitleText.innerText = "Cast";
    castControl.className = "control";
    castPrevious.className = "button secondary icon-only previous";
    castPreviousIcon.className = "icon icon-arrow-left";
    castIndicators.className = "indicators";
    castNext.className = "button secondary icon-only next";
    castNextIcon.className = "icon icon-arrow-right";
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
        image.alt = info.name;
        
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
    reviewsTitleIcon.className = "icon icon-bookmark";
    reviewsTitleText.className = "text";
    reviewsTitleText.innerText = "Reviews";
    reviewsControl.className = "control";
    reviewsPrevious.className = "button secondary icon-only previous";
    reviewsPreviousIcon.className = "icon icon-arrow-left";
    reviewsIndicators.className = "indicators";
    reviewsNext.className = "button secondary icon-only next";
    reviewsNextIcon.className = "icon icon-arrow-right";
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
        const titleContainer = document.createElement("div");
        const titleAvatar = document.createElement("div");
        const titleAvatarImage = document.createElement("img");
        const titleText = document.createElement("span");

        const rating = document.createElement("div");
        const stars = document.createElement("div");
        const starsAmount = document.createElement("div");

        const content = document.createElement("span");

        review.className = "review-card";
        title.className = "review-title";
        titleContainer.className = "title-container";

        if (info.avatar) {
            titleAvatar.className = "avatar";
            titleAvatarImage.className = "image";
            titleAvatarImage.src = info.avatar;
        }

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
            starIcon.className = "icon icon-star";

            star.append(starIcon);
            stars.append(star);
        }

        rating.append(stars);
        rating.append(starsAmount);

        if (info.avatar) {
            titleAvatar.append(titleAvatarImage);
            titleContainer.append(titleAvatar);
        }

        titleContainer.append(titleText);
        title.append(titleContainer);
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
    releasedTitleIcon.className = "icon icon-calendar";
    releasedTitleText.className = "text";
    releasedTitleText.innerText = info.type === "movie" ? "Released" : "First Aired";
    releasedText.className = "text";
    releasedText.innerText = info.date;

    releasedTitle.append(releasedTitleIcon);
    releasedTitle.append(releasedTitleText);
    misc.append(releasedTitle);

    if (miscActive && info.date) {
        misc.append(releasedText);
    } else {
        misc.append(notice.cloneNode(true));
    }

    ratingTitle.className = "title";
    ratingTitleIcon.className = "icon icon-star";
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
        starIcon.className = "icon icon-star";

        star.append(starIcon);
        ratingStars.append(star);
    }

    ratingContainer.append(ratingStars);
    ratingContainer.append(ratingStarsAmount);

    if (miscActive && info.rating && info.stars) {
        misc.append(ratingContainer);
    } else {
        misc.append(notice.cloneNode(true));
    }

    genresTitle.className = "title";
    genresTitleIcon.className = "icon icon-tags";
    genresTitleText.className = "text";
    genresTitleText.innerText = "Genres";
    genres.className = "genre-cards";

    genresTitle.append(genresTitleIcon);
    genresTitle.append(genresTitleText);
    misc.append(genresTitle);

    if (miscActive && info.genres && info.genres.length > 0) {
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

    recommendations.className = "details-card";
    recommendationsTitle.className = "title";
    recommendationsTitleIcon.className = "icon icon-check";
    recommendationsTitleText.className = "text";
    recommendationsTitleText.innerText = "Recommendations";
    recommendationsArea.className = "area minimal";

    recommendationsTitle.append(recommendationsTitleIcon);
    recommendationsTitle.append(recommendationsTitleText);
    recommendations.append(recommendationsTitle);
    
    if (recommendationsActive && info.recommendations && info.recommendations.length > 0) {
        initializeArea(recommendationsArea, info.recommendations, "", null, config.recommendations.split);

        const control = recommendationsArea.querySelector(".control");
        if (control) recommendationsTitle.append(control);

        const label = recommendationsArea.querySelector(".label");
        if (control) label.remove();

        recommendations.append(recommendationsArea);
    } else {
        recommendations.append(notice.cloneNode(true));
    }

    function checkResize() {
        if (!elementExists(watch)) return removeWindowResize(checkResize);
        const newDesktop = window.innerWidth > config.cast.split.max;

        if (desktop !== newDesktop) {
            desktop = newDesktop;
            
            if (castActive && castSlides && castSlides.length !== 0) {
                castSlides = splitArray(info.cast, config.cast.split[desktop ? "desktop" : "mobile"]);

                castIndex = castIndex === 0 ? 0 : desktop
                    ? Math.round((castIndex + 1) / (config.cast.split.desktop / config.cast.split.mobile)) - 1
                    : Math.round((castIndex + 1) * (config.cast.split.desktop / config.cast.split.mobile)) - 2;

                setCast(castIndex);
            }

            if (reviewsActive && reviewSlides && reviewSlides.length !== 0) {
                reviewSlides = splitArray(info.reviews, config.reviews.split[desktop ? "desktop" : "mobile"]);

                reviewIndex = reviewIndex === 0 ? 0 : desktop
                    ? Math.round((reviewIndex + 1) / (config.reviews.split.desktop / config.reviews.split.mobile)) - 1
                    : Math.round((reviewIndex + 1) * (config.reviews.split.desktop / config.reviews.split.mobile)) - 2;

                setReviews(reviewIndex);
            }
        }
    }

    function cleanup() {
        if (seasonsActive && info.seasons) unloadImages(info.seasons.map((s) => s.episodes.map((e) => e.image)).flat(1));
        if (castActive && info.cast) unloadImages(info.cast.map((p) => p.image));
        if (reviewsActive && info.reviews) unloadImages(info.reviews.filter((r) => r.avatar).map((r) => r.avatar));
        if (recommendationsActive && recommendationImages) unloadImages(recommendationImages, true);
    }

    onWindowResize(checkResize);

    if (castActive && castSlides) {
        setCast(castIndex);

        castPrevious.addEventListener("click", setCastPrevious);
        castNext.addEventListener("click", setCastNext);

        castTitle.append(castControl);
        cast.append(castCards);
    } else {
        cast.append(notice.cloneNode(true));
    }

    if (reviewsActive && reviewSlides) {
        setReviews(reviewIndex);

        reviewsPrevious.addEventListener("click", setReviewPrevious);
        reviewsNext.addEventListener("click", setReviewNext);

        reviewsTitle.append(reviewsControl);
        reviews.append(reviewCards);
    } else {
        reviews.append(notice.cloneNode(true));
    }

    if (info.type === "tv" && seasonsActive) {
        left.append(seasons);
    }

    if (descriptionActive) left.append(description);
    if (castActive) left.append(cast);
    if (reviewsActive) left.append(reviews);

    if (left.childElementCount === 0) {
        right.classList.add("full-width");
        left.remove();
    }

    if (miscActive) right.append(misc);
    if (recommendationsActive) right.append(recommendations);

    if (right.childElementCount === 0) {
        if (left) left.classList.add("full-width");
        right.remove();
    }

    if (videoActive) watch.append(video);
    if ((left.childElementCount + right.childElementCount) !== 0) watch.append(details);

    setModal(info.title, null, watch, "times", true, info.type);
    checkCurrentlyPlaying();
    showModal(cleanup);
}

function initializeWatchModalCheck() {
    async function handleQueryChange() {
        const modalQuery = getQuery(config.query.modal);

        if (modalQuery) {
            const [type, id] = modalQuery.split("-");

            if (type !== "g" && config.modal.validTypes.includes(type)) {
                hideModal(true);
                
                const info = await getDetails(type === "m" ? "movie" : "tv", id);

                if (info && info.title) {
                    let recommendationImages = [];

                    if (info.seasons && getWatchSection("Seasons")) preloadImages(info.seasons.map((s) => s.episodes.map((e) => e.image)).flat(1));
                    if (info.cast && getWatchSection("Cast")) preloadImages(info.cast.map((p) => p.image));
                    if (info.reviews && getWatchSection("Reviews")) preloadImages(info.reviews.filter((r) => r.avatar).map((r) => r.avatar));

                    if (info.recommendations && getWatchSection("Recommendations")) {
                        recommendationImages = getNonCachedImages(info.recommendations.map((r) => r.image));
                        preloadImages(recommendationImages, null, true);
                    }

                    modal(info, recommendationImages);
                } else {
                    removeQuery(config.query.modal);
                }
            }
        }
    }

    handleQueryChange();
    onQueryChange(handleQueryChange);
}

export function initializeWatch() {
    initializeWatchModalCheck();
}