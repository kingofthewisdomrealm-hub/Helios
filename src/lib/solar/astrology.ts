import {
  BODIES,
  SYNODIC_MONTH,
  TROPICAL_YEAR,
  type Body,
} from "./bodies";

/** Day-of-year of the March equinox (mean). Tropical 0° = Sun on this day. */
export const EQUINOX_DAY = 79.65;

export type SkyCut = "tropical" | "stars" | "both";
export type MonthCut = "gregorian" | "fixed13" | "roman";

export const SIGNS = [
  { id: "aries", name: "Aries", ab: "Ari", start: 0, line: "Cut at the spring equinox." },
  { id: "taurus", name: "Taurus", ab: "Tau", start: 30, line: "Second equal 30°." },
  { id: "gemini", name: "Gemini", ab: "Gem", start: 60, line: "Third equal 30°." },
  { id: "cancer", name: "Cancer", ab: "Can", start: 90, line: "Northern solstice sits here." },
  { id: "leo", name: "Leo", ab: "Leo", start: 120, line: "Fifth equal 30°." },
  { id: "virgo", name: "Virgo", ab: "Vir", start: 150, line: "Sixth equal 30°." },
  { id: "libra", name: "Libra", ab: "Lib", start: 180, line: "Cut at the autumn equinox." },
  { id: "scorpio", name: "Scorpio", ab: "Sco", start: 210, line: "Eighth equal 30°." },
  { id: "sagittarius", name: "Sagittarius", ab: "Sag", start: 240, line: "Ninth equal 30°." },
  { id: "capricorn", name: "Capricorn", ab: "Cap", start: 270, line: "Southern solstice sits here." },
  { id: "aquarius", name: "Aquarius", ab: "Aqu", start: 300, line: "Eleventh equal 30°." },
  { id: "pisces", name: "Pisces", ab: "Pis", start: 330, line: "Last equal 30°." },
] as const;

/** IAU constellation spans, as tropical longitude of the Sun today (precession already in). */
export const CONSTELLATIONS = [
  { id: "pisces", name: "Pisces", start: 351.6, end: 29.1 },
  { id: "aries", name: "Aries", start: 29.1, end: 53.7 },
  { id: "taurus", name: "Taurus", start: 53.7, end: 90.2 },
  { id: "gemini", name: "Gemini", start: 90.2, end: 120.8 },
  { id: "cancer", name: "Cancer", start: 120.8, end: 140.5 },
  { id: "leo", name: "Leo", start: 140.5, end: 177.0 },
  { id: "virgo", name: "Virgo", start: 177.0, end: 221.4 },
  { id: "libra", name: "Libra", start: 221.4, end: 244.1 },
  { id: "scorpius", name: "Scorpius", start: 244.1, end: 251.0 },
  { id: "ophiuchus", name: "Ophiuchus", start: 251.0, end: 268.7 },
  { id: "sagittarius", name: "Sagittarius", start: 268.7, end: 299.4 },
  { id: "capricornus", name: "Capricornus", start: 299.4, end: 327.0 },
  { id: "aquarius", name: "Aquarius", start: 327.0, end: 351.6 },
] as const;

export type MonthWedge = {
  id: string;
  name: string;
  ab: string;
  start: number;
  end: number;
  /** Number the name still wears, if any (Sep = 7). */
  nameNum: number | null;
  leftover?: boolean;
};

function dayToLon(doy: number) {
  return norm(((doy - EQUINOX_DAY) / TROPICAL_YEAR) * 360);
}

/** Gregorian months as Sun-longitude wedges. January does not sit on the equinox. */
export const GREGORIAN_MONTHS: MonthWedge[] = (() => {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const names = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const abs = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const nameNum = [null, null, null, null, null, null, null, null, 7, 8, 9, 10] as (number | null)[];
  let doy = 1;
  return days.map((d, i) => {
    const start = dayToLon(doy);
    doy += d;
    const end = dayToLon(doy);
    return { id: abs[i].toLowerCase(), name: names[i], ab: abs[i], start, end, nameNum: nameNum[i] };
  });
})();

/** 13 × 28 days from the equinox, plus the leftover ~1.24-day sliver. */
export const FIXED13_MONTHS: MonthWedge[] = (() => {
  const span = (28 / TROPICAL_YEAR) * 360;
  const months: MonthWedge[] = Array.from({ length: 13 }, (_, i) => ({
    id: `m${i + 1}`,
    name: `Month ${i + 1}`,
    ab: String(i + 1),
    start: i * span,
    end: (i + 1) * span,
    nameNum: i + 1,
  }));
  months.push({
    id: "leftover",
    name: "Leftover day",
    ab: "+",
    start: (364 / TROPICAL_YEAR) * 360,
    end: 360,
    nameNum: null,
    leftover: true,
  });
  return months;
})();

