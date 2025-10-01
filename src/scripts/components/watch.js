import {
  setQueries,
  getQuery,
  removeQueries,
  onQueryChange,
} from "../query.js";
import {
  setModal,
  showModal,
  changeHeaderText,
  hideModal,
  setCustomButtons,
} from "./modal.js";
import { getDetails } from "../api/details.js";
import {
  elementExists,
  onWindowResize,
  removeWindowResize,
  splitArray,
  onKeyPress,
  onSwipe,
  checkElement,
} from "../functions.js";
import { config } from "../config.js";
import { getProvider, setProvider } from "../store/provider.js";
import { preloadImages, getNonCachedImages, unloadImages } from "../cache.js";
import { getLastPlayed, setLastPlayed } from "../store/last-played.js";
import { addContinueWatching } from "../store/continue.js";
import { getWatchSection } from "../store/watch-sections.js";
import { initializeArea } from "./area.js";
import { toggleDim } from "./dim.js";
import { getDownloads, constructMagnet } from "../downloadsApi/download.js";
import { getSearchResults } from "../api/search.js";
import { getProviders } from "../store/providers.js";
import { parseProvider } from "./providers.js";

function getSeasonAndEpisode(id) {
  try {
    const season = parseInt(getQuery(config.query.season));
    const episode = parseInt(getQuery(config.query.episode));

    if (season && episode) {
      setLastPlayed(id, season, episode);
      return { s: season, e: episode };
    }
  } catch { }

  return getLastPlayed(id);
}

export function watchContent(type, id, ignore) {
  const modal = `${type === "movie" ? "m" : "s"}-${id}`;

  if (type === "tv") {
    const { s, e } = !ignore ? getSeasonAndEpisode(id) : getLastPlayed(id);

    setQueries({
      [config.query.modal]: modal,
      ...(getWatchSection("Video")
        ? {
          [config.query.season]: s,
          [config.query.episode]: e,
        }
        : {}),
      [config.query.query]: null,
    });
  } else {
    setQueries({
      [config.query.modal]: modal,
      [config.query.query]: null,
    });
  }
}

