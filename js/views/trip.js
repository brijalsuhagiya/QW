/* trip.js — who & what you're carrying (wireframe 10).
   Luggage and group size are first-class here — the pain point apps ignore.
   The vehicle suggestion reacts to passengers + bags. */

import { render, go, icon, appbar, wireNav, $ } from "../ui.js";
import { getJourney, patchSlice } from "../state.js";
import { formatINR, BUS_FALLBACK } from "../mock-data.js";

let passengers, bags;

export function view() {
  const t = getJourney().trip;
  passengers = t.passengers;
  bags = t.bags;

  render(`
    <div class="screen">
      ${appbar({ title: "Trip details", backHash: "#/pickup" })}
      <div class="screen__body">
        <div class="panel">
          <div class="route">
            <div class="route__pt">
              <div class="route__dotcol"><span class="route__dot route__dot--from"></span><span class="route__line"></span></div>
              <div class="route__body">
                <div class="route__title">${t.pickup.title}</div>
                <div class="route__sub">${t.hub}</div>
              </div>
            </div>
            <div class="route__pt">
              <div class="route__dotcol"><span class="route__dot route__dot--to"></span></div>
              <div class="route__body">
                <div class="route__title">${t.destination.title}</div>
                <div class="route__sub">${t.destination.sub}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="eyebrow">Who &amp; what you're carrying</div>

        <div class="list-row" style="border:none">
          <span class="list-row__icon">${icon("user", { size: 20 })}</span>
          <span class="list-row__body">
            <span class="list-row__title">Passengers</span>
            <span class="list-row__sub">Including you</span>
          </span>
          ${stepper("pax", passengers)}
        </div>
        <hr class="hr">
        <div class="list-row" style="border:none">
          <span class="list-row__icon">${icon("bag", { size: 20 })}</span>
          <span class="list-row__body">
            <span class="list-row__title">Trolley bags</span>
            <span class="list-row__sub">Large check-in luggage</span>
          </span>
          ${stepper("bag", bags)}
        </div>

        <div class="callout" id="suggest" style="background:var(--c-ink);color:#fff">
          <span class="callout__icon" style="background:rgba(255,255,255,0.14)">${icon("suv", { size: 20 })}</span>
          <span class="callout__body">
            <span class="callout__title" id="suggest-title" style="color:#fff">Suggested: spacious SUV</span>
            <span class="callout__text" id="suggest-sub" style="color:rgba(255,255,255,0.72)">Innova or Ertiga — fits 3 people + 4 bags</span>
          </span>
        </div>

        <p class="muted row" style="gap:var(--space-8);font-size:var(--fs-13)">
          ${icon("bus", { size: 18 })} Longer route? AC bus seats are also available at ${formatINR(BUS_FALLBACK.fare)}.
        </p>
      </div>

      <div class="screen__footer">
        <button class="btn btn--primary" id="next">See ride options</button>
      </div>
    </div>`);

  wireNav();
  wireStepper("pax", () => passengers, (v) => { passengers = v; }, 1, 7);
  wireStepper("bag", () => bags, (v) => { bags = v; }, 0, 9);
  $("#next").addEventListener("click", () => {
    patchSlice("trip", { passengers, bags });
    go("#/ride");
  });
  updateSuggestion();
}

/* Build a +/- stepper block. */
function stepper(key, val) {
  return `<div class="stepper">
    <button class="stepper__btn" data-step="${key}" data-dir="-1" aria-label="Decrease ${key}">${icon("minus", { size: 20 })}</button>
    <span class="stepper__val" id="val-${key}" aria-live="polite">${val}</span>
    <button class="stepper__btn" data-step="${key}" data-dir="1" aria-label="Increase ${key}">${icon("plus", { size: 20 })}</button>
  </div>`;
}

/* Wire a stepper's buttons with min/max clamping. */
function wireStepper(key, get, set, min, max) {
  document.querySelectorAll(`[data-step="${key}"]`).forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = Number(btn.getAttribute("data-dir"));
      const next = Math.min(max, Math.max(min, get() + dir));
      set(next);
      $(`#val-${key}`).textContent = next;
      updateSuggestion();
    });
  });
}

/* Recommend a vehicle class from the current counts. */
function updateSuggestion() {
  const big = passengers > 4 || bags > 3;
  const title = $("#suggest-title");
  const sub = $("#suggest-sub");
  if (big) {
    title.textContent = "Suggested: spacious SUV";
    sub.textContent = `Innova or Ertiga — fits ${passengers} people + ${bags} bags`;
  } else {
    title.textContent = "Suggested: standard cab";
    sub.textContent = `Comfortably fits ${passengers} ${passengers === 1 ? "person" : "people"} + ${bags} ${bags === 1 ? "bag" : "bags"}`;
  }
}
