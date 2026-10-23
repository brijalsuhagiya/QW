/* share.js — share your ride (wireframe 13).
   Savings AND the matched, verified co-passenger are shown together,
   with women-only and max-one controls (trust-first sharing). */

import { render, go, icon, appbar, wireNav, $, $$ } from "../ui.js";
import { getJourney, patchSlice } from "../state.js";
import { CO_PASSENGER, RIDES, formatINR } from "../mock-data.js";

export function view() {
  const solo = RIDES.find((r) => r.id === "quickxl").fare;      // 412
  const shared = RIDES.find((r) => r.id === "shared").fare;      // 168
  const save = solo - shared;
  const pct = Math.round((save / solo) * 100);
  const sh = getJourney().share;

  render(`
    <div class="screen">
      ${appbar({ title: "Share your ride", backHash: "#/ride" })}
      <div class="screen__body">
        <p class="lead">Travelling solo? Share your route with a verified co-passenger and split the fare.</p>

        <div class="panel" style="background:var(--c-mobility);color:#fff">
          <div class="eyebrow" style="color:rgba(255,255,255,0.72)">You save</div>
          <div class="row" style="align-items:baseline;gap:var(--space-12);margin-top:var(--space-4)">
            <span class="price price--lg" style="font-size:var(--fs-42)">${formatINR(save)}</span>
            <span><span class="strike" style="color:rgba(255,255,255,0.6)">${formatINR(solo)}</span><br><b>now ${formatINR(shared)}</b></span>
          </div>
          <div style="color:rgba(255,255,255,0.82);margin-top:var(--space-8)">That's ${pct}% off your solo fare</div>
        </div>

        <div class="identity">
          <span class="avatar" style="background:${CO_PASSENGER.color}">${CO_PASSENGER.initial}</span>
          <span class="identity__body">
            <span class="identity__name">${CO_PASSENGER.name}
              <span class="rating">${icon("star", { size: 13, fill: "currentColor", stroke: 0 })} ${CO_PASSENGER.rating}</span>
              <span class="badge badge--violet">Verified</span>
            </span>
            <span class="identity__sub">${CO_PASSENGER.note}</span>
          </span>
        </div>

        <p class="row" style="gap:var(--space-8);color:var(--c-savings);font-weight:var(--fw-semibold);font-size:var(--fs-14)">
          ${icon("check", { size: 16, stroke: 2.6 })} 1 co-passenger matched on the same route
        </p>

        <div class="eyebrow">Preferences</div>
        <div class="panel" style="padding:var(--space-8) var(--space-16)">
          <div class="list-row" style="border:none">
            <span class="list-row__body"><span class="list-row__title">Women co-passengers only</span><span class="list-row__sub">Match me with women riders</span></span>
            <label class="switch"><input type="checkbox" data-pref="womenOnly" ${sh.womenOnly ? "checked" : ""} aria-label="Women co-passengers only"><span class="switch__track"></span><span class="switch__thumb"></span></label>
          </div>
          <hr class="hr">
          <div class="list-row" style="border:none">
            <span class="list-row__body"><span class="list-row__title">Max 1 co-passenger</span><span class="list-row__sub">Keep it quick &amp; comfortable</span></span>
            <label class="switch"><input type="checkbox" data-pref="maxOne" ${sh.maxOne ? "checked" : ""} aria-label="Maximum one co-passenger"><span class="switch__track"></span><span class="switch__thumb"></span></label>
          </div>
        </div>
      </div>

      <div class="screen__footer">
        <button class="btn btn--mobility" id="share-btn">
          <span>Share ride</span><span class="btn__divider">|</span><span class="btn__price">save ${formatINR(save)}</span>
        </button>
      </div>
    </div>`);

  wireNav();
  $$("[data-pref]").forEach((inp) => inp.addEventListener("change", () => {
    patchSlice("share", { [inp.getAttribute("data-pref")]: inp.checked });
  }));
  $("#share-btn").addEventListener("click", () => {
    patchSlice("share", { enabled: true });
    go("#/confirm");
  });
}
