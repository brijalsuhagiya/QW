/* ============================================================
   router.js — hash-based routing only.
   GitHub Pages cannot rewrite URLs, so navigation uses
   window.location.hash + the hashchange event. No History API.
   Every route maps to a view module that renders itself.
   ============================================================ */

import { resumeRoute } from "./state.js";

import { view as splash } from "./views/splash.js";
import { view as onboarding } from "./views/onboarding.js";
import { view as phone } from "./views/phone.js";
import { view as otp } from "./views/otp.js";
import { view as photo } from "./views/photo.js";
import { view as home } from "./views/home.js";
import { view as pickup } from "./views/pickup.js";
import { view as trip } from "./views/trip.js";
import { view as ride } from "./views/ride.js";
import { view as safety } from "./views/safety.js";
import { view as share } from "./views/share.js";
import { view as detour } from "./views/detour.js";
import { view as confirm } from "./views/confirm.js";
import { view as finding } from "./views/finding.js";
import { view as noMatch } from "./views/no-match.js";
import { view as cancelled } from "./views/cancelled.js";
import { view as arriving } from "./views/arriving.js";
import { view as complete } from "./views/complete.js";

/* Route table: hash → view renderer. */
const ROUTES = {
  "#/splash": splash,
  "#/onboarding": onboarding,
  "#/phone": phone,
  "#/otp": otp,
  "#/photo": photo,
  "#/home": home,
  "#/pickup": pickup,
  "#/trip": trip,
  "#/ride": ride,
  "#/safety": safety,
  "#/share": share,
  "#/detour": detour,
  "#/confirm": confirm,
  "#/finding": finding,
  "#/no-match": noMatch,
  "#/cancelled": cancelled,
  "#/arriving": arriving,
  "#/complete": complete,
};

/* Resolve and render the view for the current hash. */
function handleRoute() {
  const hash = window.location.hash || "";
  const render = ROUTES[hash];
  if (render) {
    render();
    return;
  }
  // Empty or unknown hash: resume where the traveller left off.
  const target = hash === "" ? resumeRoute() : "#/home";
  // Replace so an unknown hash doesn't linger in history.
  window.location.replace(window.location.pathname + window.location.search + target);
}

/* Start the router: handle the first paint and every hash change. */
export function startRouter() {
  window.addEventListener("hashchange", handleRoute);
  handleRoute();
}
