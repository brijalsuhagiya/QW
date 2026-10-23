/* ============================================================
   ui.js — DOM helpers, inline icon set, toasts, loading overlay,
   fetch-based component loader, and simulated network timing.
   All DOM manipulation goes through here; view/flow files stay
   focused on logic and markup, not low-level DOM plumbing.
   ============================================================ */

/* ---- tiny DOM helpers ---- */
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* Set innerHTML of the screen container and fade it in.
   @param {string} html  markup for the active screen
   @returns {HTMLElement} the screen element */
export function render(html) {
  // Clear any leftover overlay / modal so each view starts from a clean state.
  document.querySelectorAll("#app-overlay, .modal").forEach((el) => el.remove());
  const screen = document.getElementById("screen");
  screen.innerHTML = html;
  screen.classList.remove("fade-in");
  void screen.offsetWidth;            // reflow so the animation restarts
  screen.classList.add("fade-in");
  screen.scrollTop = 0;
  return screen;
}

/* Navigate by hash (never pushState — GitHub Pages can't rewrite paths).
   @param {string} hash  e.g. "#/home" */
export function go(hash) {
  if (window.location.hash === hash) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    window.location.hash = hash;
  }
}

/* ---- Inline SVG icon set (no external requests) ----
   Each entry is the inner markup of a 24×24 stroke icon. */
const ICONS = {
  crosshair: '<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>',
  back: '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
  chevron: '<polyline points="9 18 15 12 9 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10"/>',
  work: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  train: '<rect x="5" y="3" width="14" height="13" rx="3"/><line x1="5" y1="11" x2="19" y2="11"/><circle cx="8.5" cy="13.5" r="0.6" fill="currentColor"/><circle cx="15.5" cy="13.5" r="0.6" fill="currentColor"/><line x1="7" y1="21" x2="9.5" y2="17"/><line x1="17" y1="21" x2="14.5" y2="17"/>',
  bus: '<rect x="4" y="4" width="16" height="13" rx="3"/><line x1="4" y1="11" x2="20" y2="11"/><circle cx="7.5" cy="20" r="1.4"/><circle cx="16.5" cy="20" r="1.4"/>',
  car: '<path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13"/><path d="M4 13h16a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z"/>',
  suv: '<path d="M4 12l1-4.5A2 2 0 0 1 7 6h10a2 2 0 0 1 2 1.5L20 12"/><path d="M3 12h18a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z"/><line x1="12" y1="6" x2="12" y2="12"/>',
  menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
  star: '<polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2"/>',
  record: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5" fill="currentColor"/>',
  share: '<circle cx="12" cy="12" r="3"/><path d="M12 2v7"/><path d="M12 15v7"/><path d="M4.5 7l3 2.5"/><path d="M19.5 7l-3 2.5"/>',
  shield: '<path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z"/><polyline points="9 12 11 14 15 10"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z"/>',
  message: '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.9 9.9 0 0 1-4-.8L3 21l1.9-4.5A8.4 8.4 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z"/>',
  arrowup: '<line x1="12" y1="20" x2="12" y2="5"/><polyline points="6 11 12 5 18 11"/>',
  close: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
  info: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="8" r="0.5" fill="currentColor"/>',
  clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>',
  sos: '<path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z"/><line x1="12" y1="8" x2="12" y2="13"/><circle cx="12" cy="16.5" r="0.5" fill="currentColor"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3"/><circle cx="12" cy="16.5" r="0.5" fill="currentColor"/>',
  refresh: '<polyline points="22 11 22 5 16 5"/><path d="M21 5l-5.5 5.5A8 8 0 1 0 19 16"/>',
  rupee: '<path d="M7 5h10M7 9h10M15 5c0 4-3 5-6 5l6 8"/>',
  percent: '<line x1="19" y1="5" x2="5" y2="19"/><circle cx="7.5" cy="7.5" r="2"/><circle cx="16.5" cy="16.5" r="2"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 12h3"/><path d="M3 9h15a0 0 0 0 1 0 0v0"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="3" x2="8" y2="6"/><line x1="16" y1="3" x2="16" y2="6"/>',
  download: '<path d="M12 3v12"/><polyline points="7 11 12 16 17 11"/><path d="M5 20h14"/>',
  bag: '<path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  station: '<path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  seat: '<path d="M6 19v-7a2 2 0 0 1 2-2h5l3 4v5"/><path d="M4 19h16"/>',
  dot: '<circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
};

/* Build an inline SVG icon string.
   @param {string} name  key in ICONS
   @param {object} opt   { size, stroke, cls, fill }
   @returns {string} svg markup */
