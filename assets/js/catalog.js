const CSV_PATH = "_data/catalog.csv";

let catalogData = [];

const activeFilters = {
  domain: new Set(),
  representation: new Set(),
  realism: new Set(),
  scale: new Set()
};

const searchInput = document.getElementById("searchInput");
const tableBody = document.querySelector("#catalogTable tbody");

/* =========================
   Load CSV
========================= */

async function loadCSV() {

  Papa.parse(CSV_PATH, {
    download: true,
    header: true,
    skipEmptyLines: true,

    complete: function(results) {
      catalogData = results.data;

      buildFilters(catalogData);
      renderTable(catalogData);
    }
  });
}

/* =========================
   Build Filter Buttons
========================= */

function buildFilters(data) {

  createFilterButtons(
    "domain",
    getUniqueValues(data, "domain"),
    "domainFilters"
  );

  createFilterButtons(
    "representation",
    getUniqueValues(data, "representation"),
    "representationFilters"
  );

  createFilterButtons(
    "realism",
    getUniqueValues(data, "realism"),
    "realismFilters"
  );

  createFilterButtons(
    "scale",
    getUniqueValues(data, "scale"),
    "scaleFilters"
  );
}

function getUniqueValues(data, key) {
  return [...new Set(data.map(item => item[key]))].sort();
}

function createFilterButtons(filterKey, values, containerId) {

  const container = document.getElementById(containerId);

  container.innerHTML = "";

  values.forEach(value => {

    const button = document.createElement("button");

    button.className = "filter-btn";
    button.textContent = value;

    button.addEventListener("click", () => {

      if (activeFilters[filterKey].has(value)) {
        activeFilters[filterKey].delete(value);
        button.classList.remove("active");
      } else {
        activeFilters[filterKey].add(value);
        button.classList.add("active");
      }

      applyFilters();
    });

    container.appendChild(button);
  });
}

/* =========================
   Filtering
========================= */

function applyFilters() {

  const searchTerm = searchInput.value
    .toLowerCase()
    .trim();

  const filtered = catalogData.filter(item => {

    const titleMatch =
      item.title.toLowerCase().includes(searchTerm);

    const domainMatch =
      activeFilters.domain.size === 0 ||
      activeFilters.domain.has(item.domain);

    const representationMatch =
      activeFilters.representation.size === 0 ||
      activeFilters.representation.has(item.representation);

    const realismMatch =
      activeFilters.realism.size === 0 ||
      activeFilters.realism.has(item.realism);

    const scaleMatch =
      activeFilters.scale.size === 0 ||
      activeFilters.scale.has(item.scale);

    return (
      titleMatch &&
      domainMatch &&
      representationMatch &&
      realismMatch &&
      scaleMatch
    );
  });

  renderTable(filtered);
}

/* =========================
   Render Table
========================= */

function renderTable(data) {

  tableBody.innerHTML = "";

  if (data.length === 0) {

    tableBody.innerHTML = `
      <tr>
        <td colspan="8">
          No matching datasets found.
        </td>
      </tr>
    `;

    return;
  }

  data.forEach(item => {

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.year}</td>
      <td>${item.domain}</td>
      <td>${item.title}</td>
      <td>${item.representation}</td>
      <td>${item.realism}</td>
      <td>${item.scale}</td>
      <td>
        <a href="${item.url}" target="_blank">
          Link
        </a>
      </td>
      <td>${item.author}</td>
    `;

    tableBody.appendChild(row);
  });
}

/* =========================
   Events
========================= */

searchInput.addEventListener("input", applyFilters);

document
  .getElementById("clearFilters")
  .addEventListener("click", () => {

    Object.keys(activeFilters).forEach(key => {
      activeFilters[key].clear();
    });

    document
      .querySelectorAll(".filter-btn")
      .forEach(btn => btn.classList.remove("active"));

    searchInput.value = "";

    renderTable(catalogData);
  });

document
  .getElementById("refreshData")
  .addEventListener("click", () => {

    loadCSV();
  });

/* =========================
   Init
========================= */

loadCSV();