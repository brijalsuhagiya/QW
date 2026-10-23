/* splash.js — brand splash. Auto-advances to onboarding; tap to skip wait. */

import { render, go, icon } from "../ui.js";

export function view() {
  const el = render(`
    <div class="screen screen--dark" style="flex:1">
      <div class="splash" id="splash-tap" role="button" tabindex="0" aria-label="Continue to QuickWheel">
        <div class="splash__mark">${icon("crosshair", { size: 40, stroke: 2 })}</div>
        <div class="splash__word">QuickWheel</div>
        <div class="splash__tag">Last-mile, sorted.</div>
        <div class="splash__loader"><div class="spinner spinner--light" aria-hidden="true"></div></div>
        <span class="sr-only">Loading QuickWheel</span>
      </div>
    </div>`);

  const next = () => go("#/onboarding");
  const timer = setTimeout(next, 2000);
  const skip = () => { clearTimeout(timer); next(); };
  const tap = el.querySelector("#splash-tap");
  tap.addEventListener("click", skip);
  tap.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") skip(); });
}
