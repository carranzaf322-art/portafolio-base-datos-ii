const pages = document.querySelectorAll(".page");
const portfolioView = document.getElementById("portfolio-view");

const units = [
  { id: 1, name: "UNIDAD 01" },
  { id: 2, name: "UNIDAD 02" },
  { id: 3, name: "UNIDAD 03" },
  { id: 4, name: "UNIDAD 04" }
];


// ========================================
// NAVEGACIÓN ENTRE PÁGINAS
// ========================================

function showPage(id) {
  pages.forEach(page => {
    page.classList.toggle("active", page.id === id);
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


document.addEventListener("click", event => {

  const target = event.target.closest("[data-page]");

  if (!target) return;

  const page = target.dataset.page;

  if (page === "portfolio") {
    renderUnits();
  }

  showPage(page);

});


// ========================================
// MOSTRAR UNIDADES
// ========================================

function renderUnits() {

  portfolioView.innerHTML = `

    <div class="explorer-header">

      <p class="eyebrow">
        EXPLORADOR ACADÉMICO
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
            📁
          </div>

          <h2>
            ${unit.name}
          </h2>

          <p>
            Semanas 1 — 4
          </p>

        </article>

      `).join("")}

    </div>

  `;


  document.querySelectorAll("[data-unit]").forEach(folder => {

    folder.addEventListener("click", () => {

      renderWeeks(
        Number(folder.dataset.unit)
      );

    });

  });

}


// ========================================
// MOSTRAR SEMANAS
// ========================================

function renderWeeks(unitId) {

  const unit = units.find(
    item => item.id === unitId
  );


  portfolioView.innerHTML = `

    <div class="topbar">

      <button
        class="back"
        id="back-units">

        ← Unidades

      </button>

      <span>
        ${unit.name}
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
        Selecciona una semana para ver sus archivos.
      </p>

    </div>


    <div class="week-grid">

      ${[1, 2, 3, 4].map(week => `

        <article
          class="week"
          data-week="${week}">

          <div class="week-icon">
            📂
          </div>

          <h2>
            SEMANA ${week}
          </h2>

          <p>
            Explorar archivos
          </p>

        </article>

      `).join("")}

    </div>

  `;


  document
    .getElementById("back-units")
    .addEventListener("click", renderUnits);


  document
    .querySelectorAll("[data-week]")
    .forEach(card => {

      card.addEventListener("click", () => {

        renderFiles(
          unitId,
          Number(card.dataset.week)
        );

      });

    });

}


// ========================================
// BASE DE DATOS LOCAL
// ========================================

let db;


// Abrir IndexedDB
function openDB() {

  return new Promise((resolve, reject) => {

    const request = indexedDB.open(
      "PortafolioBaseDatosII",
      1
    );


    request.onupgradeneeded = event => {

      db = event.target.result;


      if (!db.objectStoreNames.contains("files")) {

        const store = db.createObjectStore(
          "files",
          {
            keyPath: "id",
            autoIncrement: true
          }
        );


        store.createIndex(
          "folder",
          "folder",
          {
            unique: false
          }
        );

      }

    };


    request.onsuccess = event => {

      db = event.target.result;

      resolve(db);

    };


    request.onerror = event => {

      reject(event.target.error);

    };

  });

}


// ========================================
// OBTENER ARCHIVOS DE UNA SEMANA
// ========================================

function getFiles(folder) {

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(
        ["files"],
        "readonly"
      );


    const store =
      transaction.objectStore("files");


    const index =
      store.index("folder");


    const request =
      index.getAll(folder);


    request.onsuccess = () => {

      resolve(request.result);

    };


    request.onerror = () => {

      reject(request.error);

    };

  });

}


// ========================================
// GUARDAR ARCHIVOS
// ========================================

function saveFiles(folder, fileList) {

  return new Promise((resolve, reject) => {

    const transaction =
      db.transaction(
        ["files"],
        "readwrite"
      );


    const store =
      transaction.objectStore("files");


    for (const file of fileList) {

      store.add({

        folder: folder,

        name: file.name,

        type: file.type,

        size: file.size,

        file: file,

        date: new Date().toLocaleString()

      });

    }


    transaction.oncomplete = () => {

      resolve();

    };


    transaction.onerror = event => {

      reject(event.target.error);

    };

  });

}


// ========================================
// MOSTRAR ARCHIVOS
// ========================================

async function renderFiles(unitId, weekId) {

  const path =
    `unidad-${String(unitId).padStart(2, "0")}/semana-${String(weekId).padStart(2, "0")}`;


  const files =
    await getFiles(path);


  portfolioView.innerHTML = `

    <div class="topbar">

      <button
        class="back"
        id="back-weeks">

        ← Semanas

      </button>

      <span>
        U${unitId} / S${weekId}
      </span>

    </div>


    <div class="explorer-header">

      <p class="eyebrow">
        ${path}
      </p>

      <h1>
        SEMANA ${weekId}
      </h1>

      <p>
        Archivos de esta semana.
      </p>

    </div>


    <!-- LISTA DE ARCHIVOS -->

    <div
      class="file-list"
      id="file-list">

      ${
        files.length === 0

        ?

        `
        <div class="empty">

          <p>
            Esta carpeta está vacía.
          </p>

          <small>
            Agrega tus archivos usando el botón de abajo.
          </small>

        </div>
        `

        :

        files.map(file => `

          <div
            class="file-item">

            <div class="file-icon">
              📄
            </div>


            <div class="file-info">

              <strong>
                ${file.name}
              </strong>

              <small>
                ${formatSize(file.size)}
              </small>

            </div>


            <div class="file-actions">

              <button
                class="file-btn"
                onclick="openFile(${file.id})">

                👁 VER

              </button>


              <button
                class="file-btn delete"
                onclick="deleteFile(${file.id}, ${unitId}, ${weekId})">

                🗑 ELIMINAR

              </button>

            </div>

          </div>

        `).join("")

      }

    </div>


    <!-- BOTÓN AGREGAR -->

    <div class="add-file-container">

      <button
        class="btn primary"
        id="add-file">

        ＋ AGREGAR ARCHIVO

      </button>

    </div>


    <!-- SELECTOR -->

    <input
      type="file"
      id="file-picker"
      multiple
      hidden>

  `;


  // Volver a semanas

  document
    .getElementById("back-weeks")
    .addEventListener(
      "click",
      () => renderWeeks(unitId)
    );


  // Botón agregar

  document
    .getElementById("add-file")
    .addEventListener(
      "click",
      () => {

        document
          .getElementById("file-picker")
          .click();

      }
    );


  // Seleccionar archivos

  document
    .getElementById("file-picker")
    .addEventListener(
      "change",
      async function () {

        const archivos =
          this.files;


        if (archivos.length === 0) {
          return;
        }


        try {

          await saveFiles(
            path,
            archivos
          );


          // Volver a cargar la semana

          renderFiles(
            unitId,
            weekId
          );


        } catch (error) {

          console.error(error);

          alert(
            "No se pudieron guardar los archivos."
          );

        }

      }
    );

}


// ========================================
// ABRIR / VER ARCHIVO
// ========================================

function openFile(id) {

  const transaction =
    db.transaction(
      ["files"],
      "readonly"
    );


  const store =
    transaction.objectStore("files");


  const request =
    store.get(id);


  request.onsuccess = () => {

    const data =
      request.result;


    if (!data) {

      alert(
        "No se encontró el archivo."
      );

      return;

    }


    const url =
      URL.createObjectURL(
        data.file
      );


    window.open(
      url,
      "_blank"
    );

  };

}


// ========================================
// ELIMINAR ARCHIVO
// ========================================

function deleteFile(id, unitId, weekId) {

  const confirmar =
    confirm(
      "¿Quieres eliminar este archivo?"
    );


  if (!confirmar) {
    return;
  }


  const transaction =
    db.transaction(
      ["files"],
      "readwrite"
    );


  const store =
    transaction.objectStore("files");


  store.delete(id);


  transaction.oncomplete = () => {

    renderFiles(
      unitId,
      weekId
    );

  };

}


// ========================================
// FORMATO DEL TAMAÑO
// ========================================

function formatSize(bytes) {

  if (bytes === 0) {
    return "0 Bytes";
  }


  const sizes = [
    "Bytes",
    "KB",
    "MB",
    "GB"
  ];


  const i =
    Math.floor(
      Math.log(bytes) /
      Math.log(1024)
    );


  return (
    Math.round(
      bytes /
      Math.pow(1024, i) *
      100
    ) / 100
  )
  + " "
  + sizes[i];

}


// ========================================
// INICIAR BASE DE DATOS
// ========================================

openDB()
  .then(() => {

    renderUnits();

  })
  .catch(error => {

    console.error(
      "Error al abrir la base de datos:",
      error
    );

  });