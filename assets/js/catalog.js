const CSV_PATH = "data/catalog.csv";

let catalogData = [];

const activeFilters = {
  domain: new Set(),
  representation: new Set(),
  realism: new Set(),
  scale: new Set()
};

const tableBody = document.querySelector("#catalogTable tbody");

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  loadCSV();

  const refreshBtn = document.getElementById("refreshData");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadCSV);
  }
});

document.getElementById("clearFilters").addEventListener("click", () => {

  Object.keys(activeFilters).forEach(key => {
    activeFilters[key].clear();
  });

  document
    .querySelectorAll(".filter-btn")
    .forEach(btn => btn.classList.remove("active"));

  if (searchInput) searchInput.value = "";

  applyFilters();
});

/* =========================
   LOAD CSV
========================= */

function loadCSV() {

  if (typeof Papa === "undefined") {
    console.error("PapaParse is not loaded.");
    return;
  }

  Papa.parse(CSV_PATH, {
    download: true,
    header: true,
    skipEmptyLines: true,

    complete: function(results) {

      console.log("CSV Loaded:", results);

      if (!results.data || results.data.length === 0) {
        console.error("CSV loaded but empty or invalid.");

        tableBody.innerHTML = `
          <tr>
            <td colspan="8">CSV failed to load or is empty.</td>
          </tr>
        `;

        return;
      }

      catalogData = results.data;

      buildFilters(catalogData);
      renderTable(catalogData);
    },

    error: function(error) {

      console.error("CSV Load Error:", error);

      tableBody.innerHTML = `
        <tr>
          <td colspan="8">Failed to load catalog.csv</td>
        </tr>
      `;
    }
  });
}

/* =========================
   FILTER SYSTEM
========================= */

function clearFilterContainers() {
  const ids = [
    "domainFilters",
    "representationFilters",
    "realismFilters",
    "scaleFilters"
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = "";
  });
}

function buildFilters(data) {

  if (!Array.isArray(data)) return;

  clearFilterContainers();

  createFilterButtons("domain", getUnique(data, "domain"), "domainFilters");
  createFilterButtons("representation", getUnique(data, "representation"), "representationFilters");
  createFilterButtons("realism", getUnique(data, "realism"), "realismFilters");
  createFilterButtons("scale", getUnique(data, "scale"), "scaleFilters");
}

function getUnique(data, key) {
  return [...new Set(data.map(d => d[key]).filter(Boolean))].sort();
}

function createFilterButtons(filterKey, values, containerId) {

  const container = document.getElementById(containerId);

  if (!container) return;

  container.innerHTML = "";

  values.forEach(value => {

    const btn = document.createElement("button");

    btn.className = "filter-btn";
    btn.textContent = value;

    btn.addEventListener("click", () => {

      if (activeFilters[filterKey].has(value)) {
        activeFilters[filterKey].delete(value);
        btn.classList.remove("active");
      } else {
        activeFilters[filterKey].add(value);
        btn.classList.add("active");
      }

      applyFilters();
    });

    container.appendChild(btn);
  });
}

/* =========================
   FILTER LOGIC
========================= */

function applyFilters() {

  const filtered = catalogData.filter(item => {

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
      domainMatch &&
      representationMatch &&
      realismMatch &&
      scaleMatch
    );
  });

  renderTable(filtered);
}

/* =========================
   TABLE RENDER
========================= */

function renderTable(data) {

  if (!tableBody) return;

  tableBody.innerHTML = "";

  if (!data || data.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8">No matching datasets found.</td>
      </tr>
    `;
    return;
  }

  data.forEach(item => {

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${item.year || ""}</td>
      <td>${item.domain || ""}</td>
      <td>${item.title || ""}</td>
      <td>${item.representation || ""}</td>
      <td>${item.realism || ""}</td>
      <td>${item.scale || ""}</td>
      <td>
        <a href="${item.url || "#"}" target="_blank">Link</a>
      </td>
      <td>${item.author || ""}</td>
    `;

    tableBody.appendChild(row);
  });
}
