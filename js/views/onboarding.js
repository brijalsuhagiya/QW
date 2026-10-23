/* onboarding.js — three-slide intro carousel (wireframes 2–4).
   Preserves the wireframe intent: station→door, fair fares, safety. */

import { render, go, icon, $$ } from "../ui.js";
import { patch } from "../state.js";
import { mapBox, pin, routeLine } from "../maps.js";
import { RIDES, formatINR } from "../mock-data.js";

let index = 0;

const SLIDES = [
  {
    title: "From the station to your doorstep",
    body: "Trains, airports and bus stands to your exact door — book the last leg of any trip in seconds.",
    visual: slideMap,
  },
  {
    title: "Fair fares, nothing hidden",
    body: "See the price, the route and every cheaper option up front. Pick what actually works for you.",
    visual: slideFares,
  },
  {
    title: "Safety, quietly built in",
    body: "Verified drivers, recorded trips and live location sharing — always on, never in your way.",
    visual: slideSafety,
  },
];

export function view() {
  index = 0;
  paint();
}

/* Render the current slide. */
function paint() {
  const s = SLIDES[index];
  const last = index === SLIDES.length - 1;
  const dots = SLIDES.map((_, i) => `<span class="dot ${i === index ? "is-active" : ""}"></span>`).join("");

  render(`
    <div class="screen">
      <header class="appbar">
        <span class="appbar__spacer"></span>
        <button class="btn btn--link" id="skip" aria-label="Skip introduction">Skip</button>
      </header>
      <div class="screen__body">
        <div class="panel" style="padding:var(--space-16)">${s.visual()}</div>
        <div class="dots" aria-hidden="true">${dots}</div>
        <h1>${s.title}</h1>
        <p class="lead">${s.body}</p>
      </div>
      <div class="screen__footer screen__footer--plain">
        <button class="btn btn--primary" id="next">${last ? "Get started" : "Next"}</button>
      </div>
    </div>`);

  document.getElementById("skip").addEventListener("click", finish);
  document.getElementById("next").addEventListener("click", () => {
    if (last) { finish(); } else { index += 1; paint(); }
  });
}

/* Complete onboarding and move to sign-in. */
function finish() {
  patch({ onboardingDone: true });
  go("#/phone");
}

/* ---- slide visuals ---- */
function slideMap() {
  const layers = [
    routeLine({ from: [28, 26], to: [74, 72], dashed: true, color: "#0a0a0a" }),
    pin({ x: 28, y: 26, kind: "you", label: "Platform 1", labelStyle: "map-pin__label--light top" }),
    pin({ x: 74, y: 72, kind: "dest", label: "Home" }),
  ];
  return mapBox({ className: "map--panel", layers });
}

function slideFares() {
  const rows = [
    { name: "Auto", meta: "Est. 12 min", fare: 86, hi: false },
    { name: "QuickGo", meta: "Best value", fare: 74, hi: true },
    { name: "Shared", meta: "Est. 12 min", fare: 52, hi: false },
  ];
  const cards = rows.map((r) => `
    <div class="ride ${r.hi ? "is-selected" : ""}" style="${r.hi ? "background:var(--c-ink);color:#fff;border-color:var(--c-ink)" : ""}">
      <div class="ride__body">
        <div class="ride__name">${r.name}</div>
        <div class="ride__meta" style="${r.hi ? "color:rgba(255,255,255,0.7)" : ""}">${r.meta}</div>
      </div>
      <div class="ride__price">${formatINR(r.fare)}</div>
    </div>`).join("");
  return `<div class="stack-8" style="padding:var(--space-4) 0">${cards}</div>`;
}

function slideSafety() {
  const pills = [
    { c: "#2f6bff", t: "Verified drivers" },
    { c: "#7356bf", t: "Trip recording" },
    { c: "#0e8a4f", t: "Live location" },
  ];
  const chips = pills.map((p) => `<span class="chip"><span class="dot" style="background:${p.c}"></span>${p.t}</span>`).join("");
  return `
    <div class="center stack" style="align-items:center;padding:var(--space-16) 0">
      <div style="width:84px;height:84px;border-radius:999px;background:var(--c-mobility-tint);display:grid;place-items:center;color:var(--c-mobility)">
        ${icon("check", { size: 40, stroke: 2.6 })}
      </div>
      <div class="row row--wrap" style="justify-content:center;gap:var(--space-8)">${chips}</div>
    </div>`;
}
