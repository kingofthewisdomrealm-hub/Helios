import type { AngleId } from "./astrocartography";
import type { BirthStamp } from "./birth";
import type { LineHit, PlaceScore } from "./bestPlaces";

/** What the named map tells a life to do at each lamp and angle. */
const SHOULD: Record<string, Record<AngleId, string>> = {
  sun: { mc: "be seen", ac: "begin", ic: "root yourself", dc: "meet the world" },
  moon: { mc: "feel in public", ac: "arrive", ic: "make a home", dc: "belong" },
  venus: { mc: "make beauty", ac: "fall in love", ic: "nest", dc: "partner" },
  jupiter: { mc: "grow a name", ac: "say yes", ic: "plant luck", dc: "find your people" },
  mercury: { mc: "speak", ac: "learn", ic: "write", dc: "trade" },
};

export function shouldDo(hit: LineHit) {
  return SHOULD[hit.planetId]?.[hit.angle] ?? "stand on that line";
}

export function dateSpoken(p: BirthStamp) {
  return `${p.day} ${p.month.name} ${p.year}`;
}

export function birthAdvice(place: string | null, stamp: BirthStamp, top: PlaceScore | null) {
  const when = dateSpoken(stamp);
  const where = place?.trim() || null;
  const born = where ? `If you were born in ${where} on ${when}` : `If you were born on ${when}`;
  if (!top) return `${born}, name the dirt you arrived on.`;
  return `${born}, you should ${shouldDo(top.nearest)} in ${top.name}.`;
}

export function goAdvice(p: PlaceScore) {
  return `You should ${shouldDo(p.nearest)} in ${p.name}.`;
}
