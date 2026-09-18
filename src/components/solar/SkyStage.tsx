import { BODIES } from "@/lib/solar/bodies";
import {
  CONSTELLATIONS,
  MONTH_CUTS,
  SIGNS,
  SKY_CUTS,
  chartBodies,
  monthAt,
  monthsFor,
  type ChartBody,
  type MonthWedge,
} from "@/lib/solar/astrology";
import {
  LO_SHU,
  NINE,
  NUMEN_CUTS,
  PLANET_NUMBER,
  REDUCTIONS,
  WEEK,
  dayRoot,
  nineAt,
  weekdayAt,
} from "@/lib/solar/numerology";
import { useSolar } from "@/lib/solar/store";

const CX = 200;
const CY = 200;

function polar(r: number, lon: number) {
  const a = (lon * Math.PI) / 180;
  return { x: CX + Math.cos(a) * r, y: CY - Math.sin(a) * r };
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

function ringSpan(r0: number, r1: number, start: number, end: number) {
  return wedge(r0, r1, start, end);
}

function normMid(start: number, span: number) {
  return ((start + span / 2) % 360 + 360) % 360;
}

function spanOf(m: MonthWedge) {
  let span = m.end - m.start;
  if (span < 0) span += 360;
  return span;
}

export function SkyStage() {
  const days = useSolar((s) => s.simDays);
  const cut = useSolar((s) => s.skyCut);
  const monthCut = useSolar((s) => s.monthCut);
  const numenCut = useSolar((s) => s.numenCut);
  const selectedId = useSolar((s) => s.selectedId);
  const setSelected = useSolar((s) => s.setSelected);
  const bodies = chartBodies(days);
  const selected = bodies.find((b) => b.id === selectedId) ?? bodies[0];
  const showSigns = cut === "tropical" || cut === "both";
  const showStars = cut === "stars" || cut === "both";
  const months = monthsFor(monthCut);
  const sun = bodies.find((b) => b.id === "sun");
  const currentMonth = sun ? monthAt(sun.lon, monthCut) : months[0];
  const currentNine = sun ? nineAt(sun.lon) : NINE[0];
  const root = dayRoot(days);

  const both = showStars && showSigns;
  const signR0 = both ? 82 : 88;
  const signR1 = both ? 108 : 120;
  const starR0 = showSigns ? 110 : 88;
  const starR1 = showSigns ? 128 : 120;
  const monthR0 = 132;
  const monthR1 = 154;
  const nineR0 = 160;
  const nineR1 = 184;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-2 pt-[4.25rem] pb-40 sm:pb-28">
      <NumenCrown />
      <svg
        viewBox="0 0 400 400"
        className="h-auto w-full max-w-[min(100%,48vh)] sm:max-w-[min(100%,56vh)]"
        role="img"
        aria-label="Geocentric wheel with months and numerology"
      >
        <circle cx={CX} cy={CY} r="192" fill="none" stroke="currentColor" className="text-border" strokeWidth="0.6" />

        {showStars &&
          CONSTELLATIONS.map((c, i) => (
            <path
              key={`st-${c.id}`}
              d={ringSpan(starR0, starR1, c.start, c.end)}
              fill={c.id === "ophiuchus" ? "rgba(201,137,124,0.22)" : i % 2 ? "rgba(232,230,225,0.06)" : "rgba(232,230,225,0.12)"}
              stroke="currentColor"
              className="text-border-strong"
              strokeWidth="0.4"
            />
          ))}

        {showSigns &&
          SIGNS.map((s, i) => (
            <path
              key={`sg-${s.id}`}
              d={ringSpan(signR0, signR1, s.start, s.start + 30)}
              fill={i % 2 ? "rgba(232,230,225,0.07)" : "rgba(232,230,225,0.14)"}
              stroke="currentColor"
              className="text-border-strong"
              strokeWidth="0.5"
            />
          ))}

        {months.map((m, i) => (
          <path
            key={`mo-${m.id}`}
            d={ringSpan(monthR0, monthR1, m.start, m.end)}
            fill={
              m.leftover
                ? "rgba(232,230,225,0.42)"
                : currentMonth.id === m.id
                  ? "rgba(232,230,225,0.22)"
                  : i % 2
                    ? "rgba(232,230,225,0.05)"
                    : "rgba(232,230,225,0.11)"
            }
            stroke="currentColor"
            className="text-border-strong"
            strokeWidth="0.5"
          />
        ))}

        {NINE.map((seat, i) => (
          <path
            key={`n-${seat.n}`}
            d={ringSpan(nineR0, nineR1, i * 40, i * 40 + 40)}
            fill={
              currentNine.n === seat.n
                ? "rgba(232,230,225,0.28)"
                : i % 2
                  ? "rgba(232,230,225,0.04)"
                  : "rgba(232,230,225,0.1)"
            }
            stroke={seat.color}
            strokeWidth={currentNine.n === seat.n ? 1.2 : 0.5}
          />
        ))}

        {showSigns &&
          SIGNS.map((s) => {
            const t = polar((signR0 + signR1) / 2, s.start + 15);
            return (
              <text
                key={`sl-${s.id}`}
                x={t.x}
                y={t.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="currentColor"
                className="text-muted"
                fontSize="7"
                fontFamily="IBM Plex Sans, sans-serif"
              >
                {s.ab}
              </text>
            );
          })}

        {showStars &&
          CONSTELLATIONS.map((c) => {
            let sp = c.end - c.start;
            if (sp < 0) sp += 360;
            const t = polar((starR0 + starR1) / 2, normMid(c.start, sp));
            return (
              <text
                key={`cl-${c.id}`}
                x={t.x}
                y={t.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="currentColor"
                className={c.id === "ophiuchus" ? "text-false" : "text-subtle"}
                fontSize={c.id === "ophiuchus" ? 6.5 : 5.5}
                fontFamily="IBM Plex Sans, sans-serif"
              >
                {c.id === "ophiuchus" ? "Oph" : c.name.slice(0, 3)}
              </text>
            );
          })}

        {months.map((m) => {
          const t = polar((monthR0 + monthR1) / 2, normMid(m.start, spanOf(m)));
          const numbered = m.nameNum !== null && (monthCut === "roman" || monthCut === "gregorian");
          return (
            <text
              key={`ml-${m.id}`}
              x={t.x}
              y={t.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="currentColor"
              className={m.leftover ? "text-fg" : numbered && (m.nameNum ?? 0) >= 7 ? "text-mix" : "text-subtle"}
              fontSize={m.leftover ? 7 : 6.5}
              fontFamily="IBM Plex Sans, sans-serif"
            >
              {numbered && monthCut === "roman" ? `${m.ab} ${m.nameNum}` : numbered && (m.nameNum ?? 0) >= 7 ? `${m.ab}${m.nameNum}` : m.ab}
            </text>
          );
        })}

        {NINE.map((seat, i) => {
          const t = polar((nineR0 + nineR1) / 2, i * 40 + 20);
          return (
            <text
              key={`nl-${seat.n}`}
              x={t.x}
              y={t.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={seat.color}
              fontSize="9"
              fontFamily="Cormorant Garamond, serif"
              fontWeight="600"
            >
              {seat.n}
            </text>
          );
        })}

        <circle cx={CX} cy={CY} r="78" fill="none" stroke="currentColor" className="text-border" strokeWidth="0.5" strokeDasharray="2 3" />

        {selected && <SightLine body={selected} />}

        {bodies.map((b) => (
          <PlanetDot
            key={b.id}
            body={b}
            active={b.id === selected?.id}
            onSelect={() => setSelected(b.id)}
          />
        ))}

        <circle cx={CX} cy={CY} r="8" fill="#6f93c4" />
        <circle cx={CX} cy={CY} r="8" fill="none" stroke="currentColor" className="text-fg" strokeWidth="0.6" />
        <text x={CX} y={CY + 20} textAnchor="middle" fill="currentColor" className="text-muted" fontSize="6.5">
          Earth
        </text>
        <text x={CX + 194} y={CY + 3} textAnchor="start" fill="currentColor" className="text-subtle" fontSize="5.5">
          equinox
        </text>
        <text x={CX} y={CY - 190} textAnchor="middle" fill="currentColor" className="text-subtle" fontSize="5.5">
          solstice
        </text>
        {numenCut === "nine" && (
          <text x={CX} y={CY + 196} textAnchor="middle" fill="currentColor" className="text-subtle" fontSize="5.5">
            day {root.doy} → {root.root}
          </text>
        )}
      </svg>
    </div>
  );
}

function NumenCrown() {
  const days = useSolar((s) => s.simDays);
  const numenCut = useSolar((s) => s.numenCut);
  const setNumenCut = useSolar((s) => s.setNumenCut);
  const selectedId = useSolar((s) => s.selectedId);
  const setSelected = useSolar((s) => s.setSelected);
  const sun = chartBodies(days).find((b) => b.id === "sun")!;
  const seat = nineAt(sun.lon);
  const week = weekdayAt(days);
  const root = dayRoot(days);

  return (
    <div className="pointer-events-auto z-20 mb-1 w-full max-w-[min(100%,34rem)] px-1">
      {numenCut === "nine" && (
        <div className="flex items-end justify-center gap-[3px] sm:gap-1">
          {NINE.map((n) => {
            const on = n.n === seat.n || n.n === root.root || n.id === selectedId;
            return (
              <button
                key={n.n}
                type="button"
                onClick={() => {
                  if (n.id === "rahu" || n.id === "ketu") setNumenCut("nine");
                  else setSelected(n.id);
                }}
                className={`flex h-11 w-[10.2%] min-w-0 flex-col items-center justify-center rounded-md border ${
                  on ? "border-fg bg-fg text-bg" : "border-border bg-bg-elevated/90 text-muted"
                }`}
                aria-label={`${n.n} ${n.planet}`}
              >
                <span className="font-display text-[1.35rem] leading-none">{n.n}</span>
                <span className="mt-0.5 hidden text-[8px] uppercase tracking-wide sm:block" style={{ color: on ? undefined : n.color }}>
                  {n.planet.slice(0, 3)}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {numenCut === "week" && (
        <div className="flex items-end justify-center gap-1">
          {WEEK.map((d) => {
            const on = d.id === week.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelected(d.id)}
                className={`flex h-11 flex-1 flex-col items-center justify-center rounded-md border ${
                  on ? "border-fg bg-fg text-bg" : "border-border bg-bg-elevated/90 text-muted"
                }`}
              >
                <span className="font-display text-lg leading-none">{d.n}</span>
                <span className="text-[9px] uppercase tracking-wide">{d.ab}</span>
              </button>
            );
          })}
        </div>
      )}
      {numenCut === "square" && (
        <div className="mx-auto grid w-[9.5rem] grid-cols-3 gap-1">
          {LO_SHU.flatMap((row, r) =>
            row.map((n, c) => {
              const cell = NINE[n - 1];
              const on = cell.n === seat.n || cell.n === root.root;
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => {
                    if (cell.id !== "rahu" && cell.id !== "ketu") setSelected(cell.id);
                  }}
                  className={`flex size-11 flex-col items-center justify-center rounded-md border ${
                    on ? "border-fg bg-fg text-bg" : "border-border bg-bg-elevated/90"
                  }`}
                  style={{ color: on ? undefined : cell.color }}
                >
                  <span className="font-display text-xl leading-none">{n}</span>
                </button>
              );
            }),
          )}
        </div>
      )}
      <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[10px] tabular-nums text-subtle">
        {REDUCTIONS.map((r) => (
          <span key={r.raw}>
            {r.raw}→<span className={r.root === root.root ? "text-fg" : "text-muted"}>{r.root}</span>
          </span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-3 gap-1">
        {NUMEN_CUTS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setNumenCut(c.id)}
            className={`rounded-sm px-2 py-1.5 text-[10px] leading-tight ${
              numenCut === c.id ? "bg-accent text-accent-fg" : "bg-bg-elevated/90 text-muted hover:text-fg"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SightLine({ body }: { body: ChartBody }) {
  const b = polar(190, body.lon);
  return (
    <g>
      <line x1={CX} y1={CY} x2={b.x} y2={b.y} stroke="currentColor" className="text-accent" strokeWidth="0.7" strokeDasharray="3 3" />
    </g>
  );
}

function PlanetDot({
  body,
  active,
  onSelect,
}: {
  body: ChartBody;
  active: boolean;
  onSelect: () => void;
}) {
  const rings: Record<string, number> = {
    moon: 24,
    sun: 40,
    mercury: 50,
    venus: 58,
    mars: 66,
    jupiter: 73,
    saturn: 66,
    uranus: 58,
    neptune: 50,
    pluto: 73,
  };
  const r = rings[body.id] ?? 64;
  const p = polar(r, body.lon);
  const named = active || body.id === "sun" || body.id === "moon";
  const label = polar(r + (p.y < CY ? 11 : -11), body.lon);
  const size = body.id === "sun" ? 6.4 : body.id === "moon" ? 3.8 : 3.3;
  const num = PLANET_NUMBER[body.id];
  return (
    <g className="cursor-pointer" onClick={onSelect} role="button" tabIndex={0}>
      <circle cx={p.x} cy={p.y} r="10" fill="transparent" />
      {body.id === "sun" && <circle cx={p.x} cy={p.y} r="11" fill="rgba(242,230,196,0.2)" />}
      <circle
        cx={p.x}
        cy={p.y}
        r={active ? size + 1.1 : size}
        fill={body.color}
        stroke={active ? "#e8e6e1" : "rgba(7,8,12,0.55)"}
        strokeWidth={active ? 1.3 : 0.6}
      />
      {num && (
        <text
          x={p.x}
          y={p.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#07080c"
          fontSize={body.id === "sun" ? 6 : 5}
          fontFamily="IBM Plex Sans, sans-serif"
          fontWeight="600"
        >
          {num}
        </text>
      )}
      {named && (
        <text
          x={label.x}
          y={label.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="currentColor"
          className={active ? "text-fg" : "text-subtle"}
          fontSize="6.5"
          fontFamily="IBM Plex Sans, sans-serif"
        >
          {body.name}
          {body.rx ? " Rx" : ""}
        </text>
      )}
    </g>
  );
}

export function SkyReadout() {
  const days = useSolar((s) => s.simDays);
  const cut = useSolar((s) => s.skyCut);
  const setCut = useSolar((s) => s.setSkyCut);
  const monthCut = useSolar((s) => s.monthCut);
  const setMonthCut = useSolar((s) => s.setMonthCut);
  const numenCut = useSolar((s) => s.numenCut);
  const selectedId = useSolar((s) => s.selectedId);
  const bodies = chartBodies(days);
  const selected = bodies.find((b) => b.id === selectedId) ?? bodies.find((b) => b.id === "sun")!;
  const copy = SKY_CUTS.find((c) => c.id === cut)!;
  const monthCopy = MONTH_CUTS.find((c) => c.id === monthCut)!;
  const numenCopy = NUMEN_CUTS.find((c) => c.id === numenCut)!;
  const earth = BODIES.find((b) => b.id === "earth")!;
  const month = monthAt(selected.lon, monthCut);
  const seat = nineAt(selected.lon);
  const num = PLANET_NUMBER[selected.id];
  const root = dayRoot(days);
  const week = weekdayAt(days);

  return (
    <article className="rounded-lg border border-border bg-bg-elevated/92 p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">From Earth</p>
      <h2 className="font-display text-2xl leading-tight">
        {selected.name}{" "}
        <span className="text-muted">
          {num ? `${num}` : ""}
          {num ? " · " : ""}
          {cut === "stars" ? selected.constellation.name : selected.sign.name}
        </span>
      </h2>
      <p className="text-sm leading-snug text-muted">
        {month.leftover ? "in the leftover day" : `in ${month.name}`}
        {month.nameNum !== null && monthCut === "roman" ? ` — the ${ordinal(month.nameNum)}` : ""}
        {" · "}seat {seat.n}
      </p>
      {numenCut === "nine" && (
        <p className="mt-2 text-[11px] leading-snug text-mix">{numenCopy.line}</p>
      )}
      {numenCut === "week" && (
        <p className="mt-2 text-[11px] leading-snug text-mix">
          {week.name} wears {week.n}. {numenCopy.line}
        </p>
      )}
      {numenCut === "square" && (
        <p className="mt-2 text-[11px] leading-snug text-mix">{numenCopy.line} 4+9+2=15. Center is 5, the year.</p>
      )}
      {selected.rx && (
        <p className="mt-2 text-[11px] leading-snug text-false">
          Retrograde: Earth is lapping {selected.name}. The wallpaper slides backward.
        </p>
      )}
      {cut === "both" && selected.id === "sun" && selected.sign.name !== selected.constellation.name && (
        <p className="mt-2 hidden text-[11px] leading-snug text-false sm:block">
          Horoscope says {selected.sign.name}. The Sun is in front of {selected.constellation.name}.
        </p>
      )}
      {monthCut === "roman" && (
        <p className="mt-2 hidden text-[11px] leading-snug text-muted sm:block">{monthCopy.line}</p>
      )}
      {cut === "tropical" && numenCut === "nine" && (
        <p className="mt-2 hidden text-[11px] leading-snug text-subtle sm:block">
          {earth.name} in the middle. Outer ring is 9 × 40°. Day {root.doy} reduces to {root.root} in base ten.
        </p>
      )}
      <dl className="mt-3 grid grid-cols-3 gap-x-3 gap-y-1 text-[11px]">
        <Stat label="Sign" value={`${selected.sign.ab} ${selected.lon.toFixed(0)}°`} />
        <Stat label="Month" value={month.leftover ? "leftover" : month.ab} />
        <Stat label="Digit" value={String(num ?? seat.n)} />
      </dl>
      <div className="mt-3 grid grid-cols-3 gap-1">
        {SKY_CUTS.map((c) => (
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
      <div className="mt-1 grid grid-cols-3 gap-1">
        {MONTH_CUTS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setMonthCut(c.id)}
            className={`rounded-sm px-2 py-2 text-left text-[11px] leading-tight ${
              monthCut === c.id ? "bg-accent text-accent-fg" : "bg-bg-subtle text-muted hover:text-fg"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
      <p className="mt-2 hidden text-[10px] leading-snug text-subtle sm:block">{copy.line}</p>
    </article>
  );
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-subtle">{label}</dt>
      <dd className="font-medium tabular-nums text-fg">{value}</dd>
    </div>
  );
}
