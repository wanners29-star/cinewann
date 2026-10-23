

const samples = [
  {
    id: "bbb",
    title: "Big Buck Bunny",
    category: "Películas",
    year: "2008",
    desc: "Animación y comedia · Video de muestra",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    colors: ["#236b69", "#12283a"],
    poster: ""
  },
  {
    id: "sintel",
    title: "Sintel",
    category: "Películas",
    year: "2010",
    desc: "Fantasía y aventura · Animación",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    colors: ["#a34a32", "#27152b"],
    poster: "",
    placeholder: false
  },
  {
    id: "tears",
    title: "Tears of Steel",
    category: "Videos",
    year: "2012",
    desc: "Ciencia ficción · Efectos visuales",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    colors: ["#356c88", "#19263f"],
    poster: "",
    placeholder: false
  },
  {
    id: "elephants",
    title: "Elephants Dream",
    category: "Películas",
    year: "2006",
    desc: "Animación · Ciencia ficción",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    colors: ["#b17a3f", "#30243c"],
    poster: "",
    placeholder: false
  },
  {
    id: "anime",
    title: "Anime gratuito",
    category: "Anime",
    year: "Colección",
    desc: "Anime con licencia abierta o permiso explícito",
    url: "",
    colors: ["#7c3e86", "#251c46"],
    poster: "",
    placeholder: true
  },
  {
    id: "docs",
    title: "Documentales",
    category: "Documentales",
    year: "Colección",
    desc: "Documentales autorizados",
    url: "",
    colors: ["#4e765b", "#172c34"],
    poster: "",
    placeholder: true
  },
  {
    id: "series",
    title: "Series libres",
    category: "Series",
    year: "Colección",
    desc: "Episodios de fuentes autorizadas",
    url: "",
    colors: ["#a65b45", "#35223a"],
    poster: "",
    placeholder: true
  }
];

let custom = [];
let filter = "Todo";
let deferredPrompt = null;
let activeUrl = "";

try {
  const saved = JSON.parse(localStorage.getItem("cinewann.custom") || "[]");
  if (Array.isArray(saved)) custom = saved;
} catch (error) {
  console.warn("No se pudieron recuperar los videos guardados.", error);
}

const $ = selector => document.querySelector(selector);
const catalog = $("#catalog");
const search = $("#search");
const dialog = $("#playerDialog");
const player = $("#videoPlayer");
const toast = $("#toast");

function allItems() {
  return [...samples, ...custom];
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function notify(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => {
    toast.hidden = true;
  }, 5000);
}

