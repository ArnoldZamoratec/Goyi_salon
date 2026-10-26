// Goyi Salón & Spa
const WHATSAPP = "51986151032";

// Horario (0 = domingo). Mantener sincronizado con la tabla de horario del HTML.
const HOURS = {
  0: [9, 14],
  1: [9, 20], 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 20], 6: [9, 20],
};

// Entrada de la portada
document.documentElement.classList.add("js");
requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add("is-loaded")));

document.getElementById("year").textContent = new Date().getFullYear();

// Header: transparente sobre la portada, sólido al bajar
const header = document.getElementById("header");
const hero = document.getElementById("inicio");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > hero.offsetHeight - 220);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Menú móvil
const navToggle = document.getElementById("navToggle");
const nav = document.getElementById("nav");
const setNav = (open) => {
  nav.classList.toggle("is-open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
};
navToggle.addEventListener("click", () => setNav(!nav.classList.contains("is-open")));
nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setNav(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });

// Enlace activo según la sección visible
const links = [...nav.querySelectorAll('a[href^="#"]:not(.btn)')];
const spy = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
links.forEach((l) => {
  const s = document.querySelector(l.getAttribute("href"));
  if (s) spy.observe(s);
});

// Carta de servicios
const tabs = [...document.querySelectorAll(".menu [role=tab]")];
const selectCat = (cat, focus = false) => {
  tabs.forEach((t) => {
    const on = t.dataset.cat === cat;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    if (on && focus) t.focus();
  });
  document.querySelectorAll(".panel").forEach((p) => {
    const on = p.id === "p-" + cat;
    if (on && p.hidden) {
      p.hidden = false;
      p.classList.remove("is-entering");
      void p.offsetWidth;
      p.classList.add("is-entering");
    } else if (!on) {
      p.hidden = true;
    }
  });
};
tabs.forEach((t, i) => {
  t.addEventListener("click", () => selectCat(t.dataset.cat));
  t.addEventListener("keydown", (e) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    selectCat(tabs[(i + step + tabs.length) % tabs.length].dataset.cat, true);
  });
});
document.querySelectorAll(".arches a").forEach((a) => {
  a.addEventListener("click", () => selectCat(a.dataset.cat));
});

// Carril de promociones
const rail = document.getElementById("rail");
const railBtns = document.querySelectorAll(".rail-btn");
const updateRail = () => {
  railBtns[0].disabled = rail.scrollLeft < 8;
  railBtns[1].disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 8;
};
railBtns.forEach((b) => b.addEventListener("click", () => {
  rail.scrollBy({ left: Number(b.dataset.dir) * rail.clientWidth * 0.8 });
}));
rail.addEventListener("scroll", updateRail, { passive: true });
window.addEventListener("resize", updateRail);
updateRail();

// Preseleccionar servicio al ir a reservar
const serviceSelect = document.getElementById("serviceSelect");
const preselect = (name) => {
  if (!name) return;
  const opt = [...serviceSelect.options].find((o) => o.value === name);
  if (opt) serviceSelect.value = opt.value;
};
document.querySelectorAll("a[data-service]").forEach((a) => {
  a.addEventListener("click", () => preselect(a.dataset.service));
});

// Lightbox de promociones
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCta = document.getElementById("lightboxCta");
document.querySelectorAll(".flyer").forEach((btn) => {
  btn.addEventListener("click", () => {
    lightboxImg.src = btn.dataset.img;
    lightboxImg.alt = btn.querySelector("img").alt;
    lightboxCta.dataset.service = btn.dataset.service;
    lightbox.showModal();
  });
});
document.getElementById("lightboxClose").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.close(); });
lightboxCta.addEventListener("click", () => {
  preselect(lightboxCta.dataset.service);
  lightbox.close();
});

// Fecha mínima = hoy
const dateInput = document.getElementById("dateInput");
const today = new Date();
const pad = (n) => String(n).padStart(2, "0");
dateInput.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

// Formulario de reserva → WhatsApp
const form = document.getElementById("bookingForm");
const formError = document.getElementById("formError");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  let valid = true;
  form.querySelectorAll("[required]").forEach((field) => {
    const ok = field.checkValidity() && field.value.trim() !== "";
    field.classList.toggle("is-invalid", !ok);
    field.setAttribute("aria-invalid", String(!ok));
    if (!ok) valid = false;
  });
  formError.hidden = valid;
  if (!valid) {
    form.querySelector(".is-invalid").focus();
    return;
  }

  const data = new FormData(form);
  const [y, m, d] = data.get("fecha").split("-");
  const lines = [
    "Hola Goyi Salón & Spa 💜, quiero reservar una cita:",
    "",
    `👤 Nombre: ${data.get("nombre").trim()}`,
    `📱 Celular: ${data.get("celular").trim()}`,
    `💅 Servicio: ${data.get("servicio")}`,
    `📅 Día: ${d}/${m}/${y}`,
    `🕐 Horario: ${data.get("hora")}`,
  ];
  const notes = data.get("comentarios").trim();
  if (notes) lines.push(`📝 Comentarios: ${notes}`);

  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
});
form.querySelectorAll("[required]").forEach((f) =>
  f.addEventListener("input", () => {
    f.classList.remove("is-invalid");
    f.removeAttribute("aria-invalid");
  })
);

// Abierto / cerrado (hora de Lima)
const openStatus = document.getElementById("openStatus");
const lima = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Lima" }));
const [opens, closes] = HOURS[lima.getDay()];
const hour = lima.getHours() + lima.getMinutes() / 60;
const isOpen = hour >= opens && hour < closes;
openStatus.textContent = isOpen ? "Abierto ahora" : "Cerrado ahora. Puedes dejarnos tu reserva por WhatsApp.";
openStatus.classList.add(isOpen ? "is-open" : "is-closed");