/** Ten named months from the equinox. September is wedge 7. */
export const ROMAN_MONTHS: MonthWedge[] = [
  { id: "mar", name: "Martius", ab: "Mar", start: 0, end: 36, nameNum: 1 },
  { id: "apr", name: "Aprilis", ab: "Apr", start: 36, end: 72, nameNum: 2 },
  { id: "mai", name: "Maius", ab: "May", start: 72, end: 108, nameNum: 3 },
  { id: "jun", name: "Junius", ab: "Jun", start: 108, end: 144, nameNum: 4 },
  { id: "qui", name: "Quintilis", ab: "Qui", start: 144, end: 180, nameNum: 5 },
  { id: "sex", name: "Sextilis", ab: "Sex", start: 180, end: 216, nameNum: 6 },
  { id: "sep", name: "September", ab: "Sep", start: 216, end: 252, nameNum: 7 },
  { id: "oct", name: "October", ab: "Oct", start: 252, end: 288, nameNum: 8 },
  { id: "nov", name: "November", ab: "Nov", start: 288, end: 324, nameNum: 9 },
  { id: "dec", name: "December", ab: "Dec", start: 324, end: 360, nameNum: 10 },
];

export function monthsFor(cut: MonthCut) {
  if (cut === "fixed13") return FIXED13_MONTHS;
  if (cut === "roman") return ROMAN_MONTHS;
  return GREGORIAN_MONTHS;
}

export function monthAt(lon: number, cut: MonthCut) {
  const L = norm(lon);
  const months = monthsFor(cut);
  return (
    months.find((m) => (m.start < m.end ? L >= m.start && L < m.end : L >= m.start || L < m.end)) ??
    months[0]
  );
}

export const MONTH_CUTS: { id: MonthCut; label: string; line: string }[] = [
  { id: "gregorian", label: "Gregorian", line: "Twelve uneven months. Year starts in January, off the equinox." },
  { id: "fixed13", label: "Thirteen", line: "13 × 28 = 364 from the equinox. The white sliver is the leftover day. 365 ÷ 28 is not 13." },
  { id: "roman", label: "Roman", line: "Ten months from March. September is wedge 7. The names were never hidden." },
];

const MEAN_L0: Record<string, number> = {
  mercury: 92,
  venus: 155,
  mars: 28,
  jupiter: 214,
  saturn: 266,
  uranus: 48,
  neptune: 192,
  pluto: 302,
  ceres: 80,
};

export function norm(deg: number) {
  return ((deg % 360) + 360) % 360;
}

export function sunTropicalLon(days: number) {
  return norm(((days - EQUINOX_DAY) / TROPICAL_YEAR) * 360);
}

export function signAt(lon: number) {
  const i = Math.floor(norm(lon) / 30) % 12;
  return SIGNS[i];
}

export function constellationAt(lon: number) {
  const L = norm(lon);
  return (
    CONSTELLATIONS.find((c) =>
      c.start < c.end ? L >= c.start && L < c.end : L >= c.start || L < c.end,
    ) ?? CONSTELLATIONS[0]
  );
}

function helioXY(lonDeg: number, au: number) {
  const a = (lonDeg * Math.PI) / 180;
  return { x: Math.cos(a) * au, y: Math.sin(a) * au };
}

export function earthHelioLon(days: number) {
  return norm(sunTropicalLon(days) + 180);
}

export function helioLonOf(body: Body, days: number) {
  if (body.id === "sun") return 0;
  if (body.id === "earth") return earthHelioLon(days);
  const L0 = MEAN_L0[body.id] ?? 0;
  return norm(L0 + (360 / Math.max(body.periodDays, 1)) * days);
}

export function geoLonOf(body: Body, days: number) {
  if (body.id === "sun") return sunTropicalLon(days);
  if (body.id === "earth") return null;
  if (body.id === "moon") {
    return norm(sunTropicalLon(days) + (days / SYNODIC_MONTH) * 360);
  }
  const e = helioXY(earthHelioLon(days), 1);
  const p = helioXY(helioLonOf(body, days), Math.max(body.au, 0.01));
  return norm((Math.atan2(p.y - e.y, p.x - e.x) * 180) / Math.PI);
}

export type ChartBody = {
  id: string;
  name: string;
  color: string;
  lon: number;
  rx: boolean;
  sign: (typeof SIGNS)[number];
  constellation: (typeof CONSTELLATIONS)[number];
  kind: Body["kind"];
};

const CHART_IDS = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];

export function chartBodies(days: number): ChartBody[] {
  const dt = 1.2;
  return CHART_IDS.map((id) => {
    const body = BODIES.find((b) => b.id === id)!;
    const lon = geoLonOf(body, days) ?? 0;
    const prev = geoLonOf(body, days - dt) ?? lon;
    let d = lon - prev;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return {
      id,
      name: body.name,
      color: body.color,
      lon,
      rx: d < -0.02 && id !== "sun" && id !== "moon",
      sign: signAt(lon),
      constellation: constellationAt(lon),
      kind: body.kind,
    };
  });
}

export const SKY_CUTS: { id: SkyCut; label: string; line: string }[] = [
  { id: "tropical", label: "Twelve signs", line: "Equal 30° from the spring equinox. This is the horoscope wheel." },
  { id: "stars", label: "The stars", line: "Unequal constellations on the ecliptic. Ophiuchus is the thirteenth." },
  { id: "both", label: "The slip", line: "Same sky. Two knives. About 24° of precession between them." },
];
