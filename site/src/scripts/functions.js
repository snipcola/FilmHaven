export function isOnline() {
  return !window.location.href.startsWith("file:");
}

export function transparentImage() {
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAVYAAAIACAQAAABzmYx/AAADrklEQVR42u3SAQkAAADCMO1f2hzCFuG8gROVALOCWTErmBXMilnBrGBWzApmBbNiVjArmBWzglnBrJgVzApmxaxgVjArZgWzglkxK5gVs4JZwayYFcwKZsWsYFYwK2YFs4JZMSuYFcyKWcGsYFbMCmYFs2JWMCuYFbOCWcGsmBXMilnBrGBWzApmBbNiVjArmBWzglnBrJgVzApmxaxgVjArZgWzglkxK5gVzIpZwaxgVswKZsWsYFYwK2YFs4JZMSuYFcyKWcGsYFbMCmYFs2JWMCuYFbOCWcGsmBXMCmbFrGBWMCtmBbNiVjArmBWzglnBrJgVzApmxaxgVjArZgWzglkxK5gVzIpZwaxgVswKZgWzYlYwK5gVs4JZMSuYFcyKWcGsYFbMCmYFs2JWMCuYFbOCWcGsmBXMCmbFrGBWMCtmBbOCWTErmBXMilnBrJgVzApmxaxgVjArZgWzglkxK5gVzIpZwaxgVswKZgWzYlYwK5gVs4JZwayYFcwKZsWsYFbMCmYFs2JWMCuYFbOCWcGsmBXMCmbFrGBWMCtmBbOCWTErmBXMilnBrGBWzApmBbNiVjArZgWzglkxK5gVzIpZwaxgVswKZgWzYlYwK5gVs4JZwayYFcwKZsWsYFYwK2YFs2JWCTArmBWzglnBrJgVzApmxaxgVjArZgWzglkxK5gVzIpZwaxgVswKZgWzYlYwK5gVs4JZMSuYFcyKWcGsYFbMCmYFs2JWMCuYFbOCWcGsmBXMCmbFrGBWMCtmBbOCWTErmBXMilnBrJgVzApmxaxgVjArZgWzglkxK5gVzIpZwaxgVswKZgWzYlYwK5gVs4JZwayYFcwKZsWsYFbMCmYFs2JWMCuYFbOCWcGsmBXMCmbFrGBWMCtmBbOCWTErmBXMilnBrGBWzApmBbNiVjArZgWzglkxK5gVzIpZwaxgVswKZgWzYlYwK5gVs4JZwayYFcwKZsWsYFYwK2YFs4JZMSuYFbOCWcGsmBXMCmbFrGBWMCtmBbOCWTErmBXMilnBrGBWzApmBbNiVjArmBWzglnBrJgVzIpZwaxgVswKZgWzYlYwK5gVs4JZwayYFcwKZsWsYFYwK2YFs4JZMSuYFcyKWcGsYFbMCmbFrGBWMCtmBbOCWTErmBXMilnBrGBWzApmBbNiVjArmBWzglnBrJgVzApmxaxgVjArZgWzYlYwK5gVs4JZwayYFcwKZsWsYFYwK2YFs4JZMSuYFcyKWcGsYFZ+DVe+AgHBddcXAAAAAElFTkSuQmCC";
}

export function onSwipe(element, callback) {
  let startX, startY, endX, endY;
  let touchStart, touchMove, touchEnd;

  function remove() {
    element.removeEventListener("touchstart", touchStart);
    element.removeEventListener("touchmove", touchMove);
    element.removeEventListener("touchend", touchEnd);
  }

  touchStart = function (e) {
    if (!elementExists(element)) return remove();

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  };

  touchMove = function (e) {
    if (!elementExists(element)) return remove();

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;

    const deltaX = currentX - startX;
    const deltaY = currentY - startY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
    }
  };

  touchEnd = function (e) {
    if (!elementExists(element)) return remove();

    endX = e.changedTouches[0].clientX;
    endY = e.changedTouches[0].clientY;

    const deltaX = endX - startX;
    const deltaY = endY - startY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) callback(true);
      else callback(false);
    }
  };

  element.addEventListener("touchstart", touchStart);
  element.addEventListener("touchmove", touchMove);
  element.addEventListener("touchend", touchEnd);
}

export function promiseTimeout(timeout) {
  return new Promise((res) => setTimeout(res, timeout));
}

export function onKeyPress(key, prevent, active, depends, callback) {
  function listener(e) {
    if (depends && !elementExists(depends)) {
      document.removeEventListener("keypress", listener);
      return;
    }

    if (
      e.key.toLowerCase() === key &&
      (!active || document.activeElement !== active)
    ) {
      if (prevent) e.preventDefault();
      if (callback) callback();
    }
  }

  document.addEventListener("keypress", listener);
}

export function scrollToElement(element, offset = 0) {
  const bodyTop = document.body?.getBoundingClientRect()?.top;
  const elementTop = element?.getBoundingClientRect()?.top;

  if (bodyTop && elementTop) {
    window.scrollTo({ top: elementTop - bodyTop + offset });
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

export function cleanText(input) {
  return input
    .replace(/(?:__|[*#])|\[(.*?)\]\(.*?\)/gm, "$1")
    .replace(/\r\n/g, " ")
    .replace(/[_<>]/g, "")
    .replace(/(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w\.-]*)/g, "");
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
    { v: 1e3, s: "K" },
    { v: 1e6, s: "M" },
    { v: 1e9, s: "B" },
    { v: 1e12, s: "T" },
    { v: 1e15, s: "P" },
    { v: 1e18, s: "E" },
  ];

  let index;

  for (index = shortIndex.length - 1; index > 0; index--) {
    if (number >= shortIndex[index].v) {
      break;
    }
  }

  return (
    (number / shortIndex[index].v)
      .toFixed(fixed || 2)
      .replace(/\.0+$|(\.[0-9]*[1-9])0+$/, "$1") + shortIndex[index].s
  );
}

export function splitArray(array, amount = 1) {
  const newArray = [];

  for (let i = 0; i < array.length; i += amount) {
    newArray.push(array.slice(i, i + amount));
  }

  return newArray;
}

export function formatBytes(_bytes) {
  let bytes;

  if (typeof _bytes === "string") {
    try {
      bytes = parseInt(_bytes);
    } catch {
      bytes = 0;
    }
  } else {
    bytes = _bytes;
  }

  if (bytes === 0) {
    return "0 Bytes";
  }

  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const formattedBytes = (bytes / Math.pow(1024, i)).toFixed(2);

  return `${formattedBytes} ${sizes[i]}`;
}
