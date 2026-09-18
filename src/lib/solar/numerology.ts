import { TROPICAL_YEAR } from "./bodies";
import { norm } from "./astrology";

/** Digital root. 9 stays 9. This is base-ten arithmetic, not a sky law. */
export function digitalRoot(n: number) {
  const x = Math.abs(Math.trunc(n));
  if (x === 0) return 9;
  const r = x % 9;
  return r === 0 ? 9 : r;
}

export type NumenCut = "nine" | "week" | "square";

export const NINE = [
  { n: 1, planet: "Sun", id: "sun", color: "#f2e6c4", word: "will" },
  { n: 2, planet: "Moon", id: "moon", color: "#d9d6cf", word: "pair" },
  { n: 3, planet: "Jupiter", id: "jupiter", color: "#d6c49a", word: "grow" },
  { n: 4, planet: "Rahu", id: "rahu", color: "#8a8494", word: "node" },
  { n: 5, planet: "Mercury", id: "mercury", color: "#b7c0c8", word: "move" },
  { n: 6, planet: "Venus", id: "venus", color: "#e8c9a8", word: "bind" },
  { n: 7, planet: "Ketu", id: "ketu", color: "#9aa3b2", word: "shadow" },
  { n: 8, planet: "Saturn", id: "saturn", color: "#c4b896", word: "time" },
  { n: 9, planet: "Mars", id: "mars", color: "#c9897c", word: "end" },
] as const;

/** Western overlay that fills 4 and 7 with discovered worlds instead of nodes. */
export const WESTERN_ALT: Record<number, { planet: string; id: string }> = {
  4: { planet: "Uranus", id: "uranus" },
  7: { planet: "Neptune", id: "neptune" },
};

export const PLANET_NUMBER: Record<string, number> = {
  sun: 1,
  moon: 2,
  jupiter: 3,
  rahu: 4,
  uranus: 4,
  mercury: 5,
  venus: 6,
  ketu: 7,
  neptune: 7,
  saturn: 8,
  mars: 9,
};

/** Nine equal 40° seats from the equinox. */
export function nineAt(lon: number) {
  return NINE[Math.floor(norm(lon) / 40) % 9];
}

/** Lo Shu / Saturn kamea. Every line sums to 15. A square, not an orbit. */
export const LO_SHU = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
] as const;

export const WEEK = [
  { id: "sun", name: "Sunday", ab: "Sun", n: 1, color: "#f2e6c4" },
  { id: "moon", name: "Monday", ab: "Mon", n: 2, color: "#d9d6cf" },
  { id: "mars", name: "Tuesday", ab: "Tue", n: 9, color: "#c9897c" },
  { id: "mercury", name: "Wednesday", ab: "Wed", n: 5, color: "#b7c0c8" },
  { id: "jupiter", name: "Thursday", ab: "Thu", n: 3, color: "#d6c49a" },
  { id: "venus", name: "Friday", ab: "Fri", n: 6, color: "#e8c9a8" },
  { id: "saturn", name: "Saturday", ab: "Sat", n: 8, color: "#c4b896" },
] as const;

export function weekdayAt(days: number) {
  return WEEK[((Math.floor(days) % 7) + 7) % 7];
}

export function dayRoot(days: number) {
  const doy = Math.floor(((days % TROPICAL_YEAR) + TROPICAL_YEAR) % TROPICAL_YEAR) + 1;
  return { doy, root: digitalRoot(doy) };
}

/** The clip’s own integers, reduced. Arithmetic, not revelation. */
export const REDUCTIONS = [
  { raw: "365", root: 5, of: "year" },
  { raw: "28", root: 1, of: "moon-month" },
  { raw: "13", root: 4, of: "count" },
  { raw: "12", root: 3, of: "signs" },
  { raw: "7", root: 7, of: "lamps" },
  { raw: "9", root: 9, of: "digits" },
] as const;

export const NUMEN_CUTS: { id: NumenCut; label: string; line: string }[] = [
  {
    id: "nine",
    label: "The nine",
    line: "1–9 mapped onto seven lamps plus two lunar nodes. A name map. The sky was not measured into nine.",
  },
  {
    id: "week",
    label: "The week",
    line: "Seven named days. This one is in the language: Sunday, Monday, Saturday. Hours of the seven, skipped around the clock.",
  },
  {
    id: "square",
    label: "The square",
    line: "Lo Shu / Saturn square. Every row, column, diagonal is 15. A tablet sitting above the wheel — not on it.",
  },
];
