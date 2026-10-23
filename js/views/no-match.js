/* no-match.js — ERROR + RECOVERY state.
   No driver matched. Every error names: what failed, who owns it, what to
   do next, and how long. No dead ends — the quote is held and recovery
   paths are offered (keep waiting, switch to AC bus, get a ping). */

import { render, go, icon, appbar, wireNav, $, toast } from "../ui.js";
import { getJourney, patch } from "../state.js";
import { RIDES, formatINR } from "../mock-data.js";

export function view() {
  const j = getJourney();
  const r = RIDES.find((x) => x.id === (j.ride || "quickxl"));
  const fare = j.booking.fare || r.fare;
  const bus = RIDES.find((x) => x.id === "acbus");

  render(`
    <div class="screen">
      ${appbar({ title: "", backHash: "#/ride" })}
      <div class="screen__body">
        <div class="state-hero">
          <div class="state-hero__icon state-hero__icon--warn">${icon("clock", { size: 36, stroke: 2.2 })}</div>
          <h2>No driver matched yet</h2>
          <p>Demand near the station is high right now — this happens just after a train arrives. Your booking has <b class="strong">not</b> been charged.</p>
        </div>

        <div class="error-detail">
          <div class="error-detail__row"><span class="error-detail__k">What</span><span class="error-detail__v">No verified ${r.name} driver was free at ${j.trip.pickup.title} in the last minute.</span></div>
          <div class="error-detail__row"><span class="error-detail__k">Who</span><span class="error-detail__v">It's a supply gap on our side — not anything you did. No cancellation fee applies.</span></div>
          <div class="error-detail__row"><span class="error-detail__k">Next</span><span class="error-detail__v">Keep waiting and we'll hold your fare, switch to an AC bus leaving now, or get a ping when a cab frees up.</span></div>
          <div class="error-detail__row"><span class="error-detail__k">How long</span><span class="error-detail__v">Usually eases within 3–5 minutes as the arrival crowd clears.</span></div>
        </div>

        <div class="callout callout--mobility">
          <span class="callout__icon" style="background:var(--c-mobility)">${icon("check", { size: 18, stroke: 2.6 })}</span>
          <span class="callout__body">
            <span class="callout__title">Your quote is saved</span>
            <span class="callout__text">${r.name} · ${j.trip.pickup.title} → ${j.trip.destination.title} · ${formatINR(fare)} held for you.</span>
          </span>
        </div>
      </div>

      <div class="screen__footer">
        <button class="btn btn--primary" id="wait">Keep waiting · hold ${formatINR(fare)}</button>
        <button class="btn btn--secondary" id="bus">${icon("bus", { size: 18 })} Switch to AC bus · ${formatINR(bus.fare)}</button>
        <button class="btn btn--link center" id="notify" style="margin:0 auto">Notify me when a driver's free</button>
      </div>
    </div>`);

  wireNav();
  $("#wait").addEventListener("click", () => {
    patch({ booking: { ...getJourney().booking, status: "finding" } });
    go("#/finding");
  });
  $("#bus").addEventListener("click", () => {
    patch({ ride: "acbus", booking: { ...getJourney().booking, fare: bus.fare } });
    toast("Switched to AC bus — seat held", { type: "savings", icon: "bus" });
    go("#/confirm");
  });
  $("#notify").addEventListener("click", () => {
    patch({ booking: { ...getJourney().booking, status: "none" } });
    toast("We'll ping you when a cab is free — your quote stays saved", { icon: "message", duration: 3200 });
    go("#/home");
  });
}
