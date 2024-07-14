import { getTheme } from "../store/theme.js";

export function initializeTheme() {
  const theme = getTheme();
  document.documentElement.className = theme === "auto" ? "" : theme;
}
