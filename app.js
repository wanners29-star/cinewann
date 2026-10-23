
const samples = [
  {
    id: "bbb",
    title: "Big Buck Bunny",
    category: "Películas",
    year: "2008",
    desc: "Cortometraje animado · Blender Open Movies",
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    colors: ["#236b69", "#12283a"],
    poster: "",
    legal: "Video de demostración. Verifica los términos de la fuente."
  },
  {
    id: "sintel",
    title: "Sintel",
    category: "Películas",
    year: "2010",
    desc: "Fantasía y aventura · Video de demostración",
    url: "",
    colors: ["#a34a32", "#27152b"],
    poster: "",
    placeholder: true
  },
  {
    id: "tears",
    title: "Tears of Steel",
    category: "Videos",
    year: "2012",
    desc: "Ciencia ficción · Video de demostración",
    url: "",
    colors: ["#356c88", "#19263f"],
    poster: "",
    placeholder: true
  },
  {
    id: "anime",
    title: "Anime gratuito",
    category: "Anime",
    year: "Colección",
    desc: "Añade anime con licencia abierta o permiso explícito",
    url: "",
    colors: ["#7c3e86", "#251c46"],
    placeholder: true
  },
  {
    id: "docs",
    title: "Documentales",
    category: "Documentales",
    year: "Colección",
    desc: "Añade documentales autorizados",
    url: "",
    colors: ["#4e765b", "#172c34"],
    placeholder: true
  },
  {
    id: "series",
    title: "Series libres",
    category: "Series",
    year: "Colección",
    desc: "Añade episodios de fuentes autorizadas",
    url: "",
    colors: ["#a65b45", "#35223a"],
    placeholder: true
  }
];

let custom = [];

try {
  const saved = JSON.parse(
    localStorage.getItem("cinewann.custom") || "[]"
  );
  if (Array.isArray(saved)) custom = saved;
} catch (error) {
  console.warn("No se pudieron cargar los videos guardados.", error);
}

let filter = "Todo";
let deferredPrompt = null;

const catalog = document.querySelector("#catalog");
const search = document.querySelector("#search");
const dialog = document.querySelector("#playerDialog");
const player = document.querySelector("#videoPlayer");
const toast = document.querySelector("#toast");

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
  }, 3200);
}

function render() {
  const query = search.value.trim().toLowerCase();

  const items = allItems().filter(item => {
    const matchesCategory =
      filter === "Todo" || item.category === filter;

    const text = [
      item.title,
      item.category,
      item.desc
    ].join(" ").toLowerCase();

    return matchesCategory &&
      (!query || text.includes(query));
  });

  document.querySelector("#sectionTitle").textContent =
    filter === "Todo" ? "Catálogo gratuito" : filter;

  document.querySelector("#count").textContent =
    `${items.length} ${items.length === 1 ? "título" : "títulos"}`;

  if (items.length === 0) {
    catalog.innerHTML =
      '<p class="empty-message">No encontramos títulos. Prueba otra búsqueda o categoría.</p>';
    return;
  }

  catalog.innerHTML = items.map(item => {
    const colors = item.colors || ["#344d69", "#171b2b"];
    const style = `--c1:${colors[0]};--c2:${colors[1]}`;
    const poster = item.poster
      ? `background-image:linear-gradient(0deg,#05070cf0,transparent 70%),url('${escapeHtml(item.poster)}');background-size:cover;background-position:center;`
      : "";

    return `
      <article class="movie"
        tabindex="0"
        role="button"
        data-id="${escapeHtml(item.id)}"
        aria-label="Abrir ${escapeHtml(item.title)}">

        <div class="poster" style="${style};${poster}">
          <span class="play-hover">▶</span>
          <div>
            <div class="poster-title">${escapeHtml(item.title)}</div>
            <span class="poster-sub">
              ${escapeHtml(item.category.toUpperCase())}
              · ${escapeHtml(item.year || "")}
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


function openItem(id) {
  const item = allItems().find(entry => entry.id === id);
  if (!item) return;

  if (item.placeholder || !item.url) {
    notify("Este título aún no tiene un video disponible.");
    document.querySelector("#addForm").hidden = false;
    document.querySelector("#addForm").scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
    return;
  }

  const title = document.querySelector("#playerTitle");

  player.pause();
  player.removeAttribute("src");
  player.load();

  title.textContent = item.title;

  player.addEventListener("error", function showVideoError() {
    const error = player.error;
    const messages = {
      1: "La carga del video fue cancelada.",
      2: "Error de red al descargar el video.",
      3: "No se pudo decodificar el video.",
      4: "El formato o la fuente no son compatibles."
    };

    notify(
      messages[error?.code] ||
      "No se pudo cargar el video. Comprueba la fuente."
    );
  }, { once: true });

  if (!dialog.open) {
    dialog.showModal();
  }

  player.src = item.url;
  player.load();

  player.play().catch(() => {
    notify("Pulsa ▶ en el reproductor para intentar reproducir.");
  });
}

function closePlayer() {
  player.pause();
  player.removeAttribute("src");
  player.load();

  if (dialog.open) dialog.close();
}

document.querySelector("#closePlayer").addEventListener(
  "click",
  closePlayer
);

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

document.querySelector("#heroPlay").addEventListener("click", () => {
  filter = "Todo";

  document.querySelectorAll(".nav").forEach(button => {
    button.classList.toggle("active", button.dataset.filter === "Todo");
  });

  render();
  catalog.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.querySelector("#showAdd").addEventListener("click", () => {
  document.querySelector("#addForm").hidden = false;
  document.querySelector("#addForm").scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
});

document.querySelector("#cancelAdd").addEventListener("click", () => {
  document.querySelector("#addForm").hidden = true;
});

document.querySelector("#addForm").addEventListener("submit", event => {
  event.preventDefault();

  const title = document.querySelector("#newTitle").value.trim();
  const url = document.querySelector("#newUrl").value.trim();
  const poster = document.querySelector("#newPoster").value.trim();
  const category = document.querySelector("#newCategory").value;

  if (!title || !/^https?:\/\//i.test(url)) {
    notify("Introduce un título y una URL válida.");
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
    notify("No se pudo guardar el video en este dispositivo.");
    return;
  }

  event.target.reset();
  event.target.hidden = true;
  filter = "Todo";

  document.querySelectorAll(".nav").forEach(button => {
    button.classList.toggle("active", button.dataset.filter === "Todo");
  });

  render();
  notify("Video añadido correctamente.");
});

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredPrompt = event;
  document.querySelector("#installBtn").hidden = false;
});

document.querySelector("#installBtn").addEventListener("click", async () => {
  if (!deferredPrompt) {
    notify("Usa el menú del navegador para instalar Cinewann.");
    return;
  }

  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  document.querySelector("#installBtn").hidden = true;
});

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(error => {
      console.warn("No se pudo registrar el service worker.", error);
    });
  });
}

document.querySelector("#year").textContent = new Date().getFullYear();

render();
