import { createSearch } from "./search.js";

const results = document.getElementById("searchResult");
const searchText = document.getElementById("searchText");
const counter = document.getElementById("searchCounter");
const counterText = document.getElementById("searchCounterText");
const help = document.getElementById("helpSection");
const input = document.getElementById("dictQuery");
const clearButton = document.getElementById("clearQuery");
let search;
let timer;

function runSearch() {
  const query = input.value.trimStart();
  clearButton.hidden = input.value === "";
  searchText.replaceChildren();
  results.replaceChildren();
  counter.textContent = "";
  counter.classList.remove("visible");
  counterText.textContent = "";
  help.hidden = query.trim() !== "";
  if (!search || query.trim() === "" || query.length < 2) return;

  const term = document.createElement("b");
  term.textContent = query;
  searchText.append("Søker etter ", term);
  const data = search(query);
  counter.classList.add("visible");
  counter.textContent = String(data.count);
  counterText.textContent = data.count === 1 ? "element funnet" : "elementer funnet";

  const fragment = document.createDocumentFragment();
  for (const entry of data.matches) {
    const line = document.createElement("div");
    line.className = "result-line";
    const headword = document.createElement("b");
    const comma = entry.indexOf(",");
    const end = comma === -1 ? entry.length : comma;
    headword.textContent = entry.slice(0, end);
    line.append(headword, entry.slice(end));
    fragment.append(line);
  }
  results.append(fragment);
}

function clearSearch() {
  input.value = "";
  clearTimeout(timer);
  runSearch();
  input.focus();
}

clearButton.addEventListener("click", clearSearch);
input.addEventListener("input", () => {
  clearButton.hidden = input.value === "";
  clearTimeout(timer);
  timer = setTimeout(runSearch, 100);
});
input.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && input.value !== "") {
    event.preventDefault();
    clearSearch();
  } else if (event.key === "Enter") {
    event.preventDefault();
    clearTimeout(timer);
    runSearch();
  }
});

async function loadDictionary() {
  input.disabled = true;
  searchText.textContent = "Laster ordlisten …";
  try {
    const response = await fetch(new URL("./dictionary.json", import.meta.url));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    search = createSearch(await response.json());
    input.disabled = false;
    runSearch();
    input.focus();
  } catch (error) {
    searchText.textContent = "Kunne ikke laste ordlisten. Last siden på nytt for å prøve igjen.";
    console.error(error);
  }
}

loadDictionary();
