import { useCallback, useEffect, useRef, useState } from "react";
import { BirthCrown } from "./BirthCrown";
import { useSolar } from "@/lib/solar/store";
import {
  ANGLE_WORDS,
  GROUND_CUTS,
  LAND,
  angDist,
  dayCap,
  frontSpans,
  gstOf,
  localWord,
  meridian,
  planetsOnEarth,
  project,
  splitHorizon,
  unproject,
  type Geo,
  type PlanetOnEarth,
  type View,
} from "@/lib/solar/astrocartography";
import { MONTHS, doyToLon, lonToDoy, localStamp, partsOf, stampLine, withDoy } from "@/lib/solar/birth";
import { rankPlaces } from "@/lib/solar/bestPlaces";
import { birthAdvice } from "@/lib/solar/advice";
import { ChartDesk } from "./ChartDesk";

const CX = 220;
const CY = 220;
const R = 124;
const RING0 = 138;
const RING1 = 158;
const TICK0 = 158;
const TICK1 = 168;
const LABEL_R = 182;
const VB = 440;

function polar(r: number, lon: number) {
  const a = (lon * Math.PI) / 180;
  return { x: CX + Math.cos(a) * r, y: CY - Math.sin(a) * r };
}

function lonFromSvg(sx: number, sy: number) {
  return ((Math.atan2(CY - sy, sx - CX) * 180) / Math.PI + 360) % 360;
}

function wedge(r0: number, r1: number, a0: number, a1: number) {
  let span = a1 - a0;
  while (span < 0) span += 360;
  while (span >= 360) span -= 360;
  const p0 = polar(r1, a0);
  const p1 = polar(r1, a1);
  const p2 = polar(r0, a1);
  const p3 = polar(r0, a0);
  const large = span > 180 ? 1 : 0;
  return `M ${p0.x} ${p0.y} A ${r1} ${r1} 0 ${large} 0 ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${r0} ${r0} 0 ${large} 1 ${p3.x} ${p3.y} Z`;
}

function YearCircle({ doy }: { doy: number }) {
  const birthLon = doyToLon(doy + 0.5);
  const bead = polar((TICK0 + TICK1) / 2, birthLon);
  return (
    <g>
      <circle cx={CX} cy={CY} r={RING0 - 2} fill="none" stroke="currentColor" className="text-border" strokeWidth="0.5" />
      {MONTHS.map((m, i) => {
        const start = doyToLon(m.start);
        const end = doyToLon(m.start + m.days);
        const mid = doyToLon(m.start + m.days / 2);
        const lab = polar(LABEL_R, mid);
        const on = doy >= m.start && doy < m.start + m.days;
        return (
          <g key={m.ab}>
            <path
              d={wedge(RING0, RING1, start, end)}
              fill={on ? "rgba(242,230,196,0.22)" : i % 2 ? "rgba(232,230,225,0.05)" : "rgba(232,230,225,0.12)"}
              stroke="currentColor"
              className="text-border-strong"
              strokeWidth="0.4"
            />
            <text
              x={lab.x}
              y={lab.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="currentColor"
              className={on ? "text-fg" : "text-subtle"}
              fontSize="7"
              fontFamily="IBM Plex Sans, sans-serif"
            >
              {m.ab}
            </text>
          </g>
        );
      })}
      {Array.from({ length: 365 }, (_, i) => {
        const d = i + 1;
        const lon = doyToLon(d + 0.5);
        const major = d % 5 === 0;
        const a = polar(TICK0, lon);
        const b = polar(d === doy ? TICK1 + 3 : major ? TICK1 : TICK1 - 4, lon);
        return (
          <line
            key={d}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={d === doy ? "#f2e6c4" : "currentColor"}
            className={d === doy ? "" : major ? "text-muted" : "text-subtle"}
            strokeWidth={d === doy ? 1.7 : major ? 0.7 : 0.35}
          />
        );
      })}
      {[0, 90, 180, 270].map((lon) => {
        const a = polar(RING0, lon);
        const b = polar(TICK1 + 2, lon);
        return (
          <line
            key={lon}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="currentColor"
            className="text-fg/70"
            strokeWidth="1.1"
          />
        );
      })}
      <circle cx={bead.x} cy={bead.y} r="4.2" fill="#f2e6c4" />
      <text x={CX} y={CY + LABEL_R + 16} textAnchor="middle" fill="currentColor" className="text-subtle" fontSize="7.5">
        365 days · equinox at the right
      </text>
    </g>
  );
}

function Grid({ view }: { view: View }) {
  const lons = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];
  const lats = [-60, -30, 0, 30, 60];
  return (
    <g className="text-border" stroke="currentColor" fill="none" strokeWidth="0.4">
      {lons.map((lon) =>
        frontSpans(meridian(lon, 48), view, CX, CY, R).map((d, i) => (
          <path key={`v${lon}-${i}`} d={d} />
        )),
      )}
      {lats.map((lat) => {
        const ring: Geo[] = [];
        for (let i = 0; i <= 72; i++) ring.push({ lat, lon: -180 + (360 * i) / 72 });
        return frontSpans(ring, view, CX, CY, R).map((d, i) => <path key={`h${lat}-${i}`} d={d} />);
      })}
    </g>
  );
}

