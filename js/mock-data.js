/* ============================================================
   mock-data.js — ALL synthetic data for the prototype lives here.
   Nothing is hardcoded in HTML or other JS files. Formats follow
   real Indian conventions (₹ Indian grouping, +91, DD/MM/YYYY,
   10-digit PNR). No real Aadhaar, PAN, OTP or personal data.
   ============================================================ */

/* The demo OTP is shown to the reviewer on screen so they can proceed. */
export const DEMO_OTP = "845621";

/* Demo account the reviewer is signed in as. */
export const USER = {
  firstName: "Aarav",
  fullName: "Aarav Sharma",
  phone: "98765 43210",
  countryCode: "+91",
  initial: "A",
  avatarColor: "#2f6bff",
};

/* Saved places on the home screen. */
export const SAVED_PLACES = [
  { id: "home", icon: "home", title: "Home", sub: "Sector 24, Noida" },
  { id: "work", icon: "work", title: "Work", sub: "Cyber Hub, Gurugram" },
  { id: "ndls", icon: "train", title: "New Delhi Railway Station", sub: "Recent · last-mile pickup", recent: true },
];

/* The hub the demo journey starts from. */
export const HUB = {
  name: "New Delhi Railway Station",
  short: "NDLS",
};

/* Verified pickup points at the hub (wayfinding). */
export const PICKUP_POINTS = [
  { id: "A", title: "Gate 2 · Prepaid Auto Stand", sub: "1 min walk · well-lit, staffed", walk: 1, recorded: true },
  { id: "B", title: "Platform 1 Exit", sub: "3 min walk · covered", walk: 3 },
  { id: "C", title: "Paharganj Side Gate", sub: "5 min walk", walk: 5 },
];

/* Destination for the demo trip. */
export const DESTINATION = { title: "Home", sub: "Sector 24, Noida" };

/* Trip defaults (traveller carrying luggage — the real pain point). */
export const TRIP_DEFAULTS = { passengers: 3, bags: 4 };

/* Ride options. Fares in whole rupees. baseFare drives share/detour math. */
export const RIDES = [
  {
    id: "quickxl", name: "QuickXL", glyph: "suv",
    seats: 6, bags: 4, etaMin: 4, fare: 412,
    tag: "Best for you", tagStyle: "ink",
    meta: "6 seats · fits 4 bags · 4 min",
  },
  {
    id: "quickgo", name: "QuickGo", glyph: "car",
    seats: 4, bags: 2, etaMin: 3, fare: 286,
    tag: "Cheapest", tagStyle: "savings", saveFrom: 412,
    meta: "4 seats · 2 bags · 3 min",
  },
  {
    id: "shared", name: "Shared", glyph: "car",
    seats: 2, bags: 1, etaMin: 6, fare: 168,
    tag: null, saveFrom: 412, shared: true,
    meta: "Co-ride · same route · 6 min",
  },
  {
    id: "acbus", name: "AC Bus", glyph: "bus",
    seats: null, bags: null, etaMin: 9, fare: 90,
    tag: null,
    meta: "Seats available · 9 min",
  },
];

/* Verified co-passenger offered on the share-ride screen. */
export const CO_PASSENGER = {
  initial: "N", name: "Neha", color: "#7356bf",
  rating: 4.9, verified: true,
  note: "On your route · picks up in 2 min",
};

/* The matched driver (shown on arriving / trip screens). */
export const DRIVER = {
  initial: "R", name: "Rajesh Kumar", color: "#2b2f33",
  rating: 4.9, vehicle: "White Toyota Innova",
  plate: "DL3C AB 1234", pin: "4827", etaMin: 4,
};

/* Trusted contacts for live-location sharing. */
export const TRUSTED = [
  { initial: "M", name: "Mom", color: "#2f6bff" },
  { initial: "P", name: "Priya", color: "#0e8a4f" },
];

/* Smart-detour comparison (toll/surge avoidance). */
export const DETOUR = {
  direct: { label: "Direct route", min: 32, fare: 412 },
  smart: { label: "Smart detour", min: 38, extraMin: 6, fare: 338 },
  save: 74, savePct: 18,
};

/* Fare breakdown used on confirm + receipt. Indian ₹ grouping via formatINR. */
export const FARE_BREAKDOWN = {
  base: 360,
  tolls: 40,
  taxes: 12,
  coupon: { code: "FIRST50", amount: 0, note: "No fee on your first ride" },
  total: 412,
};

/* AC bus alternative mentioned on the trip screen. */
export const BUS_FALLBACK = { fare: 90, note: "AC bus seats are also available" };

/* Pending/loading status messages (honest about what's happening). */
export const WAIT_MESSAGES = {
  otp: ["Sending a one-time code…", "Almost there…"],
  verify: ["Checking your code…", "Signing you in securely…"],
  photo: ["Saving your photo…", "Keeping it private to drivers only…"],
  booking: ["Confirming your booking…", "Reserving your fixed fare…"],
  finding: ["Matching you with a trusted driver nearby…", "Confirming your pickup point…"],
};

/* Wayfinding directions from the gate to the pickup point. */
export const DIRECTIONS = [
  { t: "Exit <b>Platform 1</b> and follow signs for <b>Gate 2</b>." },
  { t: "Take the <b>step-free ramp</b> on your right — easier with bags." },
  { t: "Cross to the <b>Prepaid Auto Stand</b>; it is staffed and well-lit." },
  { t: "Look for the <b>A2 pillar</b> — your driver waits beside it." },
];

/* Format a number as Indian rupees with lakh/crore grouping. */
export function formatINR(n) {
  const s = Math.round(n).toString();
  if (s.length <= 3) return "₹" + s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return "₹" + rest + "," + last3;
}

/* Today's date in DD/MM/YYYY (receipt). */
export function todayDMY() {
  const d = new Date();
  const p = (x) => String(x).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/* A believable booking reference: QW + YYMMDD + 4 digits. */
export function makeBookingRef() {
  const d = new Date();
  const p = (x) => String(x).padStart(2, "0");
  const stamp = `${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}`;
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `QW${stamp}${rnd}`;
}
