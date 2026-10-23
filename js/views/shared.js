/* ============================================================
   _shared.js — helpers shared across views.
   Keeps the support sheet (fetched component) and common footer
   bits in one place so views stay small and consistent.
   ============================================================ */

import { loadComponentHTML, openModal, toast } from "../ui.js";

/* Open the help / recovery sheet. Loads the HTML via fetch (relative path),
   then shows it as a bottom-sheet modal and wires its buttons.
   @param {string} focus  optional support topic to acknowledge */
export async function openSupport(focus) {
  const html = await loadComponentHTML("components/support-sheet.html");
  if (!html) {
    // Fallback if the component can't be fetched — core flow still works.
    toast("Support: call the 24/7 safety line (demo)", { icon: "help" });
    return;
  }
  const close = openModal(html);
  const panel = document.querySelector(".modal__panel");
  if (!panel) return;
  panel.querySelectorAll("[data-support]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const topic = btn.getAttribute("data-support");
      close();
      ackSupport(topic);
    });
  });
  const closeBtn = panel.querySelector("[data-support-close]");
  if (closeBtn) closeBtn.addEventListener("click", close);
}

/* Acknowledge a chosen support topic with an honest demo message. */
function ackSupport(topic) {
  const msgs = {
    fare: "Your fare is locked at booking — no surprise charges. (Demo)",
    driver: "Open your trip to see the plate, PIN and walking directions. (Demo)",
    safety: "Trip shared with your contacts · safety line ready. (Demo)",
  };
  toast(msgs[topic] || "Support noted (demo)", { icon: "shield" });
}

/* A small reusable "independent prototype" disclosure line. */
export function disclosure() {
  return `<p class="muted center" style="font-size:var(--fs-12)">
    Independent hackathon prototype · not affiliated with any transport authority or operator.
  </p>`;
}
