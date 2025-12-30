import { getTheme, setTheme } from "./store/theme.js";
import { getAdult, setAdult } from "./store/adult.js";
import { getPages, getPage, setPage, getPageIndex } from "./store/pages.js";
import { getSections, getSection, setSection } from "./store/sections.js";
import {
  getWatchSections,
  getWatchSection,
  setWatchSection,
} from "./store/watch-sections.js";
import { resetCache, resetDB } from "./cache.js";
import { resetContinueWatching } from "./store/continue.js";
import { resetLastPlayed } from "./store/last-played.js";
import { getLanguages } from "./api/languages.js";
import { getLanguage, setLanguage } from "./store/language.js";
import { getUrlWithQueries, setQueries } from "./query.js";
import { getCSSVariable } from "./functions.js";

const name = "FilmHaven";
const repository = "https://code.snipcola.st/snipcola/FilmHaven";
const author = "Snipcola";
const colour = getCSSVariable("primary").replace("#", "") || "ffffff";

export const defaultProviders = [
  {
    base: "vidlink.pro",
    movie: `https://%b/movie/%i?primaryColor=${colour}&secondaryColor=a2a2a2&iconColor=eefdec&icons=vid&player=default&title=false&poster=false&autoplay=false&nextbutton=false`,
    tv: `https://%b/tv/%i/%s/%e?primaryColor=${colour}&secondaryColor=a2a2a2&iconColor=eefdec&icons=vid&player=default&title=false&poster=false&autoplay=false&nextbutton=false`,
  },
  {
    base: "videasy.net",
    movie: `https://player.%b/movie/%i?color=${colour}&nextEpisode=false&episodeSelector=false&autoplayNextEpisode=false&overlay=false`,
    tv: `https://player.%b/tv/%i/%s/%e?color=${colour}&nextEpisode=false&episodeSelector=false&autoplayNextEpisode=false&overlay=false`,
  },
  {
    base: "111movies.com",
    movie: "https://%b/movie/%i",
    tv: "https://%b/tv/%i/%s/%e",
  },
  {
    base: "vidsrc-embed.ru",
    movie: "https://%b/embed/movie/%i",
    tv: "https://%b/embed/tv/%i/%s/%e",
  },
  {
    base: "vidking.net",
    movie: `https://%b/embed/movie/%i?color=${colour}&autoPlay=false&nextEpisode=false&episodeSelector=false`,
    tv: `https://%b/embed/tv/%i/%s/%e?color=${colour}&autoPlay=false&nextEpisode=false&episodeSelector=false`,
  },
  {
    base: "vidrock.net",
    movie: `https://%b/movie/%i?theme=${colour}&autoplay=false&autonext=false&download=false&nextbutton=false&episodeselector=false`,
    tv: `https://%b/tv/%i/%s/%e?theme=${colour}&autoplay=false&autonext=false&download=false&nextbutton=false&episodeselector=false`,
  },
];

function refresh() {
  window.location.href = getUrlWithQueries({
    [config.query.page]: getPageIndex("settings"),
  });
}

export const config = {
  name,
  author,
  repository,
  version: typeof __VERSION__ !== "undefined" && __VERSION__,
  storePrefix: "fh",
  defaultLanguage: "en",
  header: {
    name: {
      normal: {
        text: "Film",
        accent: "Haven",
      },
      mobile: {
        text: "F",
        accent: "H",
      },
    },
    links: [
      {
        icon: "home",
        text: "Home",
      },
      {
        icon: "film",
        text: "Movies",
      },
      {
        icon: "tv",
        text: "Shows",
      },
      {
        icon: "cog",
        text: "Settings",
        required: true,
      },
    ],
  },
  footer: {
    links: [
      ...[
        repository
          ? {
              icon: "github",
              url: repository,
              label: "Git",
            }
          : {},
        {
          icon: "download",
          url: window.location.pathname,
          label: "Download",
          download: `${name}.html`,
        },
      ],
    ],
  },
  modal: {
    validTypes: ["g", "m", "s", "p"],
  },
  search: {
    debounce: 500,
  },
  carousel: {
    amount: 4,
    switchSlideInterval: 10000,
  },
  area: {
    maxTitleLength: 25,
    amount: 16,
    split: {
      max: 700,
      desktop: 4,
      mobile: 2,
    },
  },
  genre: {
    split: {
      max: 900,
      desktop: 5,
      mobile: 2,
    },
  },
  cast: {
    amount: 100,
    split: {
      max: 700,
      desktop: 4,
      mobile: 2,
    },
  },
  crew: {
    amount: 100,
    split: {
      max: 700,
      desktop: 4,
      mobile: 2,
    },
  },
  reviews: {
    amount: 50,
    split: {
      max: 700,
      desktop: 2,
      mobile: 1,
    },
  },
  recommendations: {
    amount: 10,
    split: {
      max: 700,
      desktop: 2,
      mobile: 2,
    },
  },
  producers: {
    amount: 4,
  },
  query: {
    page: "p",
    modal: "m",
    query: "q",
    watch: "w",
    season: "s",
    episode: "e",
  },
  maxDescriptionLength: 230,
  maxReviewContentLength: 230,
  maxCacheDays: 5,
  maxMobileWidth: 700,
  retryLoadAfter: 4000,
};

