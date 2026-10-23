/* ============================================================
   maps.js — map visuals drawn entirely in CSS + inline SVG.
   No tiles, no image requests, nothing to fail on a slow network.
   Each function returns a markup string composed into a .map box.
   ============================================================ */

/* The street grid + green blocks that sit behind every map.
   @returns {string} markup for the base layer */
export function mapBase() {
  const streets = [
    '<div class="map__street map__street--h" style="top:28%"></div>',
    '<div class="map__street map__street--h" style="top:62%"></div>',
    '<div class="map__street map__street--v" style="left:30%"></div>',
    '<div class="map__street map__street--v" style="left:66%"></div>',
  ].join("");
  const blocks = [
    '<div class="map__block" style="left:6%;top:6%;width:20%;height:16%"></div>',
    '<div class="map__block" style="left:72%;top:8%;width:20%;height:14%"></div>',
    '<div class="map__block" style="left:8%;top:70%;width:18%;height:18%"></div>',
    '<div class="map__block" style="left:70%;top:68%;width:22%;height:20%"></div>',
    '<div class="map__block" style="left:40%;top:40%;width:18%;height:14%"></div>',
  ].join("");
  return `<div class="map__streets">${streets}</div>${blocks}`;
}

/* A location pin.
   @param {object} o { x, y, kind:'you'|'dest', label, labelStyle }
   @returns {string} */
export function pin({ x, y, kind = "you", label = "", labelStyle = "" }) {
  const lab = label
    ? `<span class="map-pin__label ${labelStyle}">${label}</span>`
    : "";
  const labTop = labelStyle.includes("top");
  return `<div class="map-pin" style="left:${x}%;top:${y}%">
    ${labTop ? lab : ""}
    <span class="map-pin__dot map-pin__dot--${kind}"></span>
    ${!labTop ? lab : ""}
  </div>`;
}

/* A lettered pickup marker (A/B/C).
   @param {object} o { x, y, letter, active } */
export function mark({ x, y, letter, active = false }) {
  return `<div class="map-mark ${active ? "is-active" : ""}" style="left:${x}%;top:${y}%" data-mark="${letter}">${letter}</div>`;
}

/* Station landmark pill with an icon.
   @param {object} o { x, y, label } */
export function landmark({ x, y, label }) {
  return `<div class="map-landmark" style="left:${x}%;top:${y}%">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="13" rx="3"/><line x1="5" y1="11" x2="19" y2="11"/><line x1="7" y1="21" x2="9.5" y2="17"/><line x1="17" y1="21" x2="14.5" y2="17"/></svg>
    <span class="map-landmark__label">${label}</span>
  </div>`;
}

/* A vehicle glyph on the map.
   @param {object} o { x, y } */
export function car({ x, y }) {
  return `<div class="map-car" style="left:${x}%;top:${y}%">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="#0a0a0a" stroke="none"><path d="M4 13l1.3-4A2.4 2.4 0 0 1 7.6 7h8.8a2.4 2.4 0 0 1 2.3 2l1.3 4v4a1 1 0 0 1-1 1h-1.2a1.8 1.8 0 0 1-3.6 0H9.4a1.8 1.8 0 0 1-3.6 0H4.6a1 1 0 0 1-1-1z"/></svg>
  </div>`;
}

/* An SVG route line between two points (dashed or solid).
   @param {object} o { from:[x,y], to:[x,y], dashed, color }
   points are in 0..100 viewBox units */
export function routeLine({ from, to, dashed = false, color = "#0a0a0a" }) {
  const dash = dashed ? 'stroke-dasharray="3 4"' : "";
  return `<svg class="map__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <line x1="${from[0]}" y1="${from[1]}" x2="${to[0]}" y2="${to[1]}" stroke="${color}" stroke-width="1.4" stroke-linecap="round" ${dash}/>
  </svg>`;
}

/* A bent (two-segment) route line, as seen on the "choose a ride" map.
   @param {object} o { points:[[x,y],...], color } */
export function routePath({ points, color = "#0a0a0a", dashed = false }) {
  const d = points.map((p, i) => (i === 0 ? "M" : "L") + p[0] + " " + p[1]).join(" ");
  const dash = dashed ? 'stroke-dasharray="3 4"' : "";
  return `<svg class="map__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <path d="${d}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ${dash}/>
  </svg>`;
}

/* The radar pulse used while finding a driver. */
export function radar() {
  return `<div class="radar" aria-hidden="true">
    <span class="radar__ring"></span><span class="radar__ring"></span><span class="radar__ring"></span>
    <span class="radar__core"></span>
  </div>`;
}

/* Compose a full map box.
   @param {object} o { className, layers:[html...] } */
export function mapBox({ className = "map--fill", layers = [] } = {}) {
  return `<div class="map ${className}">${mapBase()}${layers.join("")}</div>`;
}
