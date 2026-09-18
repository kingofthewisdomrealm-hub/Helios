import { EARTH_TILT, TROPICAL_YEAR } from "./bodies";
import { chartBodies, geoLonOf, norm, type ChartBody } from "./astrology";
import { BODIES } from "./bodies";

/** Degrees of Earth spin per solar day (sidereal). */
export const GST_PER_DAY = 360.985647;

export type GroundCut = "four" | "poster" | "day" | "places";

export const GROUND_CUTS: { id: GroundCut; label: string; line: string }[] = [
  {
    id: "four",
    label: "Four lines",
    line: "Overhead, underfoot, rising, setting. One planet. One frozen second.",
  },
  {
    id: "poster",
    label: "The poster",
    line: "Every overhead line at once. This is the map people share.",
  },
  {
    id: "day",
    label: "Day",
    line: "The Sun’s rising line is dawn. You already live on it.",
  },
  {
    id: "places",
    label: "Named dirt",
    line: "If you were born in ___ on _____, you should go to the bright city.",
  },
];

export const ANGLE_WORDS = [
  { id: "mc", name: "Overhead", ab: "MC", line: "Planet on the local meridian. Highest in the sky." },
  { id: "ic", name: "Underfoot", ab: "IC", line: "The opposite meridian. The planet is under the dirt." },
  { id: "ac", name: "Rising", ab: "AC", line: "Planet on the eastern horizon. The dawn of that lamp." },
  { id: "dc", name: "Setting", ab: "DC", line: "Planet on the western horizon. The dusk of that lamp." },
] as const;

export type AngleId = (typeof ANGLE_WORDS)[number]["id"];

export type Geo = { lat: number; lon: number };

export type PlanetOnEarth = {
  id: string;
  name: string;
  color: string;
  lonEcl: number;
  ra: number;
  dec: number;
  sub: Geo;
};

function rad(d: number) {
  return (d * Math.PI) / 180;
}
function deg(r: number) {
  return (r * 180) / Math.PI;
}

export function gstOf(days: number) {
  return norm(days * GST_PER_DAY);
}

/** Ecliptic longitude → RA/Dec. Planets treated as on the ecliptic. */
export function eclToRaDec(lambda: number, eps = EARTH_TILT) {
  const l = rad(lambda);
  const e = rad(eps);
  const ra = Math.atan2(Math.sin(l) * Math.cos(e), Math.cos(l));
  const dec = Math.asin(Math.sin(e) * Math.sin(l));
  return { ra: norm(deg(ra)), dec: deg(dec) };
}

export function subPoint(ra: number, dec: number, gst: number): Geo {
  return { lat: dec, lon: norm(ra - gst + 180) - 180 };
}

export function planetOnEarth(body: ChartBody, days: number): PlanetOnEarth {
  const gst = gstOf(days);
  const { ra, dec } = eclToRaDec(body.lon);
  return {
    id: body.id,
    name: body.name,
    color: body.color,
    lonEcl: body.lon,
    ra,
    dec,
    sub: subPoint(ra, dec, gst),
  };
}

export function planetsOnEarth(days: number): PlanetOnEarth[] {
  return chartBodies(days).map((b) => planetOnEarth(b, days));
}

export function angDist(a: Geo, b: Geo) {
  const p1 = rad(a.lat);
  const p2 = rad(b.lat);
  const d = rad(b.lon - a.lon);
  const c = Math.sin(p1) * Math.sin(p2) + Math.cos(p1) * Math.cos(p2) * Math.cos(d);
  return deg(Math.acos(Math.min(1, Math.max(-1, c))));
}

/** Local hour angle, degrees, −180..180. 0 = meridian, west positive. */
export function hourAngle(lon: number, ra: number, gst: number) {
  let h = gst + lon - ra;
  h = ((h + 180) % 360) + 360;
  return (h % 360) - 180;
}

export function meridian(lon: number, n = 72): Geo[] {
  const L = ((lon + 180) % 360) - 180;
  const pts: Geo[] = [];
  for (let i = 0; i <= n; i++) pts.push({ lat: -90 + (180 * i) / n, lon: L });
  return pts;
}

export function greatCircleFromPole(pole: Geo, n = 96): Geo[] {
  const p = { x: Math.cos(rad(pole.lat)) * Math.cos(rad(pole.lon)), y: Math.cos(rad(pole.lat)) * Math.sin(rad(pole.lon)), z: Math.sin(rad(pole.lat)) };
  let ax = { x: -p.y, y: p.x, z: 0 };
  const mag = Math.hypot(ax.x, ax.y, ax.z);
  if (mag < 1e-8) ax = { x: 1, y: 0, z: 0 };
  else {
    ax.x /= mag;
    ax.y /= mag;
    ax.z /= mag;
  }
  const bx = { x: p.y * ax.z - p.z * ax.y, y: p.z * ax.x - p.x * ax.z, z: p.x * ax.y - p.y * ax.x };
  const pts: Geo[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = ax.x * c + bx.x * s;
    const y = ax.y * c + bx.y * s;
    const z = ax.z * c + bx.z * s;
    pts.push({ lat: deg(Math.asin(Math.min(1, Math.max(-1, z)))), lon: deg(Math.atan2(y, x)) });
  }
  return pts;
}

