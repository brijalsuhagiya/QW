/* safety.js — your safety (wireframe 12).
   Safety controls default ON. SOS is prominent and reversible.
   Settings persist so they carry into the trip. */

import { render, go, icon, appbar, wireNav, $, $$, toast } from "../ui.js";
import { getJourney, patchSlice } from "../state.js";
import { TRUSTED } from "../mock-data.js";

const TOGGLES = [
  { key: "verifiedDrivers", icon: "star", tint: "var(--c-amber-tint)", color: "var(--c-amber)", title: "Top-rated, verified drivers", sub: "Background-checked · woman-preferred" },
  { key: "recordTrip", icon: "record", tint: "var(--c-danger-tint)", color: "var(--c-danger)", title: "Record this trip", sub: "Encrypted audio, only you control it" },
  { key: "shareLive", icon: "share", tint: "var(--c-info-tint)", color: "var(--c-info)", title: "Share live location", sub: "With Mom & Priya for the whole trip" },
  { key: "womenOnly", icon: "user", tint: "var(--c-violet-tint)", color: "var(--c-violet)", title: "Women co-passengers only", sub: "Applies when you share a ride" },
];

export function view() {
  const s = getJourney().safety;
  const rows = TOGGLES.map((t) => `
    <div class="list-row" style="border:none">
      <span class="list-row__icon" style="background:${t.tint};color:${t.color}">${icon(t.icon, { size: 20 })}</span>
      <span class="list-row__body">
        <span class="list-row__title" style="font-size:var(--fs-16)">${t.title}</span>
        <span class="list-row__sub">${t.sub}</span>
      </span>
      <label class="switch">
        <input type="checkbox" data-toggle="${t.key}" ${s[t.key] ? "checked" : ""} aria-label="${t.title}">
        <span class="switch__track"></span><span class="switch__thumb"></span>
      </label>
    </div>`).join('<hr class="hr">');

  const contacts = TRUSTED.map((c) => `<span class="avatar avatar--sm" style="background:${c.color}" title="${c.name}">${c.initial}</span>`).join("");

  render(`
    <div class="screen">
      ${appbar({ title: "Your safety", backHash: "#/ride" })}
      <div class="screen__body">
        <div class="callout callout--violet">
          <span class="callout__icon" style="background:var(--c-violet)">${icon("shield", { size: 18 })}</span>
          <span class="callout__body">
            <span class="callout__title">You're not travelling alone</span>
            <span class="callout__text">Extra care for solo &amp; women travellers — quietly on in the background.</span>
          </span>
        </div>

        <div class="eyebrow">Always on for you</div>
        <div class="panel" style="padding:var(--space-8) var(--space-16)">${rows}</div>

        <div class="row row--between">
          <span class="strong">Trusted contacts</span>
          <span class="avatar-stack">${contacts}<button class="avatar-add" id="add-contact" aria-label="Add a trusted contact">${icon("plus", { size: 16 })}</button></span>
        </div>
      </div>

      <div class="screen__footer">
        <button class="btn btn--danger" id="sos">${icon("sos", { size: 18 })} Emergency SOS</button>
        <p class="muted center" style="font-size:var(--fs-13)">Call the QuickWheel 24/7 safety line anytime</p>
      </div>
    </div>`);

  wireNav();
  $$("[data-toggle]").forEach((inp) => inp.addEventListener("change", () => {
    patchSlice("safety", { [inp.getAttribute("data-toggle")]: inp.checked });
  }));
  $("#add-contact").addEventListener("click", () => toast("Add a trusted contact (demo)", { icon: "user" }));
  $("#sos").addEventListener("click", () => {
    toast("SOS raised — safety line alerted & trip shared with Mom, Priya (demo)", { type: "danger", icon: "sos", duration: 3600 });
  });
}
