import { getQuery, onQueryChange, setQuery, removeQuery } from "../query.js";
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
  promiseTimeout,
  onSwipe,
} from "../functions.js";
import { config, proxies, proxy as proxyConfig } from "../config.js";
import { getProvider, setProvider } from "../store/provider.js";
import { preloadImages, getNonCachedImages, unloadImages } from "../cache.js";
import { getLastPlayed, setLastPlayed } from "../store/last-played.js";
import { addContinueWatching } from "../store/continue.js";
import { getWatchSection } from "../store/watch-sections.js";
import { initializeArea } from "./area.js";
import { getProviders } from "../api/proxy.js";
import { toggleDim } from "./dim.js";
import { getDownloads, constructMagnet } from "../downloadsApi/download.js";
import { providers as _providers } from "../../../../api/src/config.js";
import { getMode } from "../store/mode.js";
import { isOnline } from "../functions.js";

const online = isOnline();

export function watchContent(type, id) {
  setQuery(config.query.modal, `${type === "movie" ? "m" : "s"}-${id}`);
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
  const reviewsActive = getWatchSection("Reviews");
  const miscActive = getWatchSection("Misc");
  const recommendationsActive = getWatchSection("Recommendations");

  let desktop = window.innerWidth > config.cast.split.max;

  let castSlides;
  let castIndex = 0;

  if (castActive && info.cast && info.cast.length !== 0) {
    castSlides = splitArray(
      info.cast,
      config.cast.split[desktop ? "desktop" : "mobile"],
    );
  }

  let reviewSlides;
  let reviewIndex;

  if (reviewsActive && info.reviews && info.reviews.length !== 0) {
    reviewSlides = splitArray(
      info.reviews,
      config.reviews.split[desktop ? "desktop" : "mobile"],
    );
  }

  let seasonNumber;
  let episodeNumber;

  if (info.type === "tv") {
    const lastPlayed = getLastPlayed(info.id);

    seasonNumber = lastPlayed.s;
    episodeNumber = lastPlayed.e;
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
  const _player = document.createElement("div");

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
  iframe.setAttribute("allow", "autoplay");
  _player.className = "player";
  video.append(videoNoticeContainer);

  backdrop.className = "backdrop";
  backdrop.src = info.backdrop;
  backdrop.alt = info.title;
  if (info.backdrop) video.append(backdrop);

  backdropVignette.className = "vignette";
  if (info.backdrop) video.append(backdropVignette);

  function toggleBackdrop(toggle) {
    backdrop.classList[toggle ? "add" : "remove"]("active");
    backdropVignette.classList[toggle ? "add" : "remove"]("active");
  }

  let hasPlayer = false;

  if (videoActive) {
    function show() {
      video.scrollIntoView({ block: hasPlayer ? "center" : "end" });
    }

    onKeyPress("v", true, null, watch, show);
  }

  let currentIframe;
  let currentPlayer;

  let disabled = false;
  let seasonsDisabled = false;

  let providers = [];

  function getCurrentProvider() {
    return providers.find((p) => p.name === getProvider()) || providers[0];
  }

  function videoAlert(toggle, icon, text) {
    videoNoticeIcon.className = `icon icon-${icon || "sync"}`;
    videoNoticeText.innerHTML = text || "";
    videoNoticeContainer.classList[toggle ? "add" : "remove"]("active");
  }

  const mode = getMode();

  async function checkProviders() {
    providers = [];

    disabled = true;
    seasonsDisabled = true;

    providersElem.classList.add("disabled");
    seasons.classList.add("disabled");

    if (currentIframe) currentIframe.remove();
    if (currentPlayer) currentPlayer.remove();
    providersSelect.innerHTML = "<option selected disabled>...</option>";

    toggleBackdrop(true);

    async function providersCheck() {
      videoAlert(true, "tv", "Fetching Providers");

      async function fetchProvidersProxy() {
        const promises = Object.values(proxies).map(function (proxy) {
          return new Promise(async function (res, rej) {
            const providers = await getProviders(
              proxy,
              info,
              seasonNumber,
              episodeNumber,
            );

            if (providers) res(providers);
            else rej();
          });
        });

        return await Promise.any([
          ...promises,
          promiseTimeout(proxyConfig.checkTimeout),
        ]);
      }

      async function fetchProvidersLocal() {
        const promises = _providers
          .filter((provider) => online || provider.online !== true)
          .map(async function (provider) {
            const _info = {
              id: info.id,
              imdbId: info.imdbId,
              season: seasonNumber,
              episode: episodeNumber,
            };

            return {
              name: provider.base,
              type: provider.type,
              online: provider.online || false,
              [provider.type]:
                provider[provider.type]?.constructor?.name === "AsyncFunction"
                  ? await provider[provider.type](info.type, _info)
                  : provider[provider.type](info.type, _info),
            };
          });

        return (await Promise.all(promises))
          .filter((provider) => online || provider.online !== true)
          .filter(
            (provider) => ![undefined, null].includes(provider[provider.type]),
          );
      }

      const fetchProviders =
        mode === "proxy" ? fetchProvidersProxy : fetchProvidersLocal;

      providers = (await fetchProviders()).filter(
        (provider) =>
          typeof VenomPlayer !== "undefined" || provider.type !== "data",
      );

      if (getProvider() === null && providers[0]) {
        setProvider(providers[0]);
      }
    }

    await providersCheck();

    providersSelect.innerHTML = "";

    if (providers.length > 0) {
      providers.forEach(function ({ name }) {
        const provider = document.createElement("option");

        provider.value = name.toLowerCase();
        provider.innerText = name;

        providersSelect.append(provider);
      });

      providersSelect.value = getCurrentProvider().name;
      providersElem.classList.remove("disabled");

      disabled = false;
      playVideo();
    } else {
      videoAlert(true, "censor", "Not Available");
    }

    seasonsDisabled = false;
    seasons.classList.remove("disabled");
  }

  let player = null;
  let playerFullscreen = false;

  function destroyPlayer() {
    try {
      if (player) {
        player.destroy();
      }
    } catch {}

    player = null;
    playerFullscreen = false;
    clearPlayerIntervals();
  }

  function setPlayerButtons() {
    try {
      const topRight = currentPlayer.querySelector(".top-right_1_I7J");
      topRight.innerHTML = "";

      const closeButton = {
        icon: "times",
        callback: function () {
          destroyPlayer();
          hideModal();
        },
      };
      const buttons = playerFullscreen
        ? [closeButton]
        : [closeButton, ...customButtons];

      buttons.reverse().forEach(function ({ icon, callback }) {
        const button = document.createElement("i");
        button.className = `button_1_nBS icon_3zeDf icon-${icon}`;
        button.addEventListener("click", callback);
        topRight.append(button);
      });
    } catch {}
  }

  function setPlayerSeasonButtons() {
    try {
      if (info.type !== "tv") return;

      const topLeft = currentPlayer.querySelector(".top-left_2-xxL");
      const buttons = [];

      buttons.push({
        icon: "arrow-left",
        callback: previousEpisode,
        disabled: [undefined, null].includes(getPreviousEpisode()),
      });

      buttons.push({
        icon: "arrow-right",
        callback: nextEpisode,
        disabled: [undefined, null].includes(getNextEpisode()),
      });

      buttons.forEach(function ({ icon, callback, disabled }) {
        const button = document.createElement("i");
        button.className = `button_1_nBS icon_3zeDf icon-${icon}`;
        if (disabled) button.classList.add("disabled");
        else button.addEventListener("click", callback);
        topLeft.append(button);
      });
    } catch {}
  }

  let playerReadyInterval;
  let playerErrorInterval;

  function clearPlayerReadyInterval() {
    if (playerReadyInterval) clearInterval(playerReadyInterval);
    playerReadyInterval = null;
  }

  function clearPlayerErrorInterval() {
    if (playerErrorInterval) clearInterval(playerErrorInterval);
    playerErrorInterval = null;
  }

  function clearPlayerIntervals() {
    clearPlayerReadyInterval();
    clearPlayerErrorInterval();
  }

  function initializePlayer(
    { dash, hls, audio, subtitles, qualities },
    onReady,
  ) {
    localStorage.setItem("player.cc", "Off");
    localStorage.setItem("player.isCountdown", false);
    localStorage.setItem("player.muted", false);
    localStorage.setItem("player.speed", "1");
    localStorage.setItem("player.withTotal", true);

    const englishAudio = (audio.names || []).find(function (_name) {
      const name = _name.toLowerCase();
      return (
        (name.startsWith("eng") || name.includes("original")) &&
        !name.includes("commentary")
      );
    });
    if (englishAudio) {
      localStorage.setItem("player.track", englishAudio);
    }

    const highestQuality = Math.max(...Object.values(qualities || []));
    if (highestQuality) {
      localStorage.setItem("player.quality", highestQuality);
    }

    playerFullscreen = false;
    player = VenomPlayer.make({
      publicPath: "https://cdn.jsdelivr.net/npm/venom-player@0.2.88/dist/",
      container: currentPlayer,
      id:
        info.type === "movie"
          ? `m${info.id}`
          : `s${info.id}${seasonNumber}${episodeNumber}`,
      title:
        info.type === "movie"
          ? info.title
          : `${info.title} (S${seasonNumber} E${episodeNumber})`,
      source: {
        dash: dash === "" ? undefined : dash,
        hls: hls === "" ? undefined : hls,
        audio,
        cc: subtitles,
      },
      hlsNativeQuality: false,
      hlsNativeParam: true,
      qualityByWidth: qualities,
      soundBlock: "delete",
      autoLandscape: true,
      ui: {
        pip: true,
        share: false,
        timeline: true,
        prevNext: true,
        about: false,
      },
      cssVars: {
        "color-primary":
          getComputedStyle(document.body)?.getPropertyValue("--primary") ||
          "#e12323",
        "background-color-primary": "rgba(26, 26, 26, 0.75)",
      },
      speed: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
      trackProgress: 30,
      replay: false,
    });

    player.on("fullscreenEnter", function () {
      playerFullscreen = true;
      setPlayerButtons();
    });

    player.on("fullscreenExit", function () {
      playerFullscreen = false;
      setPlayerButtons();
    });

    function ready() {
      setPlayerButtons();
      setPlayerSeasonButtons();

      try {
        player.play();

        const playerElement = currentPlayer.querySelector(".player_1JR0Q");
        playerElement.classList.add("user-active");

        function removeUserActive() {
          if (playerElement.classList.contains("user-active")) {
            playerElement.classList.remove("user-active");
          }
        }

        setTimeout(removeUserActive, 3000);
        onKeyPress("escape", true, null, playerElement, removeUserActive);
      } catch {}

      onReady();

      clearPlayerErrorInterval();
      playerErrorInterval = setInterval(function () {
        if (!elementExists(currentPlayer)) {
          clearPlayerErrorInterval();
          return;
        }

        try {
          const errorElements = currentPlayer.querySelectorAll(".error_3plQ2");
          const hasError = Array.from(errorElements).some(
            (e) => !e.classList.contains("hidden_1uh6Y"),
          );

          if (hasError) {
            clearPlayerErrorInterval();
            refresh();
          }
        } catch {}
      }, 100);

      const timeQuery = getQuery(config.query.time);

      if (timeQuery) {
        removeQuery(config.query.time);
      }
    }

    const requiredPlayerElements = [
      "video",
      ".player_1JR0Q",
      ".top-right_1_I7J",
      ".top-left_2-xxL",
    ];

    clearPlayerReadyInterval();
    playerReadyInterval = setInterval(function () {
      if (!elementExists(currentPlayer)) {
        clearPlayerReadyInterval();
      } else if (
        !requiredPlayerElements
          .map((e) => currentPlayer.querySelector(e))
          .includes(null)
      ) {
        ready();
        clearPlayerReadyInterval();
      }
    }, 10);

    setTimeout(function () {
      if (elementExists(currentPlayer) && !hasPlayer) {
        refresh();
      }
    }, 1000);
  }

  function playVideo() {
    if (disabled) return;
    if (currentIframe) currentIframe.remove();
    if (currentPlayer) currentPlayer.remove();
    if (hasPlayer) hasPlayer = false;
    if (watch.parentElement?.parentElement)
      watch.parentElement.parentElement.classList.remove("has-player");
    destroyPlayer();

    const provider = getCurrentProvider();
    const response = provider[provider.type];

    toggleBackdrop(true);
    videoAlert(true, "sync", "Loading Content");

    if (provider.type === "url") {
      currentIframe = iframe.cloneNode();
      currentIframe.src = response;

      video.append(currentIframe);
      currentIframe.addEventListener("load", function () {
        videoAlert(false);
        toggleBackdrop(false);
        currentIframe.classList.add("active");
      });
    } else {
      currentPlayer = _player.cloneNode();
      video.append(currentPlayer);
      initializePlayer(response, function () {
        videoAlert(false);
        toggleBackdrop(false);
        hasPlayer = true;
        if (watch.parentElement?.parentElement)
          watch.parentElement.parentElement.classList.add("has-player");
        currentPlayer.classList.add("active");
      });
    }
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
      setPlayerButtons();
    } else if (customButtons.find((b) => b.icon === "download")) {
      customButtons = customButtons.filter((b) => b.icon !== "download");
      setCustomButtons(customButtons);
      setPlayerButtons();
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
    video.scrollIntoView({ block: hasPlayer ? "center" : "end" });
  }

  if (videoActive) {
    checkProviders();

    function providerSet(name) {
      if (disabled) return;

      setProvider(name);
      playVideo();
      video.scrollIntoView({ block: hasPlayer ? "center" : "end" });
    }

    function nextProvider() {
      if (disabled) return;

      const provider = getCurrentProvider();
      const providers = Array.from(providersSelect.children);

      const providerElem = providers.find((p) => p.value === provider.name);
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

      const providerElem = providers.find((p) => p.value === provider.name);
      const index = providerElem && providers.indexOf(providerElem);
      const previous = index !== -1 && providers[index - 1];

      if (previous) {
        providersSelect.value = previous.value;
        providerSet(previous.value);
      }
    }

    providersTitle.append(providersControl);
    providersSelect.addEventListener("change", function () {
      providerSet(providersSelect.value);
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
    video.scrollIntoView({ block: hasPlayer ? "center" : "end" });
  }

  let playEpisodeCallbacks = [];

  function playEpisode(sNumber, eNumber, episode) {
    if (!videoActive || seasonsDisabled) return;

    seasonNumber = sNumber;
    episodeNumber = eNumber;

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
    setReviews(
      reviewSlides[reviewIndex - 1] ? reviewIndex - 1 : reviewSlides.length - 1,
    );
  }

  function setReviewNext() {
    setReviews(reviewSlides[reviewIndex + 1] ? reviewIndex + 1 : 0);
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
  recommendationsTitleIcon.className = "icon icon-check";
  recommendationsTitleText.className = "text";
  recommendationsTitleText.innerText = "Recommendations";
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
    const newDesktop = window.innerWidth > config.cast.split.max;

    if (desktop !== newDesktop) {
      desktop = newDesktop;

      if (castActive && castSlides && castSlides.length !== 0) {
        castSlides = splitArray(
          info.cast,
          config.cast.split[desktop ? "desktop" : "mobile"],
        );

        castIndex =
          castIndex === 0
            ? 0
            : desktop
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

      if (reviewsActive && reviewSlides && reviewSlides.length !== 0) {
        reviewSlides = splitArray(
          info.reviews,
          config.reviews.split[desktop ? "desktop" : "mobile"],
        );

        reviewIndex =
          reviewIndex === 0
            ? 0
            : desktop
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

  function cleanup(modal) {
    if (modal) modal.classList.remove("has-player");

    if (videoActive && info.backdrop) unloadImages([info.backdrop]);
    if (seasonsActive && info.seasons)
      unloadImages(
        info.seasons.map((s) => s.episodes.map((e) => e.image)).flat(1),
      );
    if (castActive && info.cast) unloadImages(info.cast.map((p) => p.image));
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
  setPlayerButtons();
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
    video.scrollIntoView({ block: hasPlayer ? "center" : "end" });
  }
}

function initializeWatchModalCheck() {
  async function handleQueryChange() {
    const modalQuery = getQuery(config.query.modal);

    if (modalQuery) {
      const [type, id] = modalQuery.split("-");

      if (type !== "g" && config.modal.validTypes.includes(type)) {
        hideModal(true);
        toggleDim(true);

        const info = await getDetails(type === "m" ? "movie" : "tv", id);

        if (info && info.title) {
          let recommendationImages = [];
          if (info.recommendations && getWatchSection("Recommendations"))
            recommendationImages = getNonCachedImages(
              info.recommendations.map((r) => r.image),
            );

          if (info.backdrop && getWatchSection("Video"))
            preloadImages([info.backdrop]);
          if (info.cast && getWatchSection("Cast"))
            preloadImages(info.cast.map((p) => p.image));
          if (info.reviews && getWatchSection("Reviews"))
            preloadImages(
              info.reviews.filter((r) => r.avatar).map((r) => r.avatar),
            );
          preloadImages(recommendationImages);

          modal(info, recommendationImages);
        } else {
          removeQuery(config.query.modal);
        }

        toggleDim(false);
      }
    }
  }

  handleQueryChange();
  onQueryChange(handleQueryChange);
}

export function initializeWatch() {
  initializeWatchModalCheck();
}
