export function initializeProviders() {
  const section = document.querySelector(".section.providers");

  if (!section) {
    return console.error("Failed to find section.");
  }

  const title = document.createElement("h1");
  title.innerText = "This section is not quite done yet,";

  const label = document.createElement("p");
  label.innerText = "It's still in progress, make sure to check back soon!";

  section.append(title, label);
}
