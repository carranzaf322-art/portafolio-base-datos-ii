// ==========================================================
// BASE DE DATOS II - PORTAFOLIO ACADÉMICO
// TEMA: DOTA 2
// ALMACENAMIENTO: GITHUB
// ==========================================================

const pages = document.querySelectorAll(".page");
const portfolioView = document.getElementById("portfolio-view");

// ==========================================================
// CONFIGURACIÓN DE GITHUB
// ==========================================================

const GITHUB_USER = "carranzaf322-art";
const GITHUB_REPO = "portafolio-base-datos-ii";
const GITHUB_BRANCH = "main";

const GITHUB_API =
  `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents`;

const GITHUB_WEB =
  `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/tree/${GITHUB_BRANCH}`;

const GITHUB_RAW =
  `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;


// ==========================================================
// UNIDADES
// ==========================================================

const units = [
  { id: 1, name: "UNIDAD 01" },
  { id: 2, name: "UNIDAD 02" },
  { id: 3, name: "UNIDAD 03" },
  { id: 4, name: "UNIDAD 04" }
];


// ==========================================================
// NAVEGACIÓN
// ==========================================================

function showPage(id) {

  pages.forEach(page => {

    page.classList.toggle(
      "active",
      page.id === id
    );

  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


// ==========================================================
// BOTONES DE NAVEGACIÓN
// ==========================================================

document.addEventListener("click", event => {

  const target =
    event.target.closest("[data-page]");

  if (!target) return;

  const page =
    target.dataset.page;

  if (page === "portfolio") {
    renderUnits();
  }

  showPage(page);

});


// ==========================================================
// MOSTRAR UNIDADES
// ==========================================================

function renderUnits() {

  portfolioView.innerHTML = `

    <div class="explorer-header">

      <p class="eyebrow">
        ⚔ EXPLORADOR ACADÉMICO ⚔
      </p>

      <h1>
        PORTAFOLIO
      </h1>

      <p>
        Selecciona una unidad para acceder a sus semanas.
      </p>

    </div>

    <div class="folder-grid">

      ${units.map(unit => `

        <article
          class="folder"
          data-unit="${unit.id}">

          <div class="folder-icon">
            ⚔️
          </div>

          <h2>
            ${unit.name}
          </h2>

          <p>
            SEMANAS 01 — 04
          </p>

        </article>

      `).join("")}

    </div>

  `;


  document
    .querySelectorAll("[data-unit]")
    .forEach(folder => {

      folder.addEventListener(
        "click",
        () => {

          renderWeeks(
            Number(folder.dataset.unit)
          );

        }
      );

    });

}


// ==========================================================
// MOSTRAR SEMANAS
// ==========================================================

function renderWeeks(unitId) {

  const unit =
    units.find(
      item => item.id === unitId
    );

  portfolioView.innerHTML = `

    <div class="topbar">

      <button
        class="back"
        id="back-units">

        ← UNIDADES

      </button>

      <span>
        ⚔ ${unit.name}
      </span>

    </div>


    <div class="explorer-header">

      <p class="eyebrow">
        EXPLORADOR / ${unit.name}
      </p>

      <h1>
        SEMANAS
      </h1>

      <p>
        Selecciona una semana para consultar tus documentos.
      </p>

    </div>


    <div class="week-grid">

      ${[1, 2, 3, 4].map(week => `

        <article
          class="week"
          data-week="${week}">

          <div class="week-icon">
            📜
          </div>

          <h2>
            SEMANA ${String(week).padStart(2, "0")}
          </h2>

          <p>
            EXPLORAR ARCHIVOS
          </p>

        </article>

      `).join("")}

    </div>

  `;


  document
    .getElementById("back-units")
    .addEventListener(
      "click",
      renderUnits
    );


  document
    .querySelectorAll("[data-week]")
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          renderFiles(
            unitId,
            Number(card.dataset.week)
          );

        }
      );

    });

}


// ==========================================================
// OBTENER ARCHIVOS DESDE GITHUB
// ==========================================================

async function getGithubFiles(path) {

  try {

    const response =
      await fetch(
        `${GITHUB_API}/${path}?ref=${GITHUB_BRANCH}`
      );


    if (response.status === 404) {

      return [];

    }


    if (!response.ok) {

      throw new Error(
        `GitHub respondió ${response.status}`
      );

    }


    const data =
      await response.json();


    if (!Array.isArray(data)) {

      return [];

    }


    return data.filter(
      item =>
        item.type === "file"
    );

  }

  catch (error) {

    console.error(
      "Error obteniendo archivos:",
      error
    );

    throw error;

  }

}


// ==========================================================
// MOSTRAR ARCHIVOS
// ==========================================================

async function renderFiles(unitId, weekId) {

  const path =
    `documentos/unidad-${String(unitId).padStart(2, "0")}/semana-${String(weekId).padStart(2, "0")}`;


  portfolioView.innerHTML = `

    <div class="topbar">

      <button
        class="back"
        id="back-weeks">

        ← SEMANAS

      </button>

      <span>
        ⚔ U${unitId} / S${weekId}
      </span>

    </div>


    <div class="explorer-header">

      <p class="eyebrow">
        DOCUMENTOS / UNIDAD ${String(unitId).padStart(2, "0")} /
        SEMANA ${String(weekId).padStart(2, "0")}
      </p>

      <h1>
        SEMANA ${String(weekId).padStart(2, "0")}
      </h1>

      <p>
        Archivos almacenados permanentemente en GitHub.
      </p>

    </div>


    <div class="file-list">

      <div class="loading">

        ⚔ CARGANDO ARCHIVOS...

      </div>

    </div>


    <div class="add-file-container">

      <button
        class="btn primary"
        id="add-file">

        ＋ AGREGAR ARCHIVO

      </button>

      <p class="github-help">

        El archivo se almacena en GitHub y estará disponible
        desde cualquier computadora.

      </p>

    </div>

  `;


  document
    .getElementById("back-weeks")
    .addEventListener(
      "click",
      () => renderWeeks(unitId)
    );


  // ========================================================
  // BOTÓN AGREGAR ARCHIVO
  // ========================================================

  document
    .getElementById("add-file")
    .addEventListener(
      "click",
      () => {

        const githubFolder =
          `${GITHUB_WEB}/documentos/unidad-${String(unitId).padStart(2, "0")}/semana-${String(weekId).padStart(2, "0")}`;

        window.open(
          githubFolder,
          "_blank"
        );

      }
    );


  // ========================================================
  // CARGAR ARCHIVOS
  // ========================================================

  try {

    const files =
      await getGithubFiles(path);


    const fileList =
      document.querySelector(".file-list");


    if (files.length === 0) {

      fileList.innerHTML = `

        <div class="empty">

          <div class="empty-icon">
            ⚔
          </div>

          <h3>
            CARPETA VACÍA
          </h3>

          <p>
            Todavía no hay archivos en esta semana.
          </p>

          <small>
            Usa AGREGAR ARCHIVO para subir un documento
            directamente a GitHub.
          </small>

        </div>

      `;

      return;

    }


    fileList.innerHTML = files.map(
      file => {

        const fileUrl =
          `${GITHUB_RAW}/${path}/${encodeURIComponent(file.name)}`;


        return `

          <div class="file-item">

            <div class="file-icon">
              ${getFileIcon(file.name)}
            </div>


            <div class="file-info">

              <strong>
                ${escapeHTML(file.name)}
              </strong>

              <small>
                ARCHIVO DE GITHUB
              </small>

            </div>


            <div class="file-actions">

              <button
                class="file-btn"
                onclick="openGithubFile('${fileUrl}')">

                👁 VER

              </button>


              <a
                class="file-btn"
                href="${file.html_url}"
                target="_blank"
                rel="noopener noreferrer">

                ⚔ GITHUB

              </a>

            </div>

          </div>

        `;

      }
    ).join("");

  }

  catch (error) {

    document.querySelector(".file-list").innerHTML = `

      <div class="empty">

        <div class="empty-icon">
          ⚠
        </div>

        <h3>
          NO SE PUDIERON CARGAR LOS ARCHIVOS
        </h3>

        <p>
          Revisa que el repositorio de GitHub sea público.
        </p>

      </div>

    `;

  }

}


// ==========================================================
// ABRIR ARCHIVO
// ==========================================================

function openGithubFile(url) {

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );

}


// ==========================================================
// ICONOS
// ==========================================================

function getFileIcon(filename) {

  const extension =
    filename
      .split(".")
      .pop()
      .toLowerCase();


  const icons = {

    pdf: "📕",

    doc: "📘",
    docx: "📘",

    xls: "📗",
    xlsx: "📗",

    ppt: "📙",
    pptx: "📙",

    sql: "🗄️",

    csv: "📊",

    txt: "📄",

    jpg: "🖼️",
    jpeg: "🖼️",
    png: "🖼️",
    gif: "🖼️",

    zip: "📦",
    rar: "📦",

    js: "⚙️",
    html: "🌐",
    css: "🎨",

    mp4: "🎬",
    mp3: "🎵"

  };


  return icons[extension] || "📄";

}


// ==========================================================
// PROTECCIÓN CONTRA HTML
// ==========================================================

function escapeHTML(text) {

  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// ==========================================================
// INICIO
// ==========================================================

renderUnits();

console.log(
  "⚔ PORTAFOLIO BASE DE DATOS II - GITHUB ACTIVO ⚔"
);
