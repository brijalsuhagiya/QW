/* phone.js — enter mobile number (wireframe 5).
   Demo number is pre-filled and labelled so the reviewer can proceed. */

import { render, go, icon, simulateNetwork, appbar, wireNav, $ } from "../ui.js";
import { patchSlice } from "../state.js";
import { USER, WAIT_MESSAGES } from "../mock-data.js";

export function view() {
  render(`
    <div class="screen">
      ${appbar({ backHash: "#/onboarding" })}
      <div class="screen__body">
        <div class="stack-8">
          <h1>Enter your number</h1>
          <p class="lead">We'll text a one-time code to verify it's you.</p>
        </div>

        <div class="field">
          <label class="field__label" for="phone">Mobile number</label>
          <div class="phone-input">
            <span class="phone-input__cc">+91</span>
            <input id="phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel"
                   value="${USER.phone}" aria-describedby="phone-demo">
          </div>
          <span class="field__hint" id="phone-demo">
            <span class="demo-tag">Demo</span> Number pre-filled — just tap Continue. No real SMS is sent.
          </span>
        </div>

        <div class="or-divider">or</div>
        <button class="btn btn--secondary" id="apple">${icon("user", { size: 18 })} Continue with Apple</button>
      </div>

      <div class="screen__footer">
        <button class="btn btn--primary" id="continue">Continue</button>
        <p class="muted center" style="font-size:var(--fs-12)">By continuing you agree to our Terms and Privacy Policy.</p>
      </div>
    </div>`);

  wireNav();

  $("#continue").addEventListener("click", async () => {
    const val = $("#phone").value.trim();
    const input = $("#phone");
    if (val.replace(/\s/g, "").length < 10) {
      input.classList.add("is-error");
      input.focus();
      return;
    }
    patchSlice("auth", { phone: val });
    await simulateNetwork({ title: "Sending code", messages: WAIT_MESSAGES.otp, duration: 1600 });
    go("#/otp");
  });

  // Apple path skips OTP (provider-verified) and goes straight to the photo step.
  $("#apple").addEventListener("click", async () => {
    patchSlice("auth", { phone: USER.phone, verified: true });
    await simulateNetwork({ title: "Signing you in", messages: WAIT_MESSAGES.verify, duration: 1500 });
    go("#/photo");
  });
}