function modal(info, recommendationImages) {
  addContinueWatching(info.id, info.type, info.title, info.image);

  const videoActive = getWatchSection("Video");
  const trailerActive = getWatchSection("Trailer");
  const downloadActive = getWatchSection("Download");
  const providersActive = getWatchSection("Providers");
  const seasonsActive = getWatchSection("Seasons");
  const descriptionActive = getWatchSection("Description");
  const castActive = getWatchSection("Cast");
  const crewActive = getWatchSection("Crew");
  const reviewsActive = getWatchSection("Reviews");
  const miscActive = getWatchSection("Misc");
  const recommendationsActive = getWatchSection("Recommendations");

  let castDesktop = window.innerWidth > config.cast.split.max;
  let crewDesktop = window.innerWidth > config.crew.split.max;
  let reviewsDesktop = window.innerWidth > config.reviews.split.max;

  let castSlides;
  let castIndex = 0;

  if (castActive && info.cast && info.cast.length !== 0) {
    castSlides = splitArray(
      info.cast,
      config.cast.split[castDesktop ? "desktop" : "mobile"],
    );
  }

  let crewSlides;
  let crewIndex = 0;

  if (crewActive && info.crew && info.crew.length !== 0) {
    crewSlides = splitArray(
      info.crew,
      config.crew.split[crewDesktop ? "desktop" : "mobile"],
    );
  }

  let reviewSlides;
  let reviewIndex;

  if (reviewsActive && info.reviews && info.reviews.length !== 0) {
    reviewSlides = splitArray(
      info.reviews,
      config.reviews.split[reviewsDesktop ? "desktop" : "mobile"],
    );
  }

  let customButtons = [];

  const notice = document.createElement("div");
  const noticeIcon = document.createElement("i");
  const noticeText = document.createElement("span");

  const watch = document.createElement("div");
  const video = document.createElement("div");
  const backdrop = document.createElement("img");
  const backdropVignette = document.createElement("div");
  const iframe = document.createElement("iframe");

  const trailer = document.createElement("div");
  const trailerIframe = document.createElement("iframe");

  const downloadsContainer = document.createElement("div");
  const downloadsList = document.createElement("div");

  const details = document.createElement("div");
  const left = document.createElement("div");
  const right = document.createElement("div");

  const providersElem = document.createElement("div");
  const providersTitle = document.createElement("div");
  const providersTitleIcon = document.createElement("i");
  const providersTitleText = document.createElement("span");
  const providersControl = document.createElement("div");
  const providersRefresh = document.createElement("div");
  const providersRefreshIcon = document.createElement("i");
  const providersSelect = document.createElement("select");

  const seasons = document.createElement("div");
  const seasonsTitle = document.createElement("div");
  const seasonsTitleIcon = document.createElement("i");
  const seasonsTitleText = document.createElement("span");
  const seasonsControl = document.createElement("div");
  const seasonsPrevious = document.createElement("div");
  const seasonsPreviousIcon = document.createElement("i");
  const seasonsNext = document.createElement("div");
  const seasonsNextIcon = document.createElement("i");
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

  const crew = document.createElement("div");
  const crewTitle = document.createElement("div");
  const crewTitleIcon = document.createElement("i");
  const crewTitleText = document.createElement("span");
  const crewControl = document.createElement("div");
  const crewPrevious = document.createElement("div");
  const crewPreviousIcon = document.createElement("i");
  const crewIndicators = document.createElement("div");
  const crewNext = document.createElement("div");
  const crewNextIcon = document.createElement("i");
  const crewCards = document.createElement("div");

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
  const miscLeft = document.createElement("div");
  const miscRight = document.createElement("div");

  const releasedTitle = document.createElement("div");
  const releasedTitleIcon = document.createElement("i");
  const releasedTitleText = document.createElement("span");
  const releasedText = document.createElement("p");

  const languageTitle = document.createElement("div");
  const languageTitleIcon = document.createElement("i");
  const languageTitleText = document.createElement("span");
  const languageText = document.createElement("p");

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
  watch.setAttribute("media-type", info.type);
  watch.setAttribute("media-id", info.id);

  let seasonNumber;
  let episodeNumber;

  function setSeasonAndEpisode(season, episode) {
    seasonNumber = season;
    episodeNumber = episode;

    watch.setAttribute("media-season", season);
    watch.setAttribute("media-episode", episode);

    setQueries({
      [config.query.season]: season,
      [config.query.episode]: episode,
    });
  }

  if (info.type === "tv" && videoActive) {
    const { s, e } = getSeasonAndEpisode(info.id);
    setSeasonAndEpisode(s, e);
  }

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
  video.append(videoNoticeContainer);

  backdrop.className = "backdrop";
  if (info.backdrop) backdrop.src = info.backdrop;
  backdrop.alt = info.title;
  if (info.backdrop) video.append(backdrop);

  backdropVignette.className = "vignette";
  if (info.backdrop) video.append(backdropVignette);

  function toggleBackdrop(toggle) {
    backdrop.classList[toggle ? "add" : "remove"]("active");
    backdropVignette.classList[toggle ? "add" : "remove"]("active");
  }

  if (videoActive) {
    function show() {
      video.scrollIntoView({ block: "end" });
    }

    onKeyPress("v", true, null, watch, show);
  }

  let hasIframe = false;
  let currentIframe;

  let disabled = false;
  let seasonsDisabled = false;

  let providers = [];

  function getCurrentProvider() {
    const providerId = getProvider();
    return providers.find(({ id }) => id === providerId) || providers[0];
  }

  function videoAlert(toggle, icon, text) {
    videoNoticeIcon.className = `icon icon-${icon || "sync"}`;
    videoNoticeText.innerHTML = text || "";
    videoNoticeContainer.classList[toggle ? "add" : "remove"]("active");
  }

  function cleanVideo() {
    if (currentIframe) currentIframe.remove();
    currentIframe = null;
    hasIframe = false;
  }

  async function checkProviders() {
    providers = [];

    disabled = true;
    seasonsDisabled = true;

    providersElem.classList.add("disabled");
    seasons.classList.add("disabled");

    cleanVideo();
    providersSelect.innerHTML = "<option selected disabled>...</option>";

    toggleBackdrop(true);

    async function providersCheck() {
      videoAlert(true, "tv", "Fetching Providers");

      const _info = {
        type: info.type,
        id: info.id,
        imdbId: info.imdbId,
        season: seasonNumber,
        episode: episodeNumber,
      };

      providers = getProviders().map((provider) => ({
        id: provider.id,
        name: provider.name || provider.base,
        url: parseProvider(provider, _info),
      }));
    }

    await providersCheck();

    providersSelect.innerHTML = "";

    if (providers.length > 0) {
      providers.forEach(function ({ id, name }) {
        const provider = document.createElement("option");

        provider.value = id;
        provider.innerText = name;

        providersSelect.append(provider);
      });

      providersSelect.value = getCurrentProvider().id;
      providersElem.classList.remove("disabled");

      disabled = false;
      playVideo();
    } else {
      videoAlert(true, "censor", "No Providers");
    }

    seasonsDisabled = false;
    seasons.classList.remove("disabled");
  }

  function playVideo() {
    if (disabled) return;
    cleanVideo();

    const provider = getCurrentProvider();
    const response = provider.url;

    toggleBackdrop(true);
    videoAlert(true, "sync", "Loading Content");

    currentIframe = iframe.cloneNode();
    currentIframe.src = response;

    video.append(currentIframe);

    checkElement(
      currentIframe,
      () => !hasIframe,
      refresh,
      config.retryLoadAfter,
    );

    currentIframe.addEventListener("load", function () {
      videoAlert(false);
      toggleBackdrop(false);
      hasIframe = true;
      currentIframe.classList.add("active");
    });
  }

  if (trailerActive && info.trailer) {
    let currentTrailerIframe;

    trailer.className = "trailer";
    trailer.addEventListener("click", function (e) {
      if (e.target === trailer) {
        trailer.classList.remove("active");

        if (currentTrailerIframe) {
          currentTrailerIframe.remove();
          currentTrailerIframe = trailerIframe.cloneNode();
          trailer.append(currentTrailerIframe);
        }
      }
    });

    trailerIframe.className = "iframe";
    trailerIframe.setAttribute("allowfullscreen", true);
    trailerIframe.src = info.trailer;

    currentTrailerIframe = trailerIframe.cloneNode();
    trailer.append(currentTrailerIframe);

    customButtons.push({
      icon: "camera",
      callback: function () {
        trailer.classList.add("active");
      },
    });
  }

  let fetchedDownloads;

  async function checkDownloads() {
    if (info.type !== "movie" && !videoActive) return;
    if (!fetchedDownloads)
      fetchedDownloads = await getDownloads(info.type, info.imdbId);

    let downloads = fetchedDownloads;
    const seasonString = seasonNumber?.toString();
    const episodeString = episodeNumber?.toString();
    if (info.type !== "movie")
      downloads = downloads.filter(
        (d) => d.season === seasonString && d.episode === episodeString,
      );

    if (downloads && Array.isArray(downloads) && downloads.length > 0) {
      downloadsContainer.className = "downloads";
      downloadsList.className = "torrents";

      downloadsContainer.addEventListener("click", function (e) {
        if (e.target === downloadsContainer) {
          downloadsContainer.classList.remove("active");
        }
      });

      downloadsList.innerHTML = "";

      for (const download of downloads) {
        const magnet = constructMagnet(
          download.hash,
          info.type === "movie"
            ? `${info.title} (${download.type}, ${download.quality}, ${download.size})`
            : `${download.title} (S${download.season} E${download.episode}, ${download.size})`,
        );
        const downloadElement = document.createElement("div");
        const downloadIcon = document.createElement("i");
        const downloadText = document.createElement("p");
        const downloadType = document.createElement("span");
        const downloadQuality = document.createElement("span");
        const downloadSize = document.createElement("span");

        downloadIcon.className = "icon-magnet";
        downloadType.className = "type";
        downloadQuality.className = "quality";
        downloadSize.className = "size";
        downloadText.innerText = "Magnet";
        downloadType.innerText =
          info.type === "movie"
            ? download.type
            : download.title.replace(/^.*?(S\d+E\d+)/, "");
        downloadSize.innerText = download.size;

        if (info.type === "movie") {
          downloadQuality.innerText = download.quality;
        }

        downloadElement.className = "download";
        downloadElement.addEventListener("click", function () {
          window.location.href = magnet;
        });

        if (info.type === "movie") {
          downloadElement.append(
            downloadIcon,
            downloadText,
            downloadType,
            downloadQuality,
            downloadSize,
          );
        } else {
          downloadElement.append(
            downloadIcon,
            downloadText,
            downloadType,
            downloadSize,
          );
        }

        downloadsList.append(downloadElement);
      }

      downloadsContainer.append(downloadsList);
      watch.append(downloadsContainer);

      customButtons = customButtons.filter((b) => b.icon !== "download");
      customButtons.push({
        icon: "download",
        callback: function () {
          downloadsContainer.classList.add("active");
        },
      });

      setCustomButtons(customButtons);
    } else if (customButtons.find((b) => b.icon === "download")) {
      customButtons = customButtons.filter((b) => b.icon !== "download");
      setCustomButtons(customButtons);
    }
  }

  if (downloadActive && info.imdbId) {
    checkDownloads();
  }

  details.className = videoActive ? "details" : "details no-video";
  left.className = "left container";
  right.className = "right container";

  details.append(left);
  details.append(right);

  providersElem.className = "details-card";
  providersTitle.className = "title";
  providersTitleIcon.className = "icon icon-tv";
  providersTitleText.className = "text";
  providersTitleText.innerText = "Provider";
  providersControl.className = "control";
  providersRefresh.className = "button secondary icon-only";
  providersRefreshIcon.className = "icon icon-sync";
  providersSelect.className = "select";

  providersTitle.append(providersTitleIcon);
  providersTitle.append(providersTitleText);
  providersElem.append(providersTitle);
  providersElem.append(providersSelect);

  providersRefresh.append(providersRefreshIcon);
  providersControl.append(providersRefresh);

  function refresh() {
    if (disabled) return;

    playVideo();
    video.scrollIntoView({ block: "end" });
  }

  if (videoActive) {
    checkProviders();

    function providerSet(index) {
      if (disabled) return;

      setProvider(index);
      playVideo();
      video.scrollIntoView({ block: "end" });
    }

    function nextProvider() {
      if (disabled) return;

      const provider = getCurrentProvider();
      const providers = Array.from(providersSelect.children);

      const providerElem = providers.find((p) => p.value === provider.id);
      const index = providerElem && providers.indexOf(providerElem);
      const next = index !== -1 && providers[index + 1];

      if (next) {
        providersSelect.value = next.value;
        providerSet(next.value);
      }
    }

    function previousProvider() {
      if (disabled) return;

      const provider = getCurrentProvider();
      const providers = Array.from(providersSelect.children);

      const providerElem = providers.find((p) => p.value === provider.id);
      const index = providerElem && providers.indexOf(providerElem);
      const previous = index !== -1 && providers[index - 1];

      if (previous) {
        providersSelect.value = previous.value;
        providerSet(previous.value);
      }
    }

    providersTitle.append(providersControl);
    providersSelect.addEventListener("change", function () {
      const selected = providersSelect.selectedOptions[0];
      if (selected) providerSet(selected.value);
    });

    providersRefresh.addEventListener("click", refresh);
    onKeyPress("r", true, null, watch, refresh);

    onKeyPress("+", true, null, watch, nextProvider);
    onKeyPress("=", true, null, watch, nextProvider);
    onKeyPress("-", true, null, watch, previousProvider);
  }

  seasons.className = "details-card";
  if (disabled) seasons.classList.add("disabled");
  seasonsTitle.className = "title";
  seasonsTitleIcon.className = "icon icon-list";
  seasonsTitleText.className = "text";
  seasonsTitleText.innerText = "Seasons";
  seasonsControl.className = "control season-control";
  seasonsPrevious.className = "button secondary icon-only previous";
  seasonsPreviousIcon.className = "icon icon-arrow-left";
  seasonsNext.className = "button secondary icon-only next";
  seasonsNextIcon.className = "icon icon-arrow-right";
  seasonCards.className = "season-cards";

  seasonsTitle.append(seasonsTitleIcon);
  seasonsTitle.append(seasonsTitleText);
  seasons.append(seasonsTitle);

  seasonsPrevious.append(seasonsPreviousIcon);
  seasonsNext.append(seasonsNextIcon);

  seasonsControl.append(seasonsPrevious);
  seasonsControl.append(seasonsNext);

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
      const icon = season.querySelector(".icon-arrow-down");

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
    checkProviders();
  }

  function checkCurrentlyPlaying() {
    let newTitle;

    if (info.type === "movie" || (info.type === "tv" && !videoActive)) {
      changeHeaderText(info.title, null, info.type);
      newTitle = info.title;
    } else {
      changeHeaderText(
        info.title,
        `S${seasonNumber} E${episodeNumber}`,
        info.type,
      );
      newTitle = `${info.title} (S${seasonNumber} E${episodeNumber})`;
    }

    if (newTitle && document.title !== newTitle) document.title = newTitle;
  }

  function playSeries() {
    setLastPlayed(info.id, seasonNumber, episodeNumber);
    checkCurrentlyPlaying();
    video.scrollIntoView({ block: "end" });
  }

  let playEpisodeCallbacks = [];

  function playEpisode(sNumber, eNumber, episode) {
    if (!videoActive || seasonsDisabled) return;
    setSeasonAndEpisode(sNumber, eNumber);

    if (downloadActive && info.imdbId) {
      checkDownloads();
    }

    if (episode) setEpisode(episode);
    else checkProviders();

    playSeries();

    for (const callback of playEpisodeCallbacks) {
      callback();
    }
  }

  function getNextEpisode() {
    const seasonIndex = info.seasons.findIndex(
      (s) => s.number === seasonNumber,
    );
    if (seasonIndex === -1) return;

    const episodeIndex = info.seasons[seasonIndex].episodes.findIndex(
      (e) => e.number === episodeNumber,
    );
    if (episodeIndex === -1) return;

    let nextSeasonIndex = seasonIndex;
    let nextEpisodeIndex = episodeIndex + 1;

    if (nextEpisodeIndex >= info.seasons[seasonIndex].episodes.length) {
      nextSeasonIndex = seasonIndex + 1;
      nextEpisodeIndex = 0;
    }

    if (nextSeasonIndex >= info.seasons.length) return;

    const nextSeasonNumber = info.seasons[nextSeasonIndex].number;
    const nextEpisodeNumber =
      info.seasons[nextSeasonIndex].episodes[nextEpisodeIndex].number;

    return {
      s: nextSeasonNumber,
      e: nextEpisodeNumber,
      sIndex: nextSeasonIndex,
      eIndex: nextEpisodeIndex,
    };
  }

  function getPreviousEpisode() {
    const seasonIndex = info.seasons.findIndex(
      (s) => s.number === seasonNumber,
    );
    if (seasonIndex === -1) return;

    const episodeIndex = info.seasons[seasonIndex].episodes.findIndex(
      (e) => e.number === episodeNumber,
    );
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
    const nextEpisodeNumber =
      info.seasons[nextSeasonIndex].episodes[nextEpisodeIndex].number;

    return {
      s: nextSeasonNumber,
      e: nextEpisodeNumber,
      sIndex: nextSeasonIndex,
      eIndex: nextEpisodeIndex,
    };
  }

  function checkSeasonControl() {
    const previous = getPreviousEpisode();
    const next = getNextEpisode();

    seasonsPrevious.classList[previous ? "remove" : "add"]("inactive");
    seasonsNext.classList[next ? "remove" : "add"]("inactive");

    seasonsControl.classList[previous || next ? "remove" : "add"]("inactive");
  }

  function seasonControlChange(next) {
    const episode = next ? getNextEpisode() : getPreviousEpisode();

    if (episode) {
      if (seasonsActive) {
        const seasonCard = Array.from(seasonCards.children)[episode.sIndex];
        const seasonCardEpisodes = seasonCard
          ? seasonCard.querySelector(".episodes")
          : null;
        const episodeCard = seasonCardEpisodes
          ? Array.from(seasonCardEpisodes.children)[episode.eIndex]
          : null;

        if (episodeCard) {
          playEpisode(episode.s, episode.e, episodeCard);

          hideSeasons();
          seasonCard.classList.add("active");

          const seasonCardIcon = seasonCard.querySelector(".icon-arrow-down");
          if (seasonCardIcon) seasonCardIcon.className = "icon icon-arrow-up";
        }
      } else {
        playEpisode(episode.s, episode.e);
      }
    }

    checkSeasonControl();
  }

  function nextEpisode() {
    if (seasonsDisabled) return;
    seasonControlChange(true);
  }

  function previousEpisode() {
    if (seasonsDisabled) return;
    seasonControlChange(false);
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

      card.className =
        videoActive && season.number === seasonNumber
          ? "season-card active"
          : "season-card";
      title.className = "season-title";
      name.className = "name";
      name.innerText = `Season ${season.numberPadded}`;
      amount.className = "amount";
      amount.innerText = `${season.episodes.length} episodes`;
      button.className = "button secondary icon-only";
      buttonIcon.className = `icon icon-${videoActive && season.number === seasonNumber ? "arrow-up" : "arrow-down"}`;

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

        episode.className =
          videoActive &&
            season.number === seasonNumber &&
            episodeInfo.number === episodeNumber
            ? "episode active"
            : "episode";
        episodeLeft.className = "episode-left";
        episodeRight.className = "episode-right";

        episode.addEventListener("click", function () {
          if (videoActive)
            playEpisode(season.number, episodeInfo.number, episode);
        });

        episodeNumberText.className = "number";
        episodeNumberText.innerText = episodeInfo.numberPadded;
        episodePreviewContainer.className = "preview";
        episodePreviewImage.className = "image";

        if (episodeInfo.image) {
          episodePreviewImage.src = episodeInfo.image;
        } else {
          episodePreviewContainer.append(notice.cloneNode(true));
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

  if (videoActive) {
    playEpisodeCallbacks.push(checkSeasonControl);
    checkSeasonControl();

    seasonsNext.addEventListener("click", nextEpisode);
    seasonsPrevious.addEventListener("click", previousEpisode);

    onKeyPress("]", true, null, watch, nextEpisode);
    onKeyPress("[", true, null, watch, previousEpisode);

    seasonsTitle.append(seasonsControl);
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
    const text = document.createElement("div");
    const name = document.createElement("span");
    const character = document.createElement("span");

    cast.className = "cast-card";
    image.className = "image";
    if (info.image) image.src = info.image;
    image.alt = info.name;
    text.className = "text";
    name.className = "cast-name";
    name.innerText = info.name;
    character.className = "cast-character";
    character.innerText = info.character;

    text.append(name);
    text.append(character);

    if (info.image) cast.append(image);
    cast.append(text);
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
    const newIndex = castSlides[castIndex - 1]
      ? castIndex - 1
      : castSlides.length - 1;

    if (castIndex !== newIndex) setCast(newIndex);
  }

  function setCastNext() {
    const newIndex = castSlides[castIndex + 1] ? castIndex + 1 : 0;
    if (castIndex !== newIndex) setCast(newIndex);
  }

  crew.className = "details-card";
  crewTitle.className = "title";
  crewTitleIcon.className = "icon icon-group";
  crewTitleText.className = "text";
  crewTitleText.innerText = "Crew";
  crewControl.className = "control";
  crewPrevious.className = "button secondary icon-only previous";
  crewPreviousIcon.className = "icon icon-arrow-left";
  crewIndicators.className = "indicators";
  crewNext.className = "button secondary icon-only next";
  crewNextIcon.className = "icon icon-arrow-right";
  crewCards.className = "crew-cards";

  crewTitle.append(crewTitleIcon);
  crewTitle.append(crewTitleText);
  crew.append(crewTitle);

  crewPrevious.append(crewPreviousIcon);
  crewNext.append(crewNextIcon);

  crewControl.append(crewPrevious);
  crewControl.append(crewIndicators);
  crewControl.append(crewNext);

  function addCrew(info) {
    const crew = document.createElement("div");
    const image = document.createElement("img");
    const text = document.createElement("div");
    const name = document.createElement("span");
    const job = document.createElement("span");

    crew.className = "crew-card";
    image.className = "image";
    if (info.image) image.src = info.image;
    image.alt = info.name;
    text.className = "text";
    name.className = "crew-name";
    name.innerText = info.name;
    job.className = "crew-job";
    job.innerText = info.job;

    text.append(name);
    text.append(job);

    if (info.image) crew.append(image);
    crew.append(text);
    crew.addEventListener("click", function () {
      window.open(info.url);
    });

    crewCards.append(crew);
  }

  function setCrewIndicators() {
    crewIndicators.innerHTML = "";

    crewSlides.forEach(function (_, i) {
      const indicator = document.createElement("div");

      indicator.className = crewIndex === i ? "indicator active" : "indicator";
      indicator.addEventListener("click", function () {
        setCrew(i);
      });

      crewIndicators.append(indicator);
    });
  }

  function setCrew(newIndex) {
    crewIndex = crewSlides[newIndex] ? newIndex : 0;
    const slide = crewSlides[crewIndex];

    crewCards.innerHTML = "";
    slide.forEach(addCrew);

    setCrewIndicators();
  }

  function setCrewPrevious() {
    const newIndex = crewSlides[crewIndex - 1]
      ? crewIndex - 1
      : crewSlides.length - 1;

    if (crewIndex !== newIndex) setCrew(newIndex);
  }

  function setCrewNext() {
    const newIndex = crewSlides[crewIndex + 1] ? crewIndex + 1 : 0;
    if (crewIndex !== newIndex) setCrew(newIndex);
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

      const floored = Math.floor(info.rating);
      const decimal = info.rating - floored;

      if (i < floored) star.className = "star fill";
      else if (decimal >= 0.5 && i === floored)
        star.className = "star half-fill";
      else star.className = "star";

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
    if (info.rating) title.append(rating);

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

      indicator.className =
        reviewIndex === i ? "indicator active" : "indicator";
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
    const newIndex = reviewSlides[reviewIndex - 1]
      ? reviewIndex - 1
      : reviewSlides.length - 1;

    if (reviewIndex !== newIndex) setReviews(newIndex);
  }

  function setReviewNext() {
    const newIndex = reviewSlides[reviewIndex + 1] ? reviewIndex + 1 : 0;
    if (reviewIndex !== newIndex) setReviews(newIndex);
  }

  misc.className = "details-card misc";
  misc.append(miscLeft);
  misc.append(miscRight);

  languageTitle.className = "title";
  languageTitleIcon.className = "icon icon-language";
  languageTitleText.className = "text";
  languageTitleText.innerText = "Language";
  languageText.className = "text";
  languageText.innerText = info.language;

  languageTitle.append(languageTitleIcon);
  languageTitle.append(languageTitleText);
  miscLeft.append(languageTitle);

  if (miscActive && info.language) {
    miscLeft.append(languageText);
  } else {
    miscLeft.append(notice.cloneNode(true));
  }

  releasedTitle.className = "title";
  releasedTitleIcon.className = "icon icon-calendar";
  releasedTitleText.className = "text";
  releasedTitleText.innerText =
    info.type === "movie" ? "Released" : "First Aired";
  releasedText.className = "text";
  releasedText.innerText = info.date;

  releasedTitle.append(releasedTitleIcon);
  releasedTitle.append(releasedTitleText);
  miscRight.append(releasedTitle);

  if (miscActive && info.date) {
    miscRight.append(releasedText);
  } else {
    miscRight.append(notice.cloneNode(true));
  }

  ratingTitle.className = "title";
  ratingTitleIcon.className = "icon icon-star";
  ratingTitleText.className = "text";
  ratingTitleText.innerText = "Rating";

  ratingTitle.append(ratingTitleIcon);
  ratingTitle.append(ratingTitleText);
  miscLeft.append(ratingTitle);

  ratingContainer.className = "rating";
  ratingStars.className = "stars";
  ratingStarsAmount.className = "amount rating-text";
  ratingStarsAmount.innerText = info.stars;

  for (var i = 0; i < 5; i++) {
    const star = document.createElement("div");
    const starIcon = document.createElement("i");

    const floored = Math.floor(info.rating);
    const decimal = info.rating - floored;

    if (i < floored) star.className = "star fill";
    else if (decimal >= 0.5 && i === floored) star.className = "star half-fill";
    else star.className = "star";

    starIcon.className = "icon icon-star";

    star.append(starIcon);
    ratingStars.append(star);
  }

  ratingContainer.append(ratingStars);
  ratingContainer.append(ratingStarsAmount);

  if (miscActive && info.rating && info.stars) {
    miscLeft.append(ratingContainer);
  } else {
    miscLeft.append(notice.cloneNode(true));
  }

  genresTitle.className = "title";
  genresTitleIcon.className = "icon icon-tags";
  genresTitleText.className = "text";
  genresTitleText.innerText = "Genres";
  genres.className = "genre-cards";

  genresTitle.append(genresTitleIcon);
  genresTitle.append(genresTitleText);
  miscRight.append(genresTitle);

  if (miscActive && info.genres && info.genres.length > 0) {
    for (const name of info.genres) {
      const genre = document.createElement("div");

      genre.className = "genre-card";
      genre.innerText = name;

      genres.append(genre);
    }

    miscRight.append(genres);
  } else {
    miscRight.append(notice.cloneNode(true));
  }

  recommendations.className = "details-card";
  recommendationsTitle.className = "title";
  recommendationsTitleIcon.className = "icon icon-film";
  recommendationsTitleText.className = "text";
  recommendationsTitleText.innerText = "Watch Next";
  recommendationsArea.className = "area minimal";

  recommendationsTitle.append(recommendationsTitleIcon);
  recommendationsTitle.append(recommendationsTitleText);
  recommendations.append(recommendationsTitle);

  if (
    recommendationsActive &&
    info.recommendations &&
    info.recommendations.length > 0
  ) {
    initializeArea(
      recommendationsArea,
      info.recommendations,
      "",
      null,
      config.recommendations.split,
      false,
    );

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
    const newCastDesktop = window.innerWidth > config.cast.split.max;
    const newCrewDesktop = window.innerWidth > config.crew.split.max;
    const newReviewsDesktop = window.innerWidth > config.reviews.split.max;

    if (castDesktop !== newCastDesktop) {
      castDesktop = newCastDesktop;

      if (castActive && castSlides && castSlides.length !== 0) {
        castSlides = splitArray(
          info.cast,
          config.cast.split[castDesktop ? "desktop" : "mobile"],
        );

        castIndex =
          castIndex === 0
            ? 0
            : castDesktop
              ? Math.round(
                (castIndex + 1) /
                (config.cast.split.desktop / config.cast.split.mobile),
              ) - 1
              : Math.round(
                (castIndex + 1) *
                (config.cast.split.desktop / config.cast.split.mobile),
              ) - 2;

        setCast(castIndex);
      }
    }

    if (crewDesktop !== newCrewDesktop) {
      crewDesktop = newCrewDesktop;

      if (crewActive && crewSlides && crewSlides.length !== 0) {
        crewSlides = splitArray(
          info.crew,
          config.crew.split[crewDesktop ? "desktop" : "mobile"],
        );

        crewIndex =
          crewIndex === 0
            ? 0
            : crewDesktop
              ? Math.round(
                (crewIndex + 1) /
                (config.crew.split.desktop / config.crew.split.mobile),
              ) - 1
              : Math.round(
                (crewIndex + 1) *
                (config.crew.split.desktop / config.crew.split.mobile),
              ) - 2;

        setCrew(crewIndex);
      }
    }

    if (reviewsDesktop !== newReviewsDesktop) {
      reviewsDesktop = newReviewsDesktop;

      if (reviewsActive && reviewSlides && reviewSlides.length !== 0) {
        reviewSlides = splitArray(
          info.reviews,
          config.reviews.split[reviewsDesktop ? "desktop" : "mobile"],
        );

        reviewIndex =
          reviewIndex === 0
            ? 0
            : reviewsDesktop
              ? Math.round(
                (reviewIndex + 1) /
                (config.reviews.split.desktop /
                  config.reviews.split.mobile),
              ) - 1
              : Math.round(
                (reviewIndex + 1) *
                (config.reviews.split.desktop /
                  config.reviews.split.mobile),
              ) - 2;

        setReviews(reviewIndex);
      }
    }
  }

  function cleanup(_modal) {
    if (videoActive && info.backdrop) unloadImages([info.backdrop]);
    if (seasonsActive && info.seasons) unloadImages(info.seasons.map((s) => s.episodes.map((e) => e.image)).flat(1));
    if (castActive && info.cast) unloadImages(info.cast.map((p) => p.image));
    if (crewActive && info.crew) unloadImages(info.crew.map((p) => p.image));
    if (reviewsActive && info.reviews)
      unloadImages(info.reviews.filter((r) => r.avatar).map((r) => r.avatar));
    if (recommendationsActive && recommendationImages)
      unloadImages(recommendationImages);
  }

  onWindowResize(checkResize);

  if (castActive && castSlides) {
    setCast(castIndex);

    castPrevious.addEventListener("click", setCastPrevious);
    castNext.addEventListener("click", setCastNext);

    onSwipe(castCards, function (right) {
      if (right) setCastNext();
      else setCastPrevious();
    });

    castTitle.append(castControl);
    cast.append(castCards);
  } else {
    cast.append(notice.cloneNode(true));
  }

  if (crewActive && crewSlides) {
    setCrew(crewIndex);

    crewPrevious.addEventListener("click", setCrewPrevious);
    crewNext.addEventListener("click", setCrewNext);

    onSwipe(crewCards, function (right) {
      if (right) setCrewNext();
      else setCrewPrevious();
    });

    crewTitle.append(crewControl);
    crew.append(crewCards);
  } else {
    crew.append(notice.cloneNode(true));
  }

  if (reviewsActive && reviewSlides) {
    setReviews(reviewIndex);

    reviewsPrevious.addEventListener("click", setReviewPrevious);
    reviewsNext.addEventListener("click", setReviewNext);

    onSwipe(reviewCards, function (right) {
      if (right) setReviewNext();
      else setReviewPrevious();
    });

    reviewsTitle.append(reviewsControl);
    reviews.append(reviewCards);
  } else {
    reviews.append(notice.cloneNode(true));
  }

  if (videoActive && providersActive) {
    left.append(providersElem);
  }

  if (info.type === "tv" && seasonsActive) {
    left.append(seasons);
  }

  if (descriptionActive) left.append(description);
  if (castActive) left.append(cast);
  if (crewActive) left.append(crew);
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
  if (trailerActive && info.trailer) watch.append(trailer);

  if (left.childElementCount + right.childElementCount !== 0)
    watch.append(details);
  else watch.classList.add("only-video");

  setCustomButtons(customButtons);
  setModal(
    info.title,
    null,
    watch,
    "times",
    info.type,
    videoActive ? "has-video" : null,
  );
  checkCurrentlyPlaying();
  showModal(cleanup);

  if (videoActive) {
    video.scrollIntoView({ block: "end" });
  }
}

function initializeWatchModalCheck() {
  async function handleQueryChange() {
    const modalQuery = getQuery(config.query.modal);

    if (modalQuery) {
      const [type, id] = modalQuery.split("-");

      if (
        !["g", "p"].includes(type) &&
        config.modal.validTypes.includes(type)
      ) {
        const _type = type === "m" ? "movie" : "tv";
        const watch = document.querySelector(".modal-content > .watch");
        const watchInfo = watch && {
          id: watch.getAttribute("media-id"),
          type: watch.getAttribute("media-type"),
          season: watch.getAttribute("media-season"),
          episode: watch.getAttribute("media-episode"),
        };

        if (watchInfo && id === watchInfo.id && type === watchInfo.type) {
          if (type === "movie") return;

          const { s, e } = getSeasonAndEpisode(id);
          if (s === watchInfo.season && e === watchInfo.episode) return;
        }

        hideModal(true, true);
        toggleDim(true);

        const info = await getDetails(_type, id);

        if (info && info.title) {
          let recommendationImages = [];
          if (info.recommendations && getWatchSection("Recommendations"))
            recommendationImages = getNonCachedImages(info.recommendations.map((r) => r.image));
          if (info.backdrop && getWatchSection("Video"))
            preloadImages([info.backdrop]);
          if (info.cast && getWatchSection("Cast"))
            preloadImages(info.cast.map((p) => p.image));
          if (info.crew && getWatchSection("Crew"))
            preloadImages(info.crew.map((p) => p.image));
          if (info.reviews && getWatchSection("Reviews"))
            preloadImages(info.reviews.filter((r) => r.avatar).map((r) => r.avatar));
          preloadImages(recommendationImages);

          modal(info, recommendationImages);
        } else {
          removeQueries(
            config.query.modal,
            config.query.season,
            config.query.episode,
          );
        }

        toggleDim(false);
      }
    }
  }

  handleQueryChange();
  onQueryChange(handleQueryChange);
}

async function forceWatch(query) {
  const searchResults = await getSearchResults(query);

  if (searchResults && searchResults.length > 0) {
    const result = searchResults[0];
    if (result.type && result.id) watchContent(result.type, result.id);
  }
}

function checkForceWatch() {
  const watchQuery = getQuery(config.query.watch);

  if (watchQuery) {
    forceWatch(watchQuery);
    setQueries(
      {
        [config.query.watch]: null,
        [config.query.season]: null,
        [config.query.episode]: null,
      },
      true,
    );
  }
}

export function initializeWatch() {
  initializeWatchModalCheck();
  checkForceWatch();
}
