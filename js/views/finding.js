/* finding.js — matching with a driver (wireframe 16): the pending state.
   Never a blank screen — honest status, a live safety note, and a Cancel.
   Auto-matches to the arriving screen; demo links expose the exception
   paths (no driver / driver cancelled) deterministically for review. */

import { render, go, icon, $, toast } from "../ui.js";
import { getJourney, patch } from "../state.js";
import { mapBase, radar } from "../maps.js";
import { RIDES, DRIVER, formatINR } from "../mock-data.js";

let matchTimer;

export function view() {
  const j = getJourney();
  const r = RIDES.find((x) => x.id === (j.ride || "quickxl"));
  const fare = j.booking.fare || r.fare;
  const pickup = j.trip.pickup.title.split(" · ")[0];

  render(`
    <div class="screen">
      <div class="map-screen">
        <div class="map map--fill" style="min-height:260px">
          ${mapBase()}
          ${radar()}
        </div>
        <div class="sheet">
          <div class="sheet__grabber" aria-hidden="true"></div>
          <div class="row">
            <span class="icon-btn" aria-hidden="true"><span class="spinner"></span></span>
            <div>
              <h3 id="finding-title">Finding your ${r.name}…</h3>
              <p class="muted" id="finding-sub" style="font-size:var(--fs-14)" aria-live="polite">Matching you with a trusted driver nearby</p>
            </div>
          </div>

          <hr class="hr">
          <div class="row">
            <span class="ride__glyph">${icon(r.glyph, { size: 24 })}</span>
            <span class="ride__body">
              <span class="ride__name">${r.name} · ${pickup} pickup</span>
              <span class="ride__meta">Usually matched in under a minute</span>
            </span>
            <span class="ride__price">${formatINR(fare)}</span>
          </div>

          <p class="row" style="gap:var(--space-8);font-size:var(--fs-13)">
            <span class="badge badge--violet" style="padding:6px 8px">${icon("check", { size: 12, stroke: 3 })}</span>
            Trip recording &amp; live location ready to go
          </p>

          <button class="btn btn--secondary" id="cancel">Cancel</button>

          <div class="row" style="justify-content:center;gap:var(--space-12);padding-top:var(--space-4)">
            <span class="demo-tag">Demo</span>
            <button class="btn btn--link" id="demo-nomatch" style="padding:0;font-size:var(--fs-13)">Preview: no driver found</button>
            <button class="btn btn--link" id="demo-cancel" style="padding:0;font-size:var(--fs-13)">Preview: driver cancels</button>
          </div>
        </div>
      </div>
    </div>`);

  // Honest rotating status while matching.
  const sub = $("#finding-sub");
  setTimeout(() => { if (sub) sub.textContent = "Confirming your pickup point…"; }, 1600);

  // Auto-match → success (arriving).
  matchTimer = setTimeout(() => {
    patch({ booking: { ...getJourney().booking, status: "confirmed", pin: DRIVER.pin } });
    go("#/arriving");
  }, 3400);

  $("#cancel").addEventListener("click", () => {
    clearTimeout(matchTimer);
    patch({ booking: { status: "none", ref: null, pin: null } });
    toast("Search cancelled — no fee charged", { icon: "info" });
    go("#/home");
  });
  $("#demo-nomatch").addEventListener("click", () => { clearTimeout(matchTimer); go("#/no-match"); });
  $("#demo-cancel").addEventListener("click", () => { clearTimeout(matchTimer); go("#/cancelled"); });
}
