/* otp.js — verify the 6-digit code (wireframe 6).
   The demo OTP is shown on screen; a resend timer counts down. */

import { render, go, simulateNetwork, appbar, $, $$, toast } from "../ui.js";
import { patchSlice, getJourney } from "../state.js";
import { DEMO_OTP, USER, WAIT_MESSAGES } from "../mock-data.js";

let countdown;

export function view() {
  const phone = getJourney().auth.phone || USER.phone;
  render(`
    <div class="screen">
      ${appbar({ backHash: "#/phone" })}
      <div class="screen__body">
        <div class="stack-8">
          <h1>Verify your number</h1>
          <p class="lead">Enter the 6-digit code sent to<br><b class="strong">+91 ${phone}</b>
             <button class="btn btn--link" id="edit" style="padding:0 4px">Edit</button></p>
        </div>

        <div class="otp" id="otp" role="group" aria-label="6 digit verification code">
          ${Array.from({ length: 6 }).map((_, i) =>
            `<input class="otp__tile" inputmode="numeric" maxlength="1" aria-label="Digit ${i + 1}" data-i="${i}">`
          ).join("")}
        </div>

        <div class="callout callout--info" style="align-items:center">
          <div class="callout__body">
            <div class="callout__title" style="font-size:var(--fs-14)">
              <span class="demo-tag">Demo</span> Your code is <b>${DEMO_OTP}</b>
            </div>
            <div class="callout__text">Tap “Autofill demo code”, or type it in. No real SMS is sent.</div>
          </div>
          <button class="btn btn--secondary" id="autofill" style="width:auto;min-height:44px">Autofill</button>
        </div>

        <p class="muted" id="resend-slot">Resend code in <b class="strong" id="timer">00:24</b></p>
      </div>

      <div class="screen__footer">
        <button class="btn btn--primary is-disabled" id="verify" disabled>Verify &amp; continue</button>
      </div>
    </div>`);

  $("#edit").addEventListener("click", () => go("#/phone"));
  wireTiles();
  startTimer();

  $("#autofill").addEventListener("click", () => {
    $$(".otp__tile").forEach((t, i) => { t.value = DEMO_OTP[i]; t.classList.add("is-filled"); });
    refreshBtn();
    $("#verify").focus();
  });

  $("#verify").addEventListener("click", verify);
}

/* Wire per-tile input: auto-advance, backspace, validation. */
function wireTiles() {
  const tiles = $$(".otp__tile");
  tiles[0].focus();
  tiles.forEach((tile, i) => {
    tile.addEventListener("input", () => {
      tile.value = tile.value.replace(/\D/g, "").slice(0, 1);
      tile.classList.toggle("is-filled", !!tile.value);
      if (tile.value && i < tiles.length - 1) tiles[i + 1].focus();
      refreshBtn();
    });
    tile.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !tile.value && i > 0) tiles[i - 1].focus();
    });
  });
}

/* Enable Verify only when all six digits are present. */
function refreshBtn() {
  const code = $$(".otp__tile").map((t) => t.value).join("");
  const btn = $("#verify");
  const ok = code.length === 6;
  btn.disabled = !ok;
  btn.classList.toggle("is-disabled", !ok);
}

/* Validate the code (checks against the demo OTP) and continue. */
async function verify() {
  const code = $$(".otp__tile").map((t) => t.value).join("");
  if (code !== DEMO_OTP) {
    $$(".otp__tile").forEach((t) => t.classList.add("is-error"));
    toast("That code doesn't match. Use the demo code shown above.", { type: "danger", icon: "info" });
    return;
  }
  clearInterval(countdown);
  patchSlice("auth", { verified: true });
  await simulateNetwork({ title: "Verifying", messages: WAIT_MESSAGES.verify, duration: 1500 });
  go("#/photo");
}

/* Resend countdown; offers a resend link after reaching zero. */
function startTimer() {
  const slot = $("#resend-slot");
  if (!slot) return;
  slot.innerHTML = `Resend code in <b class="strong" id="timer">00:24</b>`;
  let s = 24;
  clearInterval(countdown);
  countdown = setInterval(() => {
    s -= 1;
    const el = $("#timer");
    if (s <= 0 || !el) {
      clearInterval(countdown);
      slot.innerHTML = `<button class="btn btn--link" id="resend" style="padding:0">Resend code</button>`;
      const r = $("#resend");
      if (r) r.addEventListener("click", () => { toast("New demo code sent: " + DEMO_OTP, { icon: "message" }); startTimer(); });
      return;
    }
    el.textContent = "00:" + String(s).padStart(2, "0");
  }, 1000);
}
