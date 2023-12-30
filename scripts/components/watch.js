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

    let reviewSlides;
    let reviewIndex;

    if (info.reviews && info.reviews.length !== 0) {
        reviewSlides = splitArray(info.reviews, config.reviews.split[desktop ? "desktop" : "mobile"]);
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

    left.append(description);
    left.append(cast);
    left.append(reviews);

    right.append(misc);

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

                if (info && info.title) {
                    if (info.cast) preloadImages(info.cast.map((p) => p.image));

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