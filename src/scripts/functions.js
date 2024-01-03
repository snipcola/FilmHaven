export function registerServiceWorker(path) {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register(path);
    }
}

export function convertMinutesToText(minutes) {
    if (minutes < 60) return `${minutes}m`;
    else {
        const hours = Math.floor(minutes / 60);
        const remainingMins = minutes % 60;

        if (remainingMins === 0) return `${hours}h`;
        else return `${hours}h ${remainingMins}m`;
    }
}

export function copyText(text) {
    window.navigator.clipboard.writeText(text);
}

export function getSearchUrl(query) {
    return `https://google.com/search?query=${query.replace(/ /g, "+")}`
}

export function cleanText(input) {
    return input.replace(/(?:__|[*#])|\[(.*?)\]\(.*?\)/gm, "$1").replace(/\r\n/g, " ").replace(/[_<>]/g, "").replace(/(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)/g, "");
}

export function debounce(func, delay) {
    let timeoutId;

    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function () {
            func(...args);
        }, delay);
    };
}

export function elementExists(element) {
    return document.body.contains(element);
}

export function onWindowResize(callback) {
    window.addEventListener("resize", callback);
}

export function removeWindowResize(callback) {
    window.removeEventListener("resize", callback);
}

export function getInnerText(element) {
    return element?.textContent?.match(/[A-Za-z]+/g)?.join("");
}

export function isHovered(element) {
    return element.matches(":hover");
}

export function shortenNumber(number, fixed) {
    number = number.toString().replace(/[^0-9.]/g, "");

    if (number < 1000) {
        return number;
    }

    const shortIndex = [
        { v: 1E3, s: "K" },
        { v: 1E6, s: "M" },
        { v: 1E9, s: "B" },
        { v: 1E12, s: "T" },
        { v: 1E15, s: "P" },
        { v: 1E18, s: "E" }
    ];

    let index;

    for (index = shortIndex.length - 1; index > 0; index--) {
        if (number >= shortIndex[index].v) {
            break;
        }
    }

    return (number / shortIndex[index].v).toFixed(fixed || 2).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + shortIndex[index].s;
}

export function splitArray(array, amount = 1) {
    const newArray = [];

    for (let i = 0; i < array.length; i += amount) {
        newArray.push(array.slice(i, i + amount));
    }

    return newArray;
}