export function icon(name, opt = {}) {
  const body = ICONS[name] || "";
  const size = opt.size || 22;
  const sw = opt.stroke != null ? opt.stroke : 2;
  const fill = opt.fill || "none";
  const cls = opt.cls ? ` class="${opt.cls}"` : "";
  return `<svg${cls} width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

/* ---- Toasts ---- */
/* Show a transient toast. Announced to screen readers via the live wrap.
   @param {string} msg
   @param {object} opt  { type: 'default'|'savings'|'danger', icon, duration } */
export function toast(msg, opt = {}) {
  const wrap = document.getElementById("toast-wrap");
  const el = document.createElement("div");
  el.className = "toast" + (opt.type && opt.type !== "default" ? ` toast--${opt.type}` : "");
  const ic = opt.icon ? `<span class="toast__icon">${icon(opt.icon, { size: 18 })}</span>` : "";
  el.innerHTML = `${ic}<span>${msg}</span>`;
  wrap.appendChild(el);
  const dur = opt.duration || 2600;
  setTimeout(() => {
    el.classList.add("is-out");
    setTimeout(() => el.remove(), 240);
  }, dur);
}

/* ---- Loading overlay with honest messaging + timeout fallback ---- */
/* Show a loading overlay inside the app frame.
   @param {string} title
   @param {string} msg
   @returns {HTMLElement} the overlay element */
export function showOverlay(title, msg) {
  const app = document.getElementById("app");
  hideOverlay();
  const el = document.createElement("div");
  el.className = "overlay";
  el.id = "app-overlay";
  el.setAttribute("role", "status");
  el.innerHTML = `
    <div class="spinner spinner--lg" aria-hidden="true"></div>
    <div class="overlay__title">${title}</div>
    <div class="overlay__msg" id="overlay-msg">${msg || ""}</div>`;
  app.appendChild(el);
  return el;
}
export function setOverlayMsg(msg) {
  const m = document.getElementById("overlay-msg");
  if (m) m.textContent = msg;
}
export function hideOverlay() {
  const ex = document.getElementById("app-overlay");
  if (ex) ex.remove();
}

/* Run a simulated network action with honest, rotating status messages and
   an 8s "taking longer than usual" fallback, then resolve.
   @param {object} opt { title, messages[], duration, onSlow }
   @returns {Promise<void>} */
export function simulateNetwork({ title = "Working…", messages = [], duration = 1800, onSlow } = {}) {
  showOverlay(title, messages[0] || "");
  let i = 0;
  const rotate = setInterval(() => {
    i = Math.min(i + 1, messages.length - 1);
    setOverlayMsg(messages[i] || "");
  }, Math.max(900, duration / Math.max(1, messages.length)));
  const slowTimer = setTimeout(() => {
    setOverlayMsg("Taking longer than usual on a slow connection — hang on, we won't lose your progress.");
    if (typeof onSlow === "function") onSlow();
  }, 8000);
  return new Promise((resolve) => {
    setTimeout(() => {
      clearInterval(rotate);
      clearTimeout(slowTimer);
      hideOverlay();
      resolve();
    }, duration);
  });
}

/* ---- Fetch-based component loader (relative paths only) ----
   Loads a reusable HTML component and caches it so slow networks are
   hit at most once. Used for the support sheet.
   @param {string} relativePath  e.g. "components/support-sheet.html"
   @returns {Promise<string>} the component HTML (empty string on failure) */
const componentCache = new Map();
export async function loadComponentHTML(relativePath) {
  if (componentCache.has(relativePath)) return componentCache.get(relativePath);
  try {
    const res = await fetch(relativePath);
    if (!res.ok) throw new Error(res.status);
    const html = await res.text();
    componentCache.set(relativePath, html);
    return html;
  } catch (e) {
    return ""; // core flow must still work if a component fails to load
  }
}

/* ---- Modal (bottom sheet) open/close for the support sheet ---- */
/* Open a modal with given inner HTML. Returns a close() fn.
   Closes on backdrop click and Escape; traps nothing heavy (prototype). */
export function openModal(innerHTML) {
  const app = document.getElementById("app");
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `<div class="modal__backdrop"></div><div class="modal__panel" role="dialog" aria-modal="true">${innerHTML}</div>`;
  app.appendChild(modal);
  const close = () => {
    modal.classList.add("is-closing");
    setTimeout(() => modal.remove(), 240);
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => { if (e.key === "Escape") close(); };
  modal.querySelector(".modal__backdrop").addEventListener("click", close);
  document.addEventListener("keydown", onKey);
  return close;
}

/* Reusable screen chrome: a back app-bar.
   @param {object} opt { title, sub, backHash }
   @returns {string} markup */
export function appbar({ title = "", sub = "", backHash = null, inline = false } = {}) {
  const back = backHash
    ? `<button class="icon-btn" data-nav="${backHash}" aria-label="Go back">${icon("back", { size: 20 })}</button>`
    : "";
  const titles = title
    ? `<div><div class="appbar__title">${title}</div>${sub ? `<div class="appbar__sub">${sub}</div>` : ""}</div>`
    : "";
  return `<header class="appbar">${back}${titles}</header>`;
}

/* Attach click handlers for any element with data-nav="#/route". */
export function wireNav(root = document) {
  $$("[data-nav]", root).forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      go(el.getAttribute("data-nav"));
    });
  });
}