function Land({ view }: { view: View }) {
  return (
    <g>
      {LAND.map((ring, i) => {
        const closed = ring.concat(ring[0]);
        return frontSpans(closed, view, CX, CY, R).map((d, j) => (
          <path
            key={`${i}-${j}`}
            d={d}
            fill="none"
            stroke="currentColor"
            className="text-fg/55"
            strokeWidth="0.7"
          />
        ));
      })}
    </g>
  );
}

function LineTrack({
  pts,
  view,
  color,
  dashed,
  width = 1.6,
}: {
  pts: Geo[];
  view: View;
  color: string;
  dashed?: boolean;
  width?: number;
}) {
  return (
    <>
      {frontSpans(pts, view, CX, CY, R).map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeDasharray={dashed ? "4 3" : undefined}
          strokeLinecap="round"
        />
      ))}
    </>
  );
}

function FourLines({ planet, days, view }: { planet: PlanetOnEarth; days: number; view: View }) {
  const gst = gstOf(days);
  const { ac, dc } = splitHorizon(planet.sub, planet.ra, gst);
  const mc = meridian(planet.sub.lon, 64);
  const ic = meridian(planet.sub.lon + 180, 64);
  return (
    <g>
      <LineTrack pts={ic} view={view} color={planet.color} dashed width={1.4} />
      {dc.map((pts, i) => (
        <LineTrack key={`dc${i}`} pts={pts} view={view} color={planet.color} dashed width={1.8} />
      ))}
      {ac.map((pts, i) => (
        <LineTrack key={`ac${i}`} pts={pts} view={view} color={planet.color} width={2.2} />
      ))}
      <LineTrack pts={mc} view={view} color={planet.color} width={2.8} />
    </g>
  );
}

function LabelAt({
  geo,
  view,
  text,
  color,
}: {
  geo: Geo;
  view: View;
  text: string;
  color: string;
}) {
  const p = project(geo, view, CX, CY, R);
  if (!p.front) return null;
  return (
    <text
      x={p.x}
      y={p.y - 8}
      textAnchor="middle"
      fill={color}
      fontSize="8"
      fontFamily="IBM Plex Sans, sans-serif"
    >
      {text}
    </text>
  );
}

