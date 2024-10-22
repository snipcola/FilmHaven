let dim;

export function initializeDim() {
  dim = document.createElement("div");
  dim.className = "dim";
  document.body.append(dim);
}

export function toggleDim(toggle) {
  dim.classList[toggle ? "add" : "remove"]("active");
}
