/* pickup.js — choose a verified pickup point (wireframe 9).
   Verified points with walk time; wayfinding-first, so travellers meet
   the driver at a known, well-lit spot instead of guessing. */

import { render, go, icon, appbar, wireNav, $, $$ } from "../ui.js";
import { patchSlice, getJourney } from "../state.js";
import { mapBase, pin, mark, landmark, routeLine } from "../maps.js";
import { HUB, PICKUP_POINTS } from "../mock-data.js";

const MARK_POS = { A: [62, 58], B: [36, 70], C: [76, 40] };
let selected = "A";

export function view() {
  selected = (getJourney().trip.pickup && getJourney().trip.pickup.id) || "A";
  paint();
}

function paint() {
  const marks = PICKUP_POINTS.map((p) =>
    mark({ x: MARK_POS[p.id][0], y: MARK_POS[p.id][1], letter: p.id, active: p.id === selected })
  ).join("");

  const options = PICKUP_POINTS.map((p) => `
    <button class="ride ${p.id === selected ? "is-selected" : ""}" data-pt="${p.id}" role="radio" aria-checked="${p.id === selected}">
      <span class="avatar avatar--sm" style="background:${p.id === selected ? "var(--c-info)" : "var(--c-surface-2)"};color:${p.id === selected ? "#fff" : "var(--t-secondary)"}">${p.id}</span>
      <span class="ride__body">
        <span class="ride__name">${p.title} ${p.recorded ? '<span class="badge badge--mobility">Recorded</span>' : ""}</span>
        <span class="ride__meta">${p.sub}</span>
      </span>
      <span class="radio-dot" aria-hidden="true" style="width:22px;height:22px;border-radius:999px;border:2px solid ${p.id === selected ? "var(--c-info)" : "var(--c-line-strong)"};display:grid;place-items:center">
        ${p.id === selected ? '<span style="width:10px;height:10px;border-radius:999px;background:var(--c-info)"></span>' : ""}
      </span>
    </button>`).join("");

  render(`
    <div class="screen">
      <div class="map-screen">
        <div class="map map--fill" style="min-height:200px">
          ${mapBase()}
          ${routeLine({ from: [50, 42], to: [MARK_POS[selected][0], MARK_POS[selected][1]], dashed: true, color: "#2f6bff" })}
          ${landmark({ x: 50, y: 30, label: "Railway Station" })}
          ${pin({ x: 50, y: 42, kind: "you", label: "You" })}
          <div id="marks">${marks}</div>
          <header class="appbar" style="position:absolute;top:0;left:0;right:0">
            <button class="icon-btn" data-nav="#/home" style="background:#fff;box-shadow:var(--shadow-1)" aria-label="Go back">${icon("back", { size: 20 })}</button>
            <div><div class="appbar__title">Choose your pickup point</div><div class="appbar__sub">${HUB.name}</div></div>
          </header>
        </div>

        <div class="sheet">
          <div class="sheet__grabber" aria-hidden="true"></div>
          <p class="row" style="gap:var(--space-8);color:var(--c-savings);font-weight:var(--fw-semibold);font-size:var(--fs-14)">
            ${icon("check", { size: 16, stroke: 2.6 })} Pickup points verified for easy meetup
          </p>
          <div class="stack-8" role="radiogroup" aria-label="Pickup points" id="opts">${options}</div>
          <button class="btn btn--primary" id="confirm">Confirm pickup point</button>
        </div>
      </div>
    </div>`);

  wireNav();
  $$("[data-pt]").forEach((btn) => btn.addEventListener("click", () => select(btn.getAttribute("data-pt"))));
  $("#confirm").addEventListener("click", () => {
    const pt = PICKUP_POINTS.find((p) => p.id === selected);
    patchSlice("trip", { pickup: pt });
    go("#/trip");
  });
}

/* Select a pickup point and reflect it on the map + list. */
function select(id) {
  if (id === selected) return;
  selected = id;
  paint(); // re-render to update map route + selection (cheap, no network)
}
