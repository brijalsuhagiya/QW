/* ride.js — choose a ride (wireframe 11).
   Side-by-side fares with savings, seats, bag-fit and ETA all visible.
   Shared is an option (not the default); safety tools are one tap away. */

import { render, go, icon, appbar, wireNav, $, $$ } from "../ui.js";
import { getJourney, patch } from "../state.js";
import { toast } from "../ui.js";
import { mapBase, routePath, car, pin } from "../maps.js";
import { RIDES, formatINR } from "../mock-data.js";

let selected;

export function view() {
  selected = getJourney().ride || "quickxl";
  paint();
}

function paint() {
  const rows = RIDES.map((r) => rideRow(r)).join("");
  const sel = RIDES.find((r) => r.id === selected);

  render(`
    <div class="screen">
      <div class="map-screen">
        <div class="map map--fill" style="min-height:150px">
          ${mapBase()}
          ${routePath({ points: [[18, 78], [50, 48], [82, 78]], color: "#0a0a0a" })}
          ${pin({ x: 18, y: 78, kind: "you" })}
          ${car({ x: 50, y: 48 })}
          <header class="appbar" style="position:absolute;top:0;left:0;right:0">
            <button class="icon-btn" data-nav="#/trip" style="background:#fff;box-shadow:var(--shadow-1)" aria-label="Go back">${icon("back", { size: 20 })}</button>
          </header>
        </div>

        <div class="sheet">
          <div class="sheet__grabber" aria-hidden="true"></div>
          <div class="row row--between">
            <h2>Choose a ride</h2>
            <span class="muted" style="font-size:var(--fs-14)">18 km · 32 min</span>
          </div>

          <button class="callout callout--violet" id="safety" style="width:100%;text-align:left">
            <span class="callout__icon" style="background:var(--c-violet)">${icon("shield", { size: 18 })}</span>
            <span class="callout__body">
              <span class="callout__title">Travelling solo? Safety tools are on</span>
              <span class="callout__text">Trusted driver · trip recording · live share</span>
            </span>
            <span class="list-row__chevron" style="align-self:center">${icon("chevron", { size: 18 })}</span>
          </button>

          <div class="stack-8" role="radiogroup" aria-label="Ride options" id="rides">${rows}</div>

          <div class="pay-row">
            <span class="pay-row__icon">${icon("rupee", { size: 18 })}</span>
            <span class="pay-row__body"><span class="pay-row__title">UPI · Pay by any app</span></span>
            <button class="btn btn--link" id="change-pay" style="padding:0">Change ›</button>
          </div>

          <button class="btn btn--primary" id="book">
            <span>Book ${sel.name}</span><span class="btn__divider">|</span><span class="btn__price">${formatINR(sel.fare)}</span>
          </button>
        </div>
      </div>
    </div>`);

  wireNav();
  $("#safety").addEventListener("click", () => go("#/safety"));
  $("#change-pay").addEventListener("click", () => toast("UPI selected for the demo — card & cash also supported", { icon: "wallet" }));
  $$("[data-ride]").forEach((btn) => btn.addEventListener("click", () => { selected = btn.getAttribute("data-ride"); paint(); }));
  $("#book").addEventListener("click", book);
}

/* One ride option row. */
function rideRow(r) {
  const isSel = r.id === selected;
  const save = r.saveFrom ? `<div class="save-text" style="font-size:var(--fs-13)">Save ${formatINR(r.saveFrom - r.fare)}</div>` : "";
  const tag = r.tag ? `<span class="badge badge--${r.tagStyle || "neutral"}">${r.tag}</span>` : "";
  return `
    <button class="ride ${isSel ? "is-selected" : ""}" data-ride="${r.id}" role="radio" aria-checked="${isSel}">
      <span class="ride__glyph">${icon(r.glyph, { size: 24 })}</span>
      <span class="ride__body">
        <span class="ride__name">${r.name} ${tag}</span>
        <span class="ride__meta">${r.meta}</span>
      </span>
      <span class="ride__right">
        <span class="ride__price">${formatINR(r.fare)}</span>
        ${save}
      </span>
    </button>`;
}

/* Book: route by option type. Shared → share flow; cabs → smart detour;
   bus → straight to confirm (a reserved seat, no detour). */
function book() {
  patch({ ride: selected, detour: { decided: false, taken: false } });
  if (selected === "shared") { go("#/share"); return; }
  if (selected === "acbus") { go("#/confirm"); return; }
  go("#/detour");
}