export type LocalWord = {
  word: string;
  detail: string;
  angle: AngleId | null;
  altitude: number;
};

export function localWord(pin: Geo, planet: PlanetOnEarth, gst: number): LocalWord {
  const zenith = angDist(pin, planet.sub);
  const altitude = 90 - zenith;
  const h = hourAngle(pin.lon, planet.ra, gst);
  const name = planet.name;
  if (zenith < 12) return { word: "overhead", detail: `${name} stands highest here.`, angle: "mc", altitude };
  if (zenith > 168) return { word: "underfoot", detail: `${name} is under this dirt.`, angle: "ic", altitude };
  if (Math.abs(altitude) < 10 && h < 0) return { word: "rising", detail: `${name} is on the eastern rim.`, angle: "ac", altitude };
  if (Math.abs(altitude) < 10 && h > 0) return { word: "setting", detail: `${name} is on the western rim.`, angle: "dc", altitude };
  if (altitude > 0) {
    return {
      word: `${altitude.toFixed(0)}° up`,
      detail: `${name} is above the dirt. ${h < 0 ? "East of the meridian." : "West of the meridian."}`,
      angle: null,
      altitude,
    };
  }
  return {
    word: `${Math.abs(altitude).toFixed(0)}° under`,
    detail: `${name} is below the rim.`,
    angle: null,
    altitude,
  };
}

/** Spare land rings, lon/lat. Enough to read as Earth. */
export const LAND: Geo[][] = [
  // Africa
  [
    { lon: -17, lat: 21 }, { lon: -12, lat: 33 }, { lon: 10, lat: 37 }, { lon: 32, lat: 31 },
    { lon: 43, lat: 12 }, { lon: 51, lat: 12 }, { lon: 43, lat: -11 }, { lon: 40, lat: -16 },
    { lon: 32, lat: -25 }, { lon: 20, lat: -35 }, { lon: 12, lat: -18 }, { lon: 10, lat: 4 },
    { lon: -14, lat: 5 }, { lon: -17, lat: 14 },
  ],
  // Eurasia
  [
    { lon: -10, lat: 36 }, { lon: -9, lat: 43 }, { lon: -5, lat: 48 }, { lon: 0, lat: 51 },
    { lon: 8, lat: 59 }, { lon: 12, lat: 66 }, { lon: 40, lat: 68 }, { lon: 70, lat: 73 },
    { lon: 100, lat: 75 }, { lon: 140, lat: 73 }, { lon: 170, lat: 70 }, { lon: 178, lat: 68 },
    { lon: 160, lat: 60 }, { lon: 142, lat: 50 }, { lon: 130, lat: 32 }, { lon: 122, lat: 30 },
    { lon: 105, lat: 18 }, { lon: 98, lat: 8 }, { lon: 78, lat: 8 }, { lon: 70, lat: 22 },
    { lon: 60, lat: 25 }, { lon: 44, lat: 36 }, { lon: 28, lat: 41 }, { lon: 28, lat: 36 },
  ],
  // North America
  [
    { lon: -168, lat: 65 }, { lon: -140, lat: 70 }, { lon: -105, lat: 73 }, { lon: -88, lat: 74 },
    { lon: -70, lat: 68 }, { lon: -56, lat: 54 }, { lon: -60, lat: 47 }, { lon: -76, lat: 35 },
    { lon: -80, lat: 25 }, { lon: -97, lat: 16 }, { lon: -105, lat: 22 }, { lon: -112, lat: 32 },
    { lon: -124, lat: 38 }, { lon: -124, lat: 48 }, { lon: -135, lat: 57 }, { lon: -153, lat: 59 },
  ],
  // Greenland
  [
    { lon: -72, lat: 78 }, { lon: -60, lat: 82 }, { lon: -22, lat: 80 }, { lon: -22, lat: 70 },
    { lon: -44, lat: 60 }, { lon: -50, lat: 64 }, { lon: -68, lat: 70 },
  ],
  // South America
  [
    { lon: -81, lat: 2 }, { lon: -70, lat: 12 }, { lon: -60, lat: 8 }, { lon: -50, lat: 0 },
    { lon: -35, lat: -7 }, { lon: -40, lat: -22 }, { lon: -54, lat: -35 }, { lon: -68, lat: -56 },
    { lon: -76, lat: -50 }, { lon: -72, lat: -18 }, { lon: -81, lat: -5 },
  ],
  // Australia
  [
    { lon: 114, lat: -22 }, { lon: 114, lat: -34 }, { lon: 130, lat: -32 }, { lon: 148, lat: -38 },
    { lon: 153, lat: -28 }, { lon: 145, lat: -15 }, { lon: 136, lat: -12 }, { lon: 122, lat: -16 },
  ],
  // Antarctica
  [
    { lon: -180, lat: -72 }, { lon: -90, lat: -72 }, { lon: 0, lat: -72 }, { lon: 90, lat: -72 },
    { lon: 180, lat: -72 }, { lon: 180, lat: -90 }, { lon: -180, lat: -90 },
  ],
];