export const api = {
  url: "https://api.tmdb.org",
  version: "3",
  defaultKey: "5622cafbfe8f8cfe358a29c53e19bba0",
  image: {
    url: "https://image.tmdb.org/t/p",
    poster: "w342",
    backdrop: "w1280",
    cast: "w150_and_h150_face",
    crew: "w150_and_h150_face",
    avatar: "w150_and_h150_face",
    episode: "w185",
  },
  person: "https://tmdb.org/person",
  trending: {
    timeWindow: "week",
  },
};

export const downloadApi = {
  movies: {
    url: "https://yts.lt/api",
    version: "v2",
  },
  tv: {
    url: "https://eztvx.to/api",
    limit: 100,
  },
  trackers: [
    "udp://open.demonii.com:1337/announce",
    "udp://glotorrents.pw:6969/announce",
    "udp://tracker.opentrackr.org:1337/announce",
    "udp://tracker.coppersurfer.tk:6969",
    "udp://tracker.leechers-paradise.org:6969",
    "udp://p4p.arenabg.ch:1337",
    "udp://tracker.internetwarriors.net:1337",
    "udp://p4p.arenabg.com:1337/announce",
    "udp://tracker.torrent.eu.org:451/announce",
    "udp://tracker.dler.org:6969/announce",
    "udp://tracker2.dler.org:80/announce",
    "udp://open.stealth.si:80/announce",
    "udp://open.demonoid.ch:6969/announce",
    "udp://explodie.org:6969/announce",
    "udp://tracker.tryhackx.org:6969/announce",
    "udp://tracker.torrust-demo.com:6969/announce",
    "udp://tracker.therarbg.to:6969/announce",
    "udp://tracker.qu.ax:6969/announce",
    "udp://tracker.hifimarket.in:2710/announce",
    "udp://tracker.gmi.gd:6969/announce",
    "udp://tracker.bittor.pw:1337/announce",
    "udp://tracker.0x7c0.com:6969/announce",
    "udp://tracker-udp.gbitt.info:80/announce",
    "udp://tr4ck3r.duckdns.org:6969/announce",
    "udp://t.overflow.biz:6969/announce",
  ],
};

const prefix = config.storePrefix;
export const cachePrefix = `${prefix}-cache`;

export const store = {
  names: {
    cache: function (key) {
      return `${cachePrefix}-${key}`;
    },
    theme: `${prefix}-theme`,
    adult: `${prefix}-adult`,
    language: `${prefix}-language`,
    tmdbKey: `${prefix}-tmdb-key`,
    defaultProviders: `${prefix}-default-providers`,
    providers: `${prefix}-providers`,
    provider: `${prefix}-provider`,
    lastPlayed: `${prefix}-last-played`,
    pages: `${prefix}-pages`,
    sections: `${prefix}-sections`,
    watchSections: `${prefix}-watch-sections`,
    continue: `${prefix}-continue`,
  },
};

export const themes = {
  auto: "Auto",
  dark: "Dark",
  light: "Light",
};

export const adult = {
  show: "Show",
  hide: "Hide",
};

export const useDefaultProviders = {
  include: "Include",
  exclude: "Exclude",
};

export const sections = {
  Search: true,
  Continue: true,
  Carousel: true,
  Genres: true,
  Trending: true,
  "Top-Rated": true,
  New: true,
};

export const watchSections = {
  Video: true,
  Trailer: true,
  Download: true,
  Providers: true,
  Seasons: true,
  Description: true,
  Cast: true,
  Crew: true,
  Reviews: true,
  Misc: true,
  Recommendations: true,
};

