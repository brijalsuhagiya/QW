/* arriving.js — booking confirmed: driver arriving, then en route
   (wireframe 17). Verified driver, plate, boarding PIN, live safety and
   trip sharing. A confirmed upstream action shows a confirmed downstream
   state — never a spinner that goes nowhere. */

import { render, go, icon, $, toast } from "../ui.js";
import { getJourney, patch } from "../state.js";
import { mapBase, pin, car, routePath } from "../maps.js";
import { DRIVER, TRUSTED } from "../mock-data.js";

let phase = "arriving"; // 'arriving' | 'enroute'
let eta, etaTimer;

export function view() {
  // Guard: only valid with a confirmed booking.
  if (getJourney().booking.status !== "confirmed") { go("#/home"); return; }
  phase = "arriving";
  eta = DRIVER.etaMin;
  paint();
}

function paint() {
  const arriving = phase === "arriving";
  const contacts = TRUSTED.map((c) => c.name).join(", ");

  render(`
    <div class="screen">
      <div class="map-screen">
        <div class="map map--fill" style="min-height:220px">
          ${mapBase()}
          ${arriving
            ? routePath({ points: [[30, 78], [52, 52]], color: "#0a0a0a" }) + car({ x: 52, y: 52 }) + pin({ x: 30, y: 78, kind: "you" })
            : routePath({ points: [[28, 40], [50, 55], [74, 76]], color: "#0a0a0a" }) + car({ x: 50, y: 55 }) + pin({ x: 74, y: 76, kind: "dest" })}
          <header class="appbar" style="position:absolute;top:0;left:0;right:0">
            <button class="icon-btn" data-nav="#/home" style="background:#fff;box-shadow:var(--shadow-1)" aria-label="Back to home">${icon("back", { size: 20 })}</button>
          </header>
        </div>

        <div class="sheet">
          <div class="sheet__grabber" aria-hidden="true"></div>
          <div class="row row--between">
            <h2 id="eta-title">${arriving ? `Arriving in ${eta} min` : "On the way to " + getJourney().trip.destination.title}</h2>
            <span class="pin-inline">PIN <b>${DRIVER.pin}</b></span>
          </div>

          <div class="identity">
            <span class="avatar" style="background:${DRIVER.color}">${DRIVER.initial}</span>
            <span class="identity__body">
              <span class="identity__name">${DRIVER.name}
                <span class="rating">${icon("star", { size: 13, fill: "currentColor", stroke: 0 })} ${DRIVER.rating}</span>
              </span>
              <span class="identity__sub">${DRIVER.vehicle}</span>
            </span>
            <span class="plate">${DRIVER.plate}</span>
          </div>

          <div class="row" style="justify-content:space-around">
            ${action("call", "Call", "var(--c-mobility)")}
            ${action("message", "Message", "var(--c-surface-2)", "var(--t-primary)")}
            ${action("arrowup", "Share trip", "var(--c-info)")}
          </div>

          <div class="callout callout--violet" style="align-items:center">
            <span class="callout__icon" style="background:var(--c-violet)">${icon("check", { size: 16, stroke: 2.6 })}</span>
            <span class="callout__body">
              <span class="callout__title" style="font-size:var(--fs-14)">Safety active</span>
              <span class="callout__text">Recording on · location shared with ${contacts}</span>
            </span>
          </div>

          ${arriving
            ? `<button class="btn btn--primary" id="board">I've met my driver — start trip</button>
               <div class="row" style="justify-content:center;gap:var(--space-12)">
                 <button class="btn btn--link" id="cancel" style="padding:0">Cancel ride</button>
                 <span class="demo-tag">Demo</span>
                 <button class="btn btn--link" id="demo-cancel" style="padding:0;font-size:var(--fs-13)">Preview: driver cancels</button>
               </div>`
            : `<button class="btn btn--mobility" id="complete">Complete trip <span class="demo-tag" style="background:rgba(255,255,255,0.2);color:#fff">Demo</span></button>
               <p class="muted center" style="font-size:var(--fs-13)">In the real app this advances automatically when you reach ${getJourney().trip.destination.title}.</p>`}
        </div>
      </div>
    </div>`);

  wireActions();

  if (arriving) {
    startEta();
    $("#board").addEventListener("click", () => { clearInterval(etaTimer); phase = "enroute"; paint(); });
    $("#cancel").addEventListener("click", cancelByUser);
    $("#demo-cancel").addEventListener("click", () => { clearInterval(etaTimer); go("#/cancelled"); });
  } else {
    $("#complete").addEventListener("click", () => { patch({ booking: { ...getJourney().booking, status: "completed" } }); go("#/complete"); });
  }
}

/* A circular trip action (call / message / share). */
function action(ic, label, bg, fg = "#fff") {
  return `<button class="stack-8" data-act="${label}" style="align-items:center;gap:var(--space-4)">
    <span class="avatar" style="background:${bg};color:${fg}">${icon(ic, { size: 20 })}</span>
    <span style="font-size:var(--fs-13);font-weight:var(--fw-semibold)">${label}</span>
  </button>`;
}

/* Wire the three trip actions to honest demo toasts. */
function wireActions() {
  document.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => {
    const map = { Call: "Calling your driver (demo)", Message: "Messaging your driver (demo)", "Share trip": "Trip link shared with your contacts (demo)" };
    toast(map[b.getAttribute("data-act")] || "Action (demo)", { icon: "shield" });
  }));
}

/* Count the arrival ETA down; flip to "driver is here" at zero. */
function startEta() {
  clearInterval(etaTimer);
  etaTimer = setInterval(() => {
    eta -= 1;
    const t = $("#eta-title");
    if (!t) { clearInterval(etaTimer); return; }
    if (eta <= 0) {
      clearInterval(etaTimer);
      t.textContent = "Your driver is here";
      toast("Driver at " + getJourney().trip.pickup.title + " · PIN " + DRIVER.pin, { type: "savings", icon: "check" });
      return;
    }
    t.textContent = `Arriving in ${eta} min`;
  }, 2600);
}

/* User-initiated cancel: honest about the regulated fee, with a path forward. */
function cancelByUser() {
  clearInterval(etaTimer);
  patch({ booking: { status: "none", ref: null, pin: null } });
  toast("Ride cancelled. A ₹100 fee may apply for late cancels (2025 rules) — waived in this demo.", { icon: "info", duration: 3800 });
  go("#/home");
}