export function GroundStage() {
  const days = useSolar((s) => s.simDays);
  const cut = useSolar((s) => s.groundCut);
  const selectedId = useSolar((s) => s.selectedId);
  const pin = useSolar((s) => s.pin);
  const setPin = useSolar((s) => s.setPin);
  const lookAt = useSolar((s) => s.lookAt);
  const lookNonce = useSolar((s) => s.lookNonce);
  const placeName = useSolar((s) => s.placeName);
  const setSimDays = useSolar((s) => s.setSimDays);
  const setPaused = useSolar((s) => s.setPaused);
  const planets = planetsOnEarth(days);
  const selected = planets.find((p) => p.id === selectedId) ?? planets[0];
  const birth = partsOf(days);
  const [view, setView] = useState<View>({ lat: 18, lon: selected.sub.lon });
  const drag = useRef<{
    kind: "globe" | "year";
    x: number;
    y: number;
    lat: number;
    lon: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    if (!lookAt) return;
    setView({ lat: Math.min(70, Math.max(-70, lookAt.lat)), lon: lookAt.lon });
  }, [lookNonce, lookAt]);

  const setDoyAt = useCallback(
    (sx: number, sy: number) => {
      setPaused(true);
      setSimDays(withDoy(useSolar.getState().simDays, lonToDoy(lonFromSvg(sx, sy))));
    },
    [setPaused, setSimDays],
  );

  const svgPt = (e: React.PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    return {
      sx: ((e.clientX - box.left) / box.width) * VB,
      sy: ((e.clientY - box.top) / box.height) * VB,
    };
  };

  const onDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      const { sx, sy } = svgPt(e);
      const rho = Math.hypot(sx - CX, sy - CY);
      if (rho >= RING0 - 4 && rho <= LABEL_R + 12) {
        drag.current = { kind: "year", x: e.clientX, y: e.clientY, lat: view.lat, lon: view.lon, moved: false };
        setDoyAt(sx, sy);
        return;
      }
      drag.current = { kind: "globe", x: e.clientX, y: e.clientY, lat: view.lat, lon: view.lon, moved: false };
    },
    [setDoyAt, view],
  );

  const onMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const d = drag.current;
      if (!d) return;
      if (d.kind === "year") {
        d.moved = true;
        const { sx, sy } = svgPt(e);
        setDoyAt(sx, sy);
        return;
      }
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (Math.hypot(dx, dy) > 4) d.moved = true;
      if (!d.moved) return;
      setView({
        lat: Math.min(80, Math.max(-80, d.lat + dy * 0.35)),
        lon: ((d.lon - dx * 0.4 + 180) % 360) - 180,
      });
    },
    [setDoyAt],
  );

  const onUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const d = drag.current;
      drag.current = null;
      if (!d || d.moved || d.kind === "year") return;
      const { sx, sy } = svgPt(e);
      const g = unproject(sx, sy, view, CX, CY, R);
      if (g) setPin(g);
    },
    [setPin, view],
  );

  const sun = planets.find((p) => p.id === "sun")!;
  const drawn = cut === "day" ? sun : selected;
  const dayFill = cut === "day" ? dayCap(sun.sub, view, CX, CY, R) : "";
  const lamp = project(drawn.sub, view, CX, CY, R);
  const anti: Geo = { lat: -drawn.sub.lat, lon: ((drawn.sub.lon + 360) % 360) - 180 };
  const ranked = cut === "places" ? rankPlaces(days).slice(0, 16) : [];
  const topScore = ranked[0]?.score ?? 1;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-2 pt-[4.25rem] pb-40 sm:pb-28">
      <BirthCrown />
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        className="h-auto w-full max-w-[min(100%,46vh)] touch-none sm:max-w-[min(100%,54vh)]"
        role="img"
        aria-label="Earth with 365-day birth ring"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <YearCircle doy={birth.doy} />
        <circle cx={CX} cy={CY} r={R + 4} fill="none" stroke="currentColor" className="text-border" strokeWidth="0.5" />
        <circle cx={CX} cy={CY} r={R} fill="#121820" />
        {dayFill && <path d={dayFill} fill="rgba(242,230,196,0.32)" />}
        <Grid view={view} />
        <Land view={view} />

        {cut === "poster" &&
          planets.map((p) => (
            <LineTrack
              key={p.id}
              pts={meridian(p.sub.lon, 64)}
              view={view}
              color={p.color}
              width={p.id === selected.id ? 2.6 : 1.35}
            />
          ))}
        {cut === "places" &&
          planets
            .filter((p) => p.id === "sun" || p.id === "jupiter" || p.id === "venus" || p.id === "moon")
            .map((p) => (
              <LineTrack
                key={p.id}
                pts={meridian(p.sub.lon, 48)}
                view={view}
                color={p.color}
                width={p.id === "jupiter" ? 1.8 : 1}
              />
            ))}
        {(cut === "four" || cut === "day") && <FourLines planet={drawn} days={days} view={view} />}

        {(cut === "four" || cut === "day") && (
          <>
            <LabelAt geo={drawn.sub} view={view} text="overhead" color={drawn.color} />
            <LabelAt geo={anti} view={view} text="underfoot" color={drawn.color} />
          </>
        )}

        {lamp.front && (
          <g>
            <circle cx={lamp.x} cy={lamp.y} r={drawn.id === "sun" ? 5 : 3.6} fill={drawn.color} />
            <circle
              cx={lamp.x}
              cy={lamp.y}
              r={drawn.id === "sun" ? 9 : 7}
              fill="none"
              stroke={drawn.color}
              strokeWidth="1.1"
            />
          </g>
        )}

        {cut === "places" &&
          ranked.map((c, i) => {
            const p = project({ lat: c.lat, lon: c.lon }, view, CX, CY, R);
            if (!p.front) return null;
            const r = 2.2 + (c.score / topScore) * 5;
            return (
              <g key={`${c.name}-${c.lat}`}>
                <circle cx={p.x} cy={p.y} r={r} fill={c.nearest.color} opacity={i < 8 ? 0.95 : 0.45} />
                {i < 6 && (
                  <text
                    x={p.x}
                    y={p.y - r - 3}
                    textAnchor="middle"
                    fill={c.nearest.color}
                    fontSize="7"
                    fontFamily="IBM Plex Sans, sans-serif"
                  >
                    {c.name}
                  </text>
                )}
              </g>
            );
          })}

        {pin &&
          (() => {
            const p = project(pin, view, CX, CY, R);
            if (!p.front) return null;
            return (
              <g>
                <circle cx={p.x} cy={p.y} r="5" fill="#e8e6e1" />
                <circle cx={p.x} cy={p.y} r="9" fill="none" stroke="#e8e6e1" strokeWidth="0.8" />
                {placeName && (
                  <text
                    x={p.x}
                    y={p.y + 16}
                    textAnchor="middle"
                    fill="#e8e6e1"
                    fontSize="8"
                    fontFamily="IBM Plex Sans, sans-serif"
                  >
                    {placeName}
                  </text>
                )}
              </g>
            );
          })()}
      </svg>
    </div>
  );
}

