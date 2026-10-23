/* ============================================================
   state.js — journey state, persisted to browser cache.
   A page refresh must never wipe the journey, so every write
   is mirrored to localStorage. Keys are namespaced "qw_" to
   avoid collisions. sessionStorage holds tab-only transient bits.
   ============================================================ */

import { TRIP_DEFAULTS, HUB, DESTINATION, PICKUP_POINTS } from "./mock-data.js";

const KEY = "qw_journey_v1";
const SESSION_KEY = "qw_session_v1";

/* Default shape of a fresh journey. */
function defaults() {
  return {
    auth: { phone: "", verified: false, photoAdded: false },
    onboardingDone: false,
    trip: {
      hub: HUB.name,
      pickup: PICKUP_POINTS[0],          // Gate 2 chosen by default
      destination: DESTINATION,
      passengers: TRIP_DEFAULTS.passengers,
      bags: TRIP_DEFAULTS.bags,
    },
    ride: null,                           // selected ride option id
    safety: {
      verifiedDrivers: true,
      recordTrip: true,
      shareLive: true,
      womenOnly: true,
    },
    share: { enabled: false, womenOnly: true, maxOne: true },
    detour: { decided: false, taken: false },
    booking: {
      status: "none",                     // none | finding | confirmed | cancelled | completed
      ref: null,
      pin: null,
    },
    updatedAt: null,
  };
}

/* Safe read from localStorage (private mode / blocked storage can throw). */
function readStore(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/* Safe write. If storage is unavailable the app still works in-memory. */
function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* ignore — in-memory state (below) keeps the session usable */
  }
}

/* In-memory copy so the app never depends solely on storage. */
let memory = readStore(KEY) || defaults();

/* Return the live journey object (always defined). */
export function getJourney() {
  return memory;
}

/* Merge a patch into the journey and persist. Accepts nested partials. */
export function patch(partial) {
  memory = deepMerge(memory, partial);
  memory.updatedAt = Date.now();
  writeStore(KEY, memory);
  return memory;
}

/* Replace one top-level slice (e.g. patchSlice('trip', {...})). */
export function patchSlice(slice, partial) {
  const next = { ...(memory[slice] || {}), ...partial };
  return patch({ [slice]: next });
}

/* Reset the whole journey (explicit logout / start over / completion). */
export function resetJourney() {
  memory = defaults();
  writeStore(KEY, memory);
  clearSession();
  return memory;
}

/* sessionStorage helpers (cleared when tab closes). */
export function setSession(key, value) {
  const s = readStore(SESSION_KEY) || {};
  s[key] = value;
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(s)); } catch (e) {}
}
export function getSession(key) {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    const s = raw ? JSON.parse(raw) : {};
    return s[key];
  } catch (e) { return undefined; }
}
export function clearSession() {
  try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
}

/* Where should a cold boot land, based on saved progress?
   Never silently restart — resume where the traveller left off. */
export function resumeRoute() {
  const j = memory;
  if (j.booking.status === "confirmed") return "#/arriving";
  if (j.booking.status === "finding") return "#/finding";
  if (!j.onboardingDone) return "#/splash";
  if (!j.auth.verified) return "#/phone";
  if (!j.auth.photoAdded) return "#/photo";
  return "#/home";
}

/* True if there is a booking worth resuming (used for the home banner). */
export function hasActiveBooking() {
  return ["finding", "confirmed"].includes(memory.booking.status);
}

/* ---- deep merge (objects only; arrays/values are replaced) ---- */
function deepMerge(base, patchObj) {
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const k of Object.keys(patchObj)) {
    const pv = patchObj[k];
    if (pv && typeof pv === "object" && !Array.isArray(pv) &&
        out[k] && typeof out[k] === "object" && !Array.isArray(out[k])) {
      out[k] = deepMerge(out[k], pv);
    } else {
      out[k] = pv;
    }
  }
  return out;
}
