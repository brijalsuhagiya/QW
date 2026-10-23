/* confirm.js — confirm your ride (wireframe 15).
   The highest-stakes screen: the fare is fixed here and shown in full
   before booking. A persistent progress cue keeps the traveller oriented. */

import { render, go, icon, appbar, wireNav, simulateNetwork, $, toast } from "../ui.js";
import { getJourney, patch } from "../state.js";
import { mapBase, routePath, pin } from "../maps.js";
import { RIDES, DETOUR, FARE_BREAKDOWN, formatINR, WAIT_MESSAGES, makeBookingRef } from "../mock-data.js";

export function view() {
  const j = getJourney();
  const rideId = j.ride || "quickxl";
  const r = RIDES.find((x) => x.id === rideId);
  const detourCut = j.detour.taken ? DETOUR.save : 0;
  const fare = Math.max(0, r.fare - detourCut);
  const shared = rideId === "shared" || j.share.enabled;

  const chips = [
    `<span class="chip" style="box-shadow:none;background:var(--c-surface)">${j.trip.passengers} passengers</span>`,
    `<span class="chip" style="box-shadow:none;background:var(--c-surface)">${j.trip.bags} bags</span>`,
    `<span class="badge badge--violet" style="padding:8px 12px">${icon("shield", { size: 14 })} Safety on</span>`,
  ].join("");

  render(`
    <div class="screen">
      <div class="map-screen">
        <div class="map map--fill" style="min-height:120px">
          ${mapBase()}
          ${routePath({ points: [[30, 40], [55, 72]], color: "#0a0a0a" })}
          ${pin({ x: 30, y: 40, kind: "you" })}
          ${pin({ x: 55, y: 72, kind: "dest" })}
          <header class="appbar" style="position:absolute;top:0;left:0;right:0">
            <button class="icon-btn" data-nav="#/ride" style="background:#fff;box-shadow:var(--shadow-1)" aria-label="Go back">${icon("back", { size: 20 })}</button>
          </header>
        </div>

        <div class="sheet">
          <div class="sheet__grabber" aria-hidden="true"></div>

          <div class="dots" aria-label="Final step before booking"><span class="dot"></span><span class="dot"></span><span class="dot is-active"></span></div>
          <h2>Confirm your ride</h2>

          <div class="row">
            <span class="ride__glyph">${icon(r.glyph, { size: 24 })}</span>
            <span class="ride__body">
              <span class="ride__name">${r.name}${shared ? ' <span class="badge badge--mobility">Shared</span>' : ""}</span>
              <span class="ride__meta">${r.meta}${detourCut ? " · smart detour" : ""}</span>
            </span>
            <span class="ride__price">${formatINR(fare)}</span>
          </div>

          <hr class="hr">

          <div class="route">
            <div class="route__pt"><div class="route__dotcol"><span class="route__dot route__dot--from"></span><span class="route__line"></span></div>
              <div class="route__body"><div class="route__title">${j.trip.pickup.title}</div><div class="route__sub">${j.trip.hub}</div></div></div>
            <div class="route__pt"><div class="route__dotcol"><span class="route__dot route__dot--to"></span></div>
              <div class="route__body"><div class="route__title">${j.trip.destination.title}</div><div class="route__sub">${j.trip.destination.sub}</div></div></div>
          </div>

          <div class="row row--wrap" style="gap:var(--space-8)">${chips}</div>

          <div class="panel" style="padding:var(--space-8) var(--space-16)">
            <div class="pay-row">
              <span class="pay-row__icon">${icon("rupee", { size: 18 })}</span>
              <span class="pay-row__body"><span class="pay-row__title">UPI · Pay by any app</span></span>
              <button class="btn btn--link" id="change-pay" style="padding:0">Change ›</button>
            </div>
            <div class="pay-row">
              <span class="pay-row__icon">${icon("percent", { size: 18 })}</span>
              <span class="pay-row__body"><span class="pay-row__title">Apply coupon</span></span>
              <span class="save-text" style="font-size:var(--fs-14)">${FARE_BREAKDOWN.coupon.code} applied</span>
            </div>
          </div>

          <div class="row row--between">
            <div><div class="strong" style="font-size:var(--fs-18)">Total</div><div class="muted" style="font-size:var(--fs-13)">Incl. taxes &amp; tolls${detourCut ? " · detour saving applied" : ""}</div></div>
            <div class="price price--lg">${formatINR(fare)}</div>
          </div>

          <button class="btn btn--primary" id="confirm">Confirm booking</button>
        </div>
      </div>
    </div>`);

  wireNav();
  $("#change-pay").addEventListener("click", () => toast("UPI selected for the demo — card & cash also supported", { icon: "wallet" }));
  $("#confirm").addEventListener("click", async () => {
    patch({ booking: { status: "finding", ref: makeBookingRef(), pin: null, fare } });
    await simulateNetwork({ title: "Confirming your booking", messages: WAIT_MESSAGES.booking, duration: 1800 });
    go("#/finding");
  });
}
