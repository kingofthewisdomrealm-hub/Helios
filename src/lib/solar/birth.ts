import { EQUINOX_DAY, norm } from "./astrology";
import { gstOf, hourAngle, planetsOnEarth, type Geo } from "./astrocartography";
import { TROPICAL_YEAR } from "./bodies";

export const EPOCH_YEAR = 2000;

export const MONTHS = [
  { i: 0, name: "January", ab: "Jan", days: 31, start: 1 },
  { i: 1, name: "February", ab: "Feb", days: 28, start: 32 },
  { i: 2, name: "March", ab: "Mar", days: 31, start: 60 },
  { i: 3, name: "April", ab: "Apr", days: 30, start: 91 },
  { i: 4, name: "May", ab: "May", days: 31, start: 121 },
  { i: 5, name: "June", ab: "Jun", days: 30, start: 152 },
  { i: 6, name: "July", ab: "Jul", days: 31, start: 182 },
  { i: 7, name: "August", ab: "Aug", days: 31, start: 213 },
  { i: 8, name: "September", ab: "Sep", days: 30, start: 244 },
  { i: 9, name: "October", ab: "Oct", days: 31, start: 274 },
  { i: 10, name: "November", ab: "Nov", days: 30, start: 305 },
  { i: 11, name: "December", ab: "Dec", days: 31, start: 335 },
] as const;

export type BirthStamp = {
  wrapped: number;
  year: number;
  doy: number;
  month: (typeof MONTHS)[number];
  monthNum: number;
  day: number;
  hour: number;
  minute: number;
  frac: number;
};

export function isLeap(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function wrapYear(days: number) {
  const y = TROPICAL_YEAR;
  return ((days % y) + y) % y;
}

export function yearOf(days: number) {
  return EPOCH_YEAR + Math.floor(days / TROPICAL_YEAR);
}

export function partsOf(days: number): BirthStamp {
  const year = yearOf(days);
  const wrapped = wrapYear(days);
  const whole = Math.min(364, Math.floor(wrapped));
  const frac = wrapped - Math.floor(wrapped);
  const doy = whole + 1;
  const month = MONTHS.find((m, i) => {
    const next = MONTHS[i + 1];
    return doy >= m.start && (!next || doy < next.start);
  }) ?? MONTHS[11];
  const day = doy - month.start + 1;
  const minutes = Math.round(frac * 24 * 60) % (24 * 60);
  return {
    wrapped,
    year,
    doy,
    month,
    monthNum: month.i + 1,
    day,
    hour: Math.floor(minutes / 60),
    minute: minutes % 60,
    frac,
  };
}

export function daysFrom(doy: number, hour: number, minute = 0) {
  const d = Math.min(366, Math.max(1, doy));
  const h = ((hour % 24) + 24) % 24;
  const m = Math.min(59, Math.max(0, minute));
  return d - 1 + (h + m / 60) / 24;
}

function yearBase(days: number) {
  return days - wrapYear(days);
}

export function withDoy(days: number, doy: number) {
  const p = partsOf(days);
  return yearBase(days) + daysFrom(doy, p.hour, p.minute);
}

export function withTime(days: number, hour: number, minute = 0) {
  const p = partsOf(days);
  return yearBase(days) + daysFrom(p.doy, hour, minute);
}

export function withLocalTime(days: number, hour: number, minute: number, lon?: number | null) {
  const p = partsOf(days);
  const local = lon != null ? localStamp(p, lon) : p;
  return civilToDays(local.year, local.monthNum, local.day, hour, minute, lon ?? undefined);
}

/** Civil local time at optional longitude → UTC sim days from 2000. */
export function civilToDays(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  lon?: number,
) {
  const y = Math.min(2100, Math.max(1800, year));
  const m = Math.min(12, Math.max(1, month));
  const monthRec = MONTHS[m - 1];
  const d = Math.min(monthRec.days, Math.max(1, day));
  let h = hour + minute / 60;
  if (lon != null) h -= lon / 15;
  return (y - EPOCH_YEAR) * TROPICAL_YEAR + (monthRec.start + d - 2) + h / 24;
}

export function dateInputValue(p: BirthStamp) {
  return `${p.year}-${String(p.monthNum).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function hhmm(p: BirthStamp) {
  return `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}

export function stampLine(p: BirthStamp) {
  return `${p.day} ${p.month.name} ${p.year} · ${hhmm(p)}`;
}

/** Tropical longitude of a day-of-year. Equinox sits at 0°. */
export function doyToLon(doy: number) {
  return norm(((doy - EQUINOX_DAY) / TROPICAL_YEAR) * 360);
}

export function lonToDoy(lon: number) {
  const L = norm(lon);
  let d = EQUINOX_DAY + (L / 360) * TROPICAL_YEAR;
  d = ((Math.round(d) - 1) % 365 + 365) % 365 + 1;
  return d;
}

/** Local mean time at a longitude. 15° = 1 hour. */
export function localStamp(p: BirthStamp, lon: number): BirthStamp {
  return partsOf(civilToDays(p.year, p.monthNum, p.day, p.hour, p.minute) + lon / 15 / 24);
}

export const YEAR_BEATS = [
  { id: "eq1", label: "20 Mar", doy: Math.round(EQUINOX_DAY) },
  { id: "sol1", label: "21 Jun", doy: 172 },
  { id: "eq2", label: "22 Sep", doy: 266 },
  { id: "sol2", label: "21 Dec", doy: 355 },
] as const;

export const HOUR_BEATS = [
  { id: "noon", label: "Noon", hour: 12, minute: 0 },
  { id: "midnight", label: "Midnight", hour: 0, minute: 0 },
  { id: "dusk", label: "18:00", hour: 18, minute: 0 },
  { id: "dawn", label: "06:00", hour: 6, minute: 0 },
] as const;

/** UTC fractional day so a planet is rising (−90°) or setting (+90°) at a pin. */
export function timeForHorizon(days: number, pin: Geo, which: "rise" | "set") {
  const sun = planetsOnEarth(days).find((p) => p.id === "sun")!;
  const want = which === "rise" ? -90 : 90;
  const gstNow = gstOf(days);
  const gstWant = want - pin.lon + sun.ra;
  let d = ((gstWant - gstNow + 540) % 360) - 180;
  return days + d / 360.985647;
}

export function horizonWord(days: number, pin: Geo) {
  const sun = planetsOnEarth(days).find((p) => p.id === "sun")!;
  const h = hourAngle(pin.lon, sun.ra, gstOf(days));
  return h;
}
