import { ANGLE_WORDS, angDist, hourAngle, gstOf, planetsOnEarth, type AngleId, type Geo } from "./astrocartography";
import { PLACES, type Place } from "./places";

/** Named weights. Not a cause. Jupiter and the Sun are the usual “best” story. */
const WEIGHT: Record<string, Record<AngleId, number>> = {
  sun: { mc: 5, ac: 4, ic: 2, dc: 2 },
  moon: { mc: 2, ac: 3, ic: 5, dc: 2 },
  venus: { mc: 3, ac: 4, ic: 2, dc: 3 },
  jupiter: { mc: 5, ac: 5, ic: 3, dc: 2 },
  mercury: { mc: 2, ac: 2, ic: 1, dc: 1 },
};

const ORB = 10;

export type LineHit = {
  planetId: string;
  planet: string;
  color: string;
  angle: AngleId;
  angleName: string;
  dist: number;
  weight: number;
};

export type PlaceScore = {
  name: string;
  region: string;
  lat: number;
  lon: number;
  score: number;
  nearest: LineHit;
  hits: LineHit[];
};

function merDist(city: Geo, merLon: number) {
  let d = Math.abs(((city.lon - merLon + 540) % 360) - 180);
  const s = Math.abs(Math.sin((d * Math.PI) / 180) * Math.cos((city.lat * Math.PI) / 180));
  return (Math.asin(Math.min(1, s)) * 180) / Math.PI;
}

function closeness(dist: number) {
  if (dist >= ORB) return 0;
  const t = 1 - dist / ORB;
  return t * t;
}

export function rankPlaces(days: number, pool: Place[] = PLACES): PlaceScore[] {
  const planets = planetsOnEarth(days);
  const gst = gstOf(days);
  const scored: PlaceScore[] = [];

  for (const place of pool) {
    const city: Geo = { lat: place.lat, lon: place.lon };
    const hits: LineHit[] = [];
    for (const p of planets) {
      const w = WEIGHT[p.id];
      if (!w) continue;
      const mc = merDist(city, p.sub.lon);
      const ic = merDist(city, p.sub.lon + 180);
      const hz = Math.abs(angDist(city, p.sub) - 90);
      const h = hourAngle(city.lon, p.ra, gst);
      const candidates: { angle: AngleId; dist: number }[] = [
        { angle: "mc", dist: mc },
        { angle: "ic", dist: ic },
        { angle: h < 0 ? "ac" : "dc", dist: hz },
      ];
      for (const c of candidates) {
        const weight = w[c.angle];
        if (!weight || c.dist >= ORB) continue;
        hits.push({
          planetId: p.id,
          planet: p.name,
          color: p.color,
          angle: c.angle,
          angleName: ANGLE_WORDS.find((a) => a.id === c.angle)?.name ?? c.angle,
          dist: c.dist,
          weight,
        });
      }
    }
    if (!hits.length) continue;
    hits.sort((a, b) => a.dist - b.dist);
    const score = hits.reduce((s, h) => s + h.weight * closeness(h.dist), 0);
    scored.push({
      name: place.name,
      region: place.region,
      lat: place.lat,
      lon: place.lon,
      score,
      nearest: hits[0],
      hits,
    });
  }

  scored.sort((a, b) => b.score - a.score || a.nearest.dist - b.nearest.dist);
  return scored;
}

export function whyLine(p: PlaceScore) {
  const n = p.nearest;
  return `${n.planet} ${n.angleName.toLowerCase()} · ${n.dist.toFixed(0)}°`;
}