export function GroundReadout() {
  const days = useSolar((s) => s.simDays);
  const cut = useSolar((s) => s.groundCut);
  const setCut = useSolar((s) => s.setGroundCut);
  const selectedId = useSolar((s) => s.selectedId);
  const pin = useSolar((s) => s.pin);
  const placeName = useSolar((s) => s.placeName);
  const planets = planetsOnEarth(days);
  const selected = planets.find((p) => p.id === selectedId) ?? planets[0];
  const copy = GROUND_CUTS.find((c) => c.id === cut)!;
  const gst = gstOf(days);
  const sun = planets.find((p) => p.id === "sun")!;
  const planet = cut === "day" ? sun : selected;
  const here = pin ? localWord(pin, planet, gst) : null;
  const dayHere = pin ? angDist(pin, sun.sub) < 90 : null;
  const birth = partsOf(days);
  const stamp = pin ? localStamp(birth, pin.lon) : birth;
  const ranked = rankPlaces(days);
  const advice = birthAdvice(placeName, stamp, ranked[0] ?? null);

  return (
    <article className="rounded-lg border border-border bg-bg-elevated/92 p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">
        {cut === "places" ? "If you were born" : "A birth second"}
      </p>
      <h2 className="font-display text-2xl leading-tight">
        {cut === "places" ? advice : stampLine(stamp)}
      </h2>
      {cut !== "places" && (
        <p className="text-sm leading-snug text-muted">
          {placeName ? placeName : pin ? `${fmtLat(pin.lat)} ${fmtLon(pin.lon)}` : "Name a place"}
        </p>
      )}
      {cut !== "places" && (
        <p className="text-[11px] leading-snug text-subtle">
          {planet.name} · {cut === "poster" ? "every meridian" : "four lines"}
        </p>
      )}
      {cut !== "places" && (
        <p className="mt-1 hidden text-[11px] leading-snug text-muted sm:block">{copy.line}</p>
      )}
      {cut === "day" && (
        <p className="mt-2 text-[11px] leading-snug text-true">
          Dawn is the Sun’s rising line. Night is the Sun underfoot. Measured, every day.
        </p>
      )}
      {cut === "four" && Math.abs(planet.dec) < 10 && (
        <p className="mt-2 hidden text-[11px] leading-snug text-muted sm:block">
          Near the equinox the rising line is almost a meridian. Pause, then wait for solstice — the rim tilts.
        </p>
      )}
      {cut === "four" && Math.abs(planet.dec) >= 10 && (
        <p className="mt-2 hidden text-[11px] leading-snug text-muted sm:block">
          Solid is overhead and rising. Dash is underfoot and setting. Pause to freeze a birth second.
        </p>
      )}
      {cut === "poster" && (
        <p className="mt-2 hidden text-[11px] leading-snug text-mix sm:block">
          The geometry is real. Calling a meridian “your Jupiter line” is a name laid on it.
        </p>
      )}
      {cut === "places" && (
        <p className="mt-2 text-[11px] leading-snug text-mix">
          {placeName ? `${placeName} · ${stampLine(stamp)}` : stampLine(stamp)}
        </p>
      )}
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        <Stat label="Overhead" value={`${fmtLat(planet.sub.lat)} ${fmtLon(planet.sub.lon)}`} />
        <Stat label="Dec" value={`${planet.dec >= 0 ? "+" : ""}${planet.dec.toFixed(0)}°`} />
      </dl>
      {here && pin ? (
        <p className="mt-2 text-[11px] leading-snug text-fg">
          Here {fmtLat(pin.lat)} {fmtLon(pin.lon)}: {planet.name} is{" "}
          <span className="text-true">{here.word}</span>
          {planet.id === "sun" ? `. ${dayHere ? "Day." : "Night."}` : `. ${here.detail}`}
        </p>
      ) : (
        <p className="mt-2 text-[11px] leading-snug text-subtle">Tap the globe to stand somewhere.</p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-1">
        {GROUND_CUTS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCut(c.id)}
            className={`rounded-sm px-2 py-2 text-left text-[11px] leading-tight ${
              cut === c.id ? "bg-accent text-accent-fg" : "bg-bg-subtle text-muted hover:text-fg"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      {cut === "places" && <ChartDesk ranked={ranked} />}
      {cut !== "places" && (
        <ul className="mt-2 hidden grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-subtle sm:grid">
          {ANGLE_WORDS.map((a) => (
            <li key={a.id}>
              <span className="text-muted">{a.name}</span> {a.ab}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-subtle">{label}</dt>
      <dd className="font-medium tabular-nums text-fg">{value}</dd>
    </div>
  );
}

function fmtLat(lat: number) {
  return `${Math.abs(lat).toFixed(0)}°${lat >= 0 ? "N" : "S"}`;
}
function fmtLon(lon: number) {
  const L = ((lon + 180) % 360) - 180;
  return `${Math.abs(L).toFixed(0)}°${L >= 0 ? "E" : "W"}`;
}
