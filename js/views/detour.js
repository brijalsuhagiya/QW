/* detour.js — a cheaper route is available (wireframe 14).
   Transparency on surge/toll avoidance: extra time and savings shown
   together so the traveller chooses with full information. */

import { render, go, icon, appbar, wireNav, $ } from "../ui.js";
import { patchSlice } from "../state.js";
import { mapBase, routePath, pin } from "../maps.js";
import { DETOUR, formatINR } from "../mock-data.js";

export function view() {
  render(`
    <div class="screen">
      <div class="map-screen">
        <div class="map map--fill" style="min-height:160px">
          ${mapBase()}
          ${routePath({ points: [[30, 40], [55, 20]], color: "#c9ccd1", dashed: true })}
          ${routePath({ points: [[30, 40], [48, 42], [70, 72]], color: "#0a0a0a" })}
          ${pin({ x: 30, y: 40, kind: "you" })}
          ${pin({ x: 70, y: 72, kind: "dest" })}
          <div class="chip" style="position:absolute;left:46%;top:56%;transform:translate(-50%,-50%);background:var(--c-savings);color:#fff;border:none">Save ${formatINR(DETOUR.save)}</div>
          <header class="appbar" style="position:absolute;top:0;left:0;right:0">
            <button class="icon-btn" data-nav="#/ride" style="background:#fff;box-shadow:var(--shadow-1)" aria-label="Go back">${icon("back", { size: 20 })}</button>
          </header>
        </div>

        <div class="sheet">
          <div class="sheet__grabber" aria-hidden="true"></div>
          <div class="stack-8">
            <h2>A cheaper route is available</h2>
            <p class="lead">A small detour skips the toll &amp; surge zone.</p>
          </div>

          <div class="card">
            <div class="row row--between">
              <div><div class="strong">${DETOUR.direct.label}</div><div class="muted" style="font-size:var(--fs-13)">${DETOUR.direct.min} min</div></div>
              <div class="ride__price">${formatINR(DETOUR.direct.fare)}</div>
            </div>
          </div>

          <div class="card is-selected">
            <div class="row row--between">
              <div>
                <div class="strong">${DETOUR.smart.label} <span class="badge badge--savings">Recommended</span></div>
                <div class="muted" style="font-size:var(--fs-13)">${DETOUR.smart.min} min · <span class="save-text">+${DETOUR.smart.extraMin} min</span></div>
              </div>
              <div class="ride__price">${formatINR(DETOUR.smart.fare)}</div>
            </div>
          </div>

          <div class="panel row row--between" style="padding:var(--space-12) var(--space-16)">
            <div><div class="eyebrow">Extra time</div><div class="save-text">+${DETOUR.smart.extraMin} min</div></div>
            <div class="center"><div class="eyebrow">You save</div><div class="save-text">${formatINR(DETOUR.save)} (${DETOUR.savePct}%)</div></div>
          </div>

          <button class="btn btn--primary" id="take">
            <span>Take the detour</span><span class="btn__divider">|</span><span class="btn__price">save ${formatINR(DETOUR.save)}</span>
          </button>
          <button class="btn btn--link center" id="keep" style="margin:0 auto">Keep direct route</button>
        </div>
      </div>
    </div>`);

  wireNav();
  $("#take").addEventListener("click", () => { patchSlice("detour", { decided: true, taken: true }); go("#/confirm"); });
  $("#keep").addEventListener("click", () => { patchSlice("detour", { decided: true, taken: false }); go("#/confirm"); });
}