export type View = { lat: number; lon: number };

export type Proj = { x: number; y: number; z: number; front: boolean };

export function project(g: Geo, view: View, cx: number, cy: number, r: number): Proj {
  const lon = rad(g.lon - view.lon);
  const lat = rad(g.lat);
  const lat0 = rad(view.lat);
  const x = Math.cos(lat) * Math.sin(lon);
  const y = Math.cos(lat0) * Math.sin(lat) - Math.sin(lat0) * Math.cos(lat) * Math.cos(lon);
  const z = Math.sin(lat0) * Math.sin(lat) + Math.cos(lat0) * Math.cos(lat) * Math.cos(lon);
  return { x: cx + x * r, y: cy - y * r, z, front: z > 0 };
}

export function unproject(px: number, py: number, view: View, cx: number, cy: number, r: number): Geo | null {
  const x = (px - cx) / r;
  const y = (cy - py) / r;
  const rho = Math.hypot(x, y);
  if (rho > 1.001) return null;
  const c = Math.asin(Math.min(1, rho));
  const lat0 = rad(view.lat);
  const sinc = Math.sin(c);
  const cosc = Math.cos(c);
  const lat = Math.asin(clamp(cosc * Math.sin(lat0) + (rho === 0 ? 0 : (y * sinc * Math.cos(lat0)) / rho), -1, 1));
  const lon = rad(view.lon) + Math.atan2(x * sinc, rho * cosc * Math.cos(lat0) - y * sinc * Math.sin(lat0));
  return { lat: deg(lat), lon: ((deg(lon) + 180) % 360) - 180 };
}

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

/** Visible polylines of a geographic track. */
export function frontSpans(pts: Geo[], view: View, cx: number, cy: number, r: number): string[] {
  const proj = pts.map((p) => project(p, view, cx, cy, r));
  const spans: string[] = [];
  let buf: Proj[] = [];
  const flush = () => {
    if (buf.length < 2) {
      buf = [];
      return;
    }
    spans.push(buf.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" "));
    buf = [];
  };
  for (const p of proj) {
    if (p.front) buf.push(p);
    else flush();
  }
  flush();
  return spans;
}

export function hullPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 3) return "";
  const s = [...pts].sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: typeof pts = [];
  for (const p of s) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: typeof pts = [];
  for (let i = s.length - 1; i >= 0; i--) {
    const p = s[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  const h = lower.concat(upper);
  return h.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";
}

/** Front-facing day cap around a sub-point. */
export function dayCap(sub: Geo, view: View, cx: number, cy: number, r: number): string {
  const pts: { x: number; y: number }[] = [];
  const push = (g: Geo) => {
    const p = project(g, view, cx, cy, r);
    if (p.front) pts.push({ x: p.x, y: p.y });
  };
  for (const g of greatCircleFromPole(sub, 96)) push(g);
  for (const g of greatCircleFromPole(view, 72)) {
    if (angDist(g, sub) <= 90.5) push(g);
  }
  if (angDist(view, sub) <= 90) push(view);
  return hullPath(pts);
}

export function splitHorizon(pole: Geo, ra: number, gst: number): { ac: Geo[][]; dc: Geo[][] } {
  const ring = greatCircleFromPole(pole, 120);
  const ac: Geo[][] = [];
  const dc: Geo[][] = [];
  let cur: Geo[] = [];
  let kind: "ac" | "dc" | null = null;
  const flush = () => {
    if (cur.length >= 2 && kind) (kind === "ac" ? ac : dc).push(cur);
    cur = [];
  };
  for (const g of ring) {
    const k: "ac" | "dc" = hourAngle(g.lon, ra, gst) < 0 ? "ac" : "dc";
    if (k !== kind) {
      flush();
      kind = k;
    }
    cur.push(g);
  }
  flush();
  if (ac.length > 1 && ring.length > 1) {
    const first = hourAngle(ring[0].lon, ra, gst) < 0 ? "ac" : "dc";
    const last = hourAngle(ring[ring.length - 1].lon, ra, gst) < 0 ? "ac" : "dc";
    if (first === last && first === "ac" && ac.length >= 2) {
      const a = ac.pop()!;
      ac[0] = a.concat(ac[0]);
    } else if (first === last && first === "dc" && dc.length >= 2) {
      const a = dc.pop()!;
      dc[0] = a.concat(dc[0]);
    }
  }
  return { ac, dc };
}

export function sunBody() {
  return BODIES.find((b) => b.id === "sun")!;
}

export function yearFrac(days: number) {
  return ((days / TROPICAL_YEAR) % 1 + 1) % 1;
}

export function geoLonSun(days: number) {
  return geoLonOf(sunBody(), days) ?? 0;
}