function render() {
  const query = search.value.trim().toLowerCase();

  const items = allItems().filter(item => {
    const categoryMatch = filter === "Todo" || item.category === filter;
    const text = `${item.title} ${item.category} ${item.desc}`.toLowerCase();
    return categoryMatch && (!query || text.includes(query));
  });

  $("#sectionTitle").textContent =
    filter === "Todo" ? "Catálogo gratuito" : filter;

  $("#count").textContent =
    `${items.length} ${items.length === 1 ? "título" : "títulos"}`;

  if (!items.length) {
    catalog.innerHTML =
      '<p>No hay títulos para esta búsqueda. Prueba otra categoría.</p>';
    return;
  }

  catalog.innerHTML = items.map(item => {
    const colors = item.colors || ["#344d69", "#171b2b"];
    const posterStyle = item.poster
      ? `background-image:linear-gradient(0deg,#05070cf0,transparent 70%),url("${escapeHtml(item.poster)}");background-size:cover;background-position:center;`
      : "";

    return `
      <article class="movie" tabindex="0" role="button"
        data-id="${escapeHtml(item.id)}"
        aria-label="Abrir ${escapeHtml(item.title)}">
        <div class="poster"
          style="--c1:${colors[0]};--c2:${colors[1]};${posterStyle}">
          <span class="play-hover">▶</span>
          <div>
            <div class="poster-title">${escapeHtml(item.title)}</div>
            <span class="poster-sub">
              ${escapeHtml(item.category.toUpperCase())} ·
              ${escapeHtml(item.year || "")}
            </span>
          </div>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.desc || item.category)}</p>
        <span class="tag">${item.placeholder ? "PRÓXIMAMENTE" : "GRATIS"}</span>
      </article>
    `;
  }).join("");

  catalog.querySelectorAll(".movie").forEach(card => {
    const open = () => openItem(card.dataset.id);
    card.addEventListener("click", open);
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}

function showDiagnostic(message) {
  let panel = $("#videoDiagnostic");

  if (!panel) {
    panel = document.createElement("div");
    panel.id = "videoDiagnostic";
    panel.style.cssText =
      "margin-top:12px;padding:14px;background:#172131;border:1px solid #35445a;border-radius:10px;color:#f4f6fa;font-size:13px;line-height:1.6";

    player.insertAdjacentElement("afterend", panel);
  }

  panel.replaceChildren();

  const text = document.createElement("p");
  text.textContent = message;
  text.style.margin = "0 0 10px";
  panel.appendChild(text);

  const link = document.createElement("a");
  link.href = activeUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Abrir video directamente";
  link.style.cssText = "color:#ff7587;font-weight:700";
  panel.appendChild(link);

  const retry = document.createElement("button");
  retry.type = "button";
  retry.textContent = "Reintentar";
  retry.style.cssText =
    "display:block;margin-top:12px;padding:9px 13px;border:0;border-radius:8px;background:#ff3c55;color:white;cursor:pointer";
  retry.addEventListener("click", () => {
    player.load();
    player.play().catch(() => {});
  });
  panel.appendChild(retry);
}

function clearDiagnostic() {
  $("#videoDiagnostic")?.remove();
}

function openItem(id) {
  const item = allItems().find(entry => entry.id === id);
  if (!item) return;

  if (item.placeholder || !item.url) {
    notify("Este título aún no tiene una fuente de video configurada.");
    $("#addForm").hidden = false;
    $("#addForm").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  activeUrl = item.url;
  $("#playerTitle").textContent = item.title;

  player.pause();
  player.removeAttribute("src");
  player.load();
  clearDiagnostic();

  if (!dialog.open) dialog.showModal();

  player.onerror = () => {
    const code = player.error?.code;
    const messages = {
      1: "La reproducción se canceló antes de terminar.",
      2: "Error de red: el video no se pudo descargar.",
      3: "El navegador descargó el video, pero no pudo decodificarlo.",
      4: "La fuente o el formato no son compatibles con este reproductor."
    };

    showDiagnostic(
      messages[code] ||
      "No se pudo cargar el video. Comprueba la conexión y la fuente."
    );
  };

  player.onloadedmetadata = () => {
    clearDiagnostic();
  };

  player.onplaying = () => {
    clearDiagnostic();
  };

  player.onwaiting = () => {
    showDiagnostic("El video está esperando datos del servidor. Espera unos segundos.");
  };

  player.src = activeUrl;
  
  let directLink = document.querySelector("#directVideoLink");

  if (!directLink) {
    directLink = document.createElement("a");
    directLink.id = "directVideoLink";
    directLink.target = "_blank";
    directLink.rel = "noopener noreferrer";
    directLink.textContent = "Abrir video directamente";
    directLink.style.cssText =
      "display:block;margin:12px 0;padding:12px;background:#ff3c55;color:white;text-align:center;text-decoration:none;border-radius:8px;font-weight:bold";

    player.insertAdjacentElement("afterend", directLink);
  }

  directLink.href = activeUrl;
  directLink.hidden = false;
  
  player.load();

  player.play().catch(error => {
    if (error.name === "NotAllowedError") {
      showDiagnostic("El navegador bloqueó el inicio automático. Pulsa ▶ en el video.");
    } else {
      showDiagnostic(
        "El navegador no pudo iniciar el video. Puedes abrir la fuente directamente para comprobarla."
      );
    }
  });
}

function closePlayer() {
  player.pause();
  player.removeAttribute("src");
  player.load();
  player.onerror = null;
  player.onloadedmetadata = null;
  player.onplaying = null;
  player.onwaiting = null;
  activeUrl = "";
  clearDiagnostic();

  if (dialog.open) dialog.close();
}

$("#closePlayer").addEventListener("click", closePlayer);

dialog.addEventListener("click", event => {
  if (event.target === dialog) closePlayer();
});

search.addEventListener("input", render);

document.querySelectorAll(".nav").forEach(button => {
  button.addEventListener("click", () => {
    filter = button.dataset.filter;

    document.querySelectorAll(".nav").forEach(nav => {
      nav.classList.toggle("active", nav === button);
    });

    render();
  });
});

$("#heroPlay").addEventListener("click", () => {
  filter = "Todo";

  document.querySelectorAll(".nav").forEach(button => {
    button.classList.toggle("active", button.dataset.filter === "Todo");
  });

  render();
  catalog.scrollIntoView({ behavior: "smooth", block: "start" });
});

$("#showAdd").addEventListener("click", () => {
  $("#addForm").hidden = false;
  $("#addForm").scrollIntoView({ behavior: "smooth", block: "center" });
});

$("#cancelAdd").addEventListener("click", () => {
  $("#addForm").hidden = true;
});

$("#addForm").addEventListener("submit", event => {
  event.preventDefault();

  const title = $("#newTitle").value.trim();
  const url = $("#newUrl").value.trim();
  const poster = $("#newPoster").value.trim();
  const category = $("#newCategory").value;

  if (!title || !/^https?:\/\//i.test(url)) {
    notify("Escribe un título y una URL válida.");
    return;
  }

  const item = {
    id: "custom-" + Date.now(),
    title,
    category,
    year: "Añadido",
    desc: "Contenido añadido por ti",
    url,
    poster,
    colors: ["#475c77", "#171b2b"],
    placeholder: false
  };

  custom.push(item);

  try {
    localStorage.setItem("cinewann.custom", JSON.stringify(custom));
  } catch (error) {
    custom.pop();
    notify("No se pudo guardar el video en este navegador.");
    return;
  }

  event.target.reset();
  event.target.hidden = true;
  filter = "Todo";

  document.querySelectorAll(".nav").forEach(button => {
    button.classList.toggle("active", button.dataset.filter === "Todo");
  });

  render();
  notify("Video añadido en este dispositivo.");
});

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredPrompt = event;
  $("#installBtn").hidden = false;
});

$("#installBtn").addEventListener("click", async () => {
  if (!deferredPrompt) {
    notify("Usa el menú del navegador para instalar Cinewann.");
    return;
  }

  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  $("#installBtn").hidden = true;
});

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(error => {
      console.warn("No se pudo registrar el service worker.", error);
    });
  });
}

$("#year").textContent = new Date().getFullYear();
render();
