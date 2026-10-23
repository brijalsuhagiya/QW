/* ============================================================
   main.js — app init and boot sequence.
   Wires the persistent demo banner, then starts the hash router.
   ============================================================ */

import { startRouter } from "./router.js";

/* Remember the demo banner dismissal for this tab only. */
function initDemoBanner() {
  const banner = document.getElementById("demo-banner");
  const close = document.getElementById("demo-close");
  if (!banner || !close) return;
  try {
    if (sessionStorage.getItem("qw_demo_dismissed") === "1") {
      banner.classList.add("is-hidden");
    }
  } catch (e) { /* storage blocked — banner simply stays visible */ }
  close.addEventListener("click", () => {
    banner.classList.add("is-hidden");
    try { sessionStorage.setItem("qw_demo_dismissed", "1"); } catch (e) {}
  });
}

/* Boot. */
function boot() {
  initDemoBanner();
  startRouter();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