export const settings = [
  {
    label: {
      icon: "box",
      text: "Data",
    },
    items: function () {
      return [
        {
          label: {
            icon: "sync",
            text: "Reset",
          },
          onClick: async function (self) {
            localStorage.clear();
            await resetDB();

            document.body.classList.remove("active");
            refresh();

            self.classList.add("inactive");
            self.querySelector(".icon").className = "icon icon-check";
          },
        },
        {
          label: {
            icon: "sync",
            text: "Empty Cache",
          },
          class: "secondary",
          onClick: async function (self) {
            resetCache();
            await resetDB();

            document.body.classList.remove("active");
            window.location.reload();

            self.classList.add("inactive");
            self.querySelector(".icon").className = "icon icon-check";
          },
        },
        {
          label: {
            icon: "eye-slash",
            text: "Clear Continue Watching",
          },
          class: "secondary",
          onClick: function (self) {
            resetContinueWatching();

            self.classList.add("inactive");
            self.querySelector(".icon").className = "icon icon-check";

            setTimeout(function () {
              self.querySelector(".icon").className = "icon icon-eye-slash";
              self.classList.remove("inactive");
            }, 2500);
          },
        },
        {
          label: {
            icon: "eye-slash",
            text: "Clear Last Watched",
          },
          class: "secondary",
          onClick: function (self) {
            resetLastPlayed();

            self.classList.add("inactive");
            self.querySelector(".icon").className = "icon icon-check";

            setTimeout(function () {
              self.querySelector(".icon").className = "icon icon-eye-slash";
              self.classList.remove("inactive");
            }, 2500);
          },
        },
      ];
    },
    type: "buttons",
  },
  {
    label: {
      icon: "paint-brush",
      text: "Theme",
    },
    items: function () {
      const currentTheme = getTheme();
      const themeItems = Object.values(themes);

      return themeItems.map((t) => ({
        label: t,
        value: t.toLowerCase(),
        active: t.toLowerCase() === currentTheme,
      }));
    },
    onSelect: setTheme,
    type: "select",
  },
  {
    label: {
      icon: "censor",
      text: "Adult Content",
    },
    items: function () {
      const currentAdult = getAdult();
      const adultItems = Object.values(adult);

      return adultItems.map((a) => ({
        label: a,
        value: a.toLowerCase(),
        active: a.toLowerCase() === currentAdult,
      }));
    },
    onSelect: setAdult,
    type: "select",
  },
  {
    label: {
      icon: "language",
      text: "Language (performs reset)",
    },
    items: async function () {
      const languages = await getLanguages();

      return languages.map((l) => ({
        label: l.name,
        value: l.value,
        active: l.value === getLanguage(),
      }));
    },
    onSelect: function (l) {
      setLanguage(l);
      resetCache("languages");
      resetContinueWatching();
      resetLastPlayed();

      document.body.classList.remove("active");
      window.location.reload();
    },
    type: "select",
  },
  {
    label: {
      icon: "tv",
      text: "Providers",
    },
    items: function () {
      return [
        {
          label: {
            text: "Edit",
          },
          class: ["secondary", "full"],
          onClick: function () {
            setQueries({
              [config.query.modal]: "p",
            });
          },
        },
      ];
    },
    type: "buttons",
  },
  {
    label: {
      icon: "list",
      text: "Presets",
    },
    items: function () {
      return [
        {
          label: "Set",
          value: "",
          placeholder: true,
        },
        {
          label: "Full",
          value: "full",
        },
        {
          label: "Minimal",
          value: "minimal",
        },
        {
          label: "Minimal+",
          value: "extra-minimal",
        },
      ];
    },
    onSelect: function (i) {
      if (i === "full") {
        const pages = getPages();
        const sections = getSections();
        const watchSections = getWatchSections();

        for (const page of Object.keys(pages)) {
          setPage(page, true);
        }

        for (const section of Object.keys(sections)) {
          setSection(section, true);
        }

        for (const watchSection of Object.keys(watchSections)) {
          setWatchSection(watchSection, true);
        }

        document.body.classList.remove("active");
        refresh();
      } else if (i === "minimal") {
        const pages = getPages();
        const sections = getSections();
        const watchSections = getWatchSections();

        for (const page of Object.keys(pages)) {
          setPage(page, ["Home"].includes(page));
        }

        for (const section of Object.keys(sections)) {
          setSection(
            section,
            ["Search", "Continue", "Carousel", "Genres"].includes(section),
          );
        }

        for (const watchSection of Object.keys(watchSections)) {
          setWatchSection(
            watchSection,
            ["Video", "Trailer", "Download", "Providers", "Seasons"].includes(
              watchSection,
            ),
          );
        }

        document.body.classList.remove("active");
        refresh();
      } else {
        const pages = getPages();
        const sections = getSections();
        const watchSections = getWatchSections();

        for (const page of Object.keys(pages)) {
          setPage(page, ["Home"].includes(page));
        }

        for (const section of Object.keys(sections)) {
          setSection(section, ["Search", "Continue"].includes(section));
        }

        for (const watchSection of Object.keys(watchSections)) {
          setWatchSection(watchSection, ["Video"].includes(watchSection));
        }

        document.body.classList.remove("active");
        refresh();
      }
    },
    preventChange: true,
    type: "select",
  },
  {
    label: {
      icon: "file",
      text: "Pages",
    },
    items: function () {
      const pages = getPages();

      return Object.entries(pages)
        .filter(([_, a]) => !a.hidden)
        .map(([p, a]) => ({
          label: p,
          value: p,
          active: a.enabled,
        }));
    },
    onClick: function (p) {
      setPage(p, !getPage(p));
      refresh();
    },
    type: "selection",
    multi: true,
  },
  {
    label: {
      icon: "tags",
      text: "Sections",
    },
    items: function () {
      const sections = getSections();

      return Object.entries(sections).map(([s, a]) => ({
        label: s,
        value: s,
        active: a,
      }));
    },
    onClick: function (s) {
      setSection(s, !getSection(s));
      refresh();
    },
    type: "selection",
    multi: true,
  },
  {
    label: {
      icon: "play",
      text: "Watch Sections",
    },
    items: function () {
      const watchSections = getWatchSections();

      return Object.entries(watchSections).map(([w, a]) => ({
        label: w,
        value: w,
        active: a,
      }));
    },
    onClick: function (w) {
      setWatchSection(w, !getWatchSection(w));
    },
    type: "selection",
    multi: true,
  },
];
