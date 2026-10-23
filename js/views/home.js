/* home.js — home map + "where to?" (wireframe 8).
   Resumes any active booking and starts a last-mile trip. */

import { render, go, icon, appbar, wireNav, $, $$ } from "../ui.js";
import { getJourney, patchSlice, hasActiveBooking } from "../state.js";
import { mapBase, pin } from "../maps.js";
import { USER, SAVED_PLACES, DESTINATION } from "../mock-data.js";
import { openSupport } from "./shared.js";

export function view() {
  const greeting = greet();
  const resume = hasActiveBooking()
    ? `<button class="callout callout--mobility" data-nav="${getJourney().booking.status === "confirmed" ? "#/arriving" : "#/finding"}" style="width:100%;text-align:left">
         <span class="callout__icon" style="background:var(--c-mobility)">${icon("car", { size: 18 })}</span>
         <span class="callout__body">
           <span class="callout__title">Resume your trip</span>
           <span class="callout__text">You have a ride in progress — tap to pick up where you left off.</span>
         </span>
         <span class="list-row__chevron" style="align-self:center">${icon("chevron", { size: 18 })}</span>
       </button>`
    : "";

  const places = SAVED_PLACES.map((p) => `
    <button class="list-row" data-place="${p.id}">
      <span class="list-row__icon" style="${p.recent ? "background:var(--c-info-tint);color:var(--c-info)" : ""}">${icon(p.icon, { size: 20 })}</span>
      <span class="list-row__body">
        <span class="list-row__title">${p.title}</span>
        <span class="list-row__sub">${p.sub}</span>
      </span>
      <span class="list-row__chevron">${icon("chevron", { size: 18 })}</span>
    </button>`).join("");

  render(`
    <div class="screen">
      <div class="map-screen">
        <div class="map map--fill" style="min-height:200px">
          ${mapBase()}
          ${pin({ x: 50, y: 52, kind: "you" })}
          <header class="appbar" style="position:absolute;top:0;left:0;right:0">
            <button class="icon-btn" id="menu" style="background:#fff;box-shadow:var(--shadow-1)" aria-label="Help and menu">${icon("menu", { size: 20 })}</button>
            <span class="appbar__spacer"></span>
            <button class="avatar" id="avatar" style="background:${USER.avatarColor}" aria-label="Your profile">${USER.initial}</button>
          </header>
        </div>

        <div class="sheet">
          <div class="sheet__grabber" aria-hidden="true"></div>
          <h2>${greeting}, ${USER.firstName}</h2>
          ${resume}
          <button class="input row" id="search" style="justify-content:space-between;text-align:left;cursor:pointer">
            <span class="row" style="gap:var(--space-8);color:var(--t-tertiary)">${icon("search", { size: 18 })} Where to?</span>
            <span class="badge badge--neutral">Now ▾</span>
          </button>
          <div class="eyebrow">Saved places</div>
          <div>${places}</div>
        </div>
      </div>
    </div>`);

  wireNav();
  $("#menu").addEventListener("click", () => openSupport());
  $("#avatar").addEventListener("click", () => openSupport());
  $("#search").addEventListener("click", start);
  $$("[data-place]").forEach((btn) => btn.addEventListener("click", () => {
    const id = btn.getAttribute("data-place");
    if (id === "home" || id === "work") {
      const p = SAVED_PLACES.find((x) => x.id === id);
      patchSlice("trip", { destination: { title: p.title, sub: p.sub } });
    } else {
      patchSlice("trip", { destination: DESTINATION });
    }
    start();
  }));
}

/* Begin a trip from the hub: go to pickup-point selection. */
function start() {
  go("#/pickup");
}

/* Time-of-day greeting (America/Toronto-agnostic — uses local device time). */
function greet() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
