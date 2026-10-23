# QuickWheel — last-mile travel prototype

An independent hackathon prototype for the **ride home from a public hub**:
getting from a railway station, airport or bus stand in India to your exact
doorstep. It tells travellers their options, the total cost and the exact
pickup point **before** they commit, and supports them if something goes wrong.

> **Independent prototype.** Not affiliated with any transport authority or
> operator. All data is sample data — no real bookings, payments, OTPs or
> personal information are involved.

---

## Run it locally

ES modules and `fetch()` need HTTP — **do not** open `index.html` by
double-click (`file://` will not work). Serve the folder over HTTP:

```bash
# from inside this folder
python3 -m http.server 8080
# then open http://localhost:8080/
```

To preview exactly how it behaves on a GitHub Pages **project site**
(served under `/<repo>/`), serve the parent folder instead and visit the
subpath:

```bash
# from the folder ABOVE this one
python3 -m http.server 8080
# then open http://localhost:8080/Code/
```

Any static server works (`npx serve`, VS Code Live Server, etc.).

---

## The journey

Splash → onboarding → sign in (phone + OTP, or Apple) → add photo → home →
choose a verified pickup point → trip details (passengers + luggage) →
compare rides → (safety · share a ride · smart detour) → confirm →
finding a driver → driver arriving → trip complete (receipt + rating).

Every screen is reachable by a bookmarkable hash URL, e.g. `#/ride`,
`#/confirm`, `#/arriving`. Reloading any of them works.

### Exception & recovery paths
From the **Finding a driver** screen (and the **Arriving** screen), small
labelled *Demo* links jump to the exception states so a reviewer can see them
deterministically:

- **No driver found** (`#/no-match`) — names what failed, who owns it, what to
  do next, and how long; holds your quote and offers to keep waiting, switch to
  an AC bus, or get a ping.
- **Driver cancelled** (`#/cancelled`) — fair-fee protection, quote retained,
  one-tap re-match.

---

## What actually works vs what is mocked

**Works (real client-side behaviour):**

- Full navigable journey, entry → outcome, no dead ends.
- Hash router with deep links; every route reloads cleanly; a friendly
  `404.html` returns stray URLs to the app.
- Journey state persisted to `localStorage` — a refresh resumes where you left
  off; an in-progress booking shows a **Resume your trip** card on home.
- Interactive OTP entry, steppers, ride selection, toggles, star rating,
  smart-detour choice, and a help/recovery sheet loaded via `fetch()`.
- Honest loading states with rotating status messages and an 8-second
  "taking longer than usual" fallback.
- Accessibility: visible labels, keyboard navigation, `aria-live` status,
  44px tap targets, 16px minimum body text, reduced-motion support, holds at
  150% zoom and 320px width.
- Maps, pins, route lines and the radar pulse are drawn in **CSS + inline
  SVG** — no image assets, no external fonts or libraries, so first paint is
  resilient on slow networks.

**Mocked (clearly labelled in the UI):**

- No SMS is sent — the demo OTP (`845621`) is shown on screen.
- No real driver matching, payment, live location, or SOS call.
- Driver, co-passenger, fares and pickup points are sample data.
- "Network" actions are `setTimeout` delays (1.4–2.2s) to make loading states
  honest and testable.

**What a real deployment would still need:** a backend for auth, matching,
payments (UPI) and live tracking; driver & operator apps; verified driver KYC
and insurance; real map/routing and GPS; identity verification for shared
rides (required under the Maharashtra Aggregator Cabs Policy 2025); and a real
24/7 safety desk behind the SOS button.

---

## Project structure

```
index.html        Entry point — loads CSS + js/main.js (type="module")
404.html          Fallback — redirects any unresolved URL back to the app
.nojekyll         Disables Jekyll so files under js/ and css/ are served as-is
components/        HTML snippets loaded via fetch() (support sheet)
css/               base · layout · components · states · responsive
js/
  main.js          boot
  router.js        hash routing (no History API)
  state.js         localStorage-backed journey + resume logic
  mock-data.js     all synthetic data (Indian formats)
  ui.js            DOM helpers, icon set, toasts, overlay, fetch loader
  maps.js          CSS/SVG map builders
  views/           one module per screen
```

See **DEPLOY.md** for the GitHub Pages walkthrough.
