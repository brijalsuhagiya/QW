/* photo.js — add a profile photo (wireframe 7).
   Required to continue. Upload constraints are shown BEFORE the user
   attempts the upload (never discovered through rejection). */

import { render, go, icon, simulateNetwork, appbar, $, toast } from "../ui.js";
import { patchSlice } from "../state.js";
import { USER, WAIT_MESSAGES } from "../mock-data.js";

let added = false;

export function view() {
  added = false;
  render(`
    <div class="screen">
      ${appbar({ title: "Add your photo", backHash: "#/phone" })}
      <div class="screen__body">
        <p class="lead">A clear face photo builds trust with drivers and co-riders. It takes a second and is required to continue.</p>

        <div class="center stack" style="align-items:center;gap:var(--space-12);padding:var(--space-8) 0">
          <button id="drop" class="icon-btn" style="width:120px;height:120px;border:2px dashed var(--c-line-strong);background:var(--c-surface)" aria-label="Upload or take a photo">
            <span id="drop-inner">${icon("camera", { size: 34, stroke: 1.8 })}</span>
          </button>
          <div class="strong" id="drop-label">Tap to upload or take a photo</div>
          <span class="badge badge--amber" id="req-badge">● Required</span>
          <span class="field__hint"><span class="demo-tag">Demo</span> JPG or PNG · under 2 MB · tap to simulate capture</span>
        </div>

        <div class="panel" style="padding:var(--space-8) var(--space-16)">
          <div class="list-row">
            <span class="list-row__icon">${icon("lock", { size: 20 })}</span>
            <span class="list-row__body">
              <span class="list-row__title">Everything else stays private</span>
              <span class="list-row__sub">Phone, email &amp; ID are never shown</span>
            </span>
            <span class="badge badge--neutral">Hidden</span>
          </div>
          <div class="list-row">
            <span class="list-row__icon">${icon("plus", { size: 20 })}</span>
            <span class="list-row__body">
              <span class="list-row__title">Name &amp; details</span>
              <span class="list-row__sub">Optional — add anytime later</span>
            </span>
            <span class="list-row__chevron">${icon("chevron", { size: 18 })}</span>
          </div>
        </div>

        <p class="muted center" style="font-size:var(--fs-13)">
          ${icon("check", { size: 14, stroke: 2.6, cls: "" })} Only your first name &amp; photo are visible to drivers
        </p>
      </div>

      <div class="screen__footer">
        <button class="btn btn--primary is-disabled" id="continue" disabled>Add photo to continue</button>
      </div>
    </div>`);

  $("#drop").addEventListener("click", capture);
  $("#continue").addEventListener("click", async () => {
    patchSlice("auth", { photoAdded: true });
    await simulateNetwork({ title: "Saving your photo", messages: WAIT_MESSAGES.photo, duration: 1400 });
    go("#/home");
  });
}

/* Simulate capturing a photo: show the avatar and enable the CTA. */
async function capture() {
  if (added) return;
  await simulateNetwork({ title: "Adding your photo", messages: ["Opening camera…", "Keeping it private to drivers only…"], duration: 1200 });
  added = true;
  $("#drop").style.border = "none";
  $("#drop").style.background = USER.avatarColor;
  $("#drop-inner").innerHTML = `<span style="color:#fff;font-weight:800;font-size:var(--fs-34)">${USER.initial}</span>`;
  $("#drop-label").textContent = "Looking good, " + USER.firstName + "!";
  $("#req-badge").outerHTML = `<span class="badge badge--savings">${icon("check", { size: 12, stroke: 3 })} Photo added</span>`;
  const btn = $("#continue");
  btn.disabled = false;
  btn.classList.remove("is-disabled");
  btn.textContent = "Continue";
  toast("Photo added — you're all set", { type: "savings", icon: "check" });
}
