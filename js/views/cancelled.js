/* cancelled.js — RECOVERY state for a driver cancellation.
   Fair-fee protection (no charge to the traveller), the quote is retained,
   and a one-tap auto re-match keeps the journey moving. No dead ends. */

import { render, go, icon, appbar, wireNav, $, toast } from "../ui.js";
import { getJourney, patch } from "../state.js";
import { RIDES, formatINR } from "../mock-data.js";

export function view() {
  const j = getJourney();
  const r = RIDES.find((x) => x.id === (j.ride || "quickxl"));
  const fare = j.booking.fare || r.fare;

  render(`
    <div class="screen">
      ${appbar({ title: "", backHash: "#/ride" })}
      <div class="screen__body">
        <div class="state-hero">
          <div class="state-hero__icon state-hero__icon--warn">${icon("refresh", { size: 36, stroke: 2.2 })}</div>
          <h2>Your driver had to cancel</h2>
          <p>It happens — a breakdown or a change of plan. We're ready to re-match you straight away, at the same fare.</p>
        </div>

        <div class="error-detail">
          <div class="error-detail__row"><span class="error-detail__k">What</span><span class="error-detail__v">Your assigned ${r.name} driver cancelled before pickup at ${j.trip.pickup.title}.</span></div>
          <div class="error-detail__row"><span class="error-detail__k">Who</span><span class="error-detail__v">The driver cancelled — you're protected. No cancellation fee is charged to you.</span></div>
          <div class="error-detail__row"><span class="error-detail__k">Next</span><span class="error-detail__v">Re-match now at the same fare, or pick a different ride. Your pickup point and quote are kept.</span></div>
          <div class="error-detail__row"><span class="error-detail__k">How long</span><span class="error-detail__v">A new driver is typically found in under a minute.</span></div>
        </div>

        <div class="callout callout--mobility">
          <span class="callout__icon" style="background:var(--c-mobility)">${icon("shield", { size: 18 })}</span>
          <span class="callout__body">
            <span class="callout__title">Fare &amp; fee protection</span>
            <span class="callout__text">${r.name} held at ${formatINR(fare)} · no fee for a driver-side cancellation.</span>
          </span>
        </div>
      </div>

      <div class="screen__footer">
        <button class="btn btn--primary" id="rematch">${icon("refresh", { size: 18 })} Find another driver · ${formatINR(fare)}</button>
        <button class="btn btn--secondary" id="change">Choose a different ride</button>
      </div>
    </div>`);

  wireNav();
  $("#rematch").addEventListener("click", () => {
    patch({ booking: { ...getJourney().booking, status: "finding", pin: null } });
    toast("Re-matching you — no fee charged", { icon: "refresh" });
    go("#/finding");
  });
  $("#change").addEventListener("click", () => {
    patch({ booking: { status: "none", ref: null, pin: null } });
    go("#/ride");
  });
}
