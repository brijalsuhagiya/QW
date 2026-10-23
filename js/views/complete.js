/* complete.js — trip complete: settlement, receipt and rating.
   Unambiguous success: amount paid matches the quote, a reference number
   and date are shown, and the journey resolves cleanly. */

import { render, go, icon, appbar, $, $$, toast } from "../ui.js";
import { getJourney, resetJourney } from "../state.js";
import { RIDES, DRIVER, DETOUR, formatINR, todayDMY } from "../mock-data.js";

let rating = 0;

export function view() {
  const j = getJourney();
  const r = RIDES.find((x) => x.id === (j.ride || "quickxl"));
  const solo = RIDES.find((x) => x.id === "quickxl").fare;
  const paid = j.booking.fare || r.fare;
  const shared = r.id === "shared" || j.share.enabled;
  const saved = (shared ? solo - paid : (j.detour.taken ? DETOUR.save : 0));
  const ref = j.booking.ref || "QW—DEMO";
  rating = 0;

  render(`
    <div class="screen">
      ${appbar({ title: "" })}
      <div class="screen__body">
        <div class="state-hero">
          <div class="state-hero__icon state-hero__icon--success">${icon("check", { size: 40, stroke: 3 })}</div>
          <h2>You've reached ${j.trip.destination.title}</h2>
          <p>Paid by UPI · fare matched your quote exactly. No surprises.</p>
        </div>

        ${saved > 0 ? `<div class="callout callout--mobility" style="align-items:center">
          <span class="callout__icon" style="background:var(--c-savings)">${icon("check", { size: 16, stroke: 2.6 })}</span>
          <span class="callout__body"><span class="callout__title">You saved ${formatINR(saved)} on this trip</span>
          <span class="callout__text">${shared ? "By sharing with a verified co-passenger" : "By taking the smart detour"}</span></span>
        </div>` : ""}

        <div class="panel">
          <div class="receipt">
            <div class="receipt__row"><span>${r.name}${shared ? " (shared)" : ""} · ${j.trip.pickup.title.split(" · ")[0]} → ${j.trip.destination.title}</span><span>${formatINR(paid)}</span></div>
            <div class="receipt__row"><span>Passengers · bags</span><span>${j.trip.passengers} · ${j.trip.bags}</span></div>
            <div class="receipt__row"><span>Payment</span><span>UPI</span></div>
            <div class="receipt__row"><span>Booking ref</span><span>${ref}</span></div>
            <div class="receipt__row"><span>Date</span><span>${todayDMY()}</span></div>
            ${saved > 0 ? `<div class="receipt__row receipt__row--save"><span>You saved</span><span>−${formatINR(saved)}</span></div>` : ""}
            <div class="receipt__row receipt__row--total"><span>Total paid</span><span>${formatINR(paid)}</span></div>
          </div>
        </div>

        <div class="center stack-8" style="align-items:center">
          <div class="strong">Rate ${DRIVER.name.split(" ")[0]}</div>
          <div class="stars" id="stars" role="radiogroup" aria-label="Rate your driver out of 5">
            ${[1,2,3,4,5].map((n) => `<button class="star" data-star="${n}" role="radio" aria-checked="false" aria-label="${n} star${n>1?"s":""}">${icon("star", { size: 30, fill: "currentColor", stroke: 0 })}</button>`).join("")}
          </div>
          <div class="muted" id="rate-msg" aria-live="polite">Your feedback keeps drivers accountable</div>
        </div>
      </div>

      <div class="screen__footer">
        <button class="btn btn--primary" id="done">Done</button>
        <button class="btn btn--link center" id="receipt-dl" style="margin:0 auto">${icon("download", { size: 16 })} Download receipt</button>
      </div>
    </div>`);

  wireStars();
  $("#receipt-dl").addEventListener("click", () => toast("Receipt " + ref + " saved (demo)", { icon: "download" }));
  $("#done").addEventListener("click", () => {
    resetJourney();                 // journey resolved — clear session state
    toast("Thanks for riding with QuickWheel!", { type: "savings", icon: "check" });
    go("#/home");
  });
}

/* Star rating input with keyboard-friendly buttons. */
function wireStars() {
  const stars = $$("[data-star]");
  stars.forEach((s) => s.addEventListener("click", () => {
    rating = Number(s.getAttribute("data-star"));
    stars.forEach((x, i) => {
      const on = i < rating;
      x.classList.toggle("is-on", on);
      x.setAttribute("aria-checked", on ? "true" : "false");
    });
    const msgs = ["", "Sorry to hear that — we'll follow up", "We'll do better", "Thanks for the feedback", "Glad it went well!", "Brilliant — thanks for the 5 stars!"];
    $("#rate-msg").textContent = msgs[rating];
  }));
}
