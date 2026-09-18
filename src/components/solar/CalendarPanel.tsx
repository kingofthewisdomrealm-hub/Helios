import type { ReactNode } from "react";
import { SYNODIC_MONTH, TROPICAL_YEAR } from "@/lib/solar/bodies";
import { useSolar, type CalendarCut } from "@/lib/solar/store";

const CUTS: { id: CalendarCut; label: string; line: string }[] = [
  { id: "nature", label: "Nature", line: "Equinoxes, solstices, 12.37 moons" },
  { id: "gregorian", label: "Gregorian", line: "12 uneven months, January start" },
  { id: "fixed13", label: "Thirteen", line: "13 × 28 = 364, leftover day" },
  { id: "roman", label: "Roman", line: "Ten months, year begins at March" },
];

const GREG_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const GREG_NAMES = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const ROMAN = ["Mar", "Apr", "May", "Jun", "Qui", "Sex", "Sep", "Oct", "Nov", "Dec"];

function polar(cx: number, cy: number, r: number, a: number) {
  return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
}

function wedgePath(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) {
  const p0 = polar(cx, cy, r1, a0);
  const p1 = polar(cx, cy, r1, a1);
  const p2 = polar(cx, cy, r0, a1);
  const p3 = polar(cx, cy, r0, a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${p0.x} ${p0.y} A ${r1} ${r1} 0 ${large} 1 ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${r0} ${r0} 0 ${large} 0 ${p3.x} ${p3.y} Z`;
}

export function CalendarPanel() {
  const cut = useSolar((s) => s.calendarCut);
  const setCut = useSolar((s) => s.setCalendarCut);
  const days = useSolar((s) => s.simDays);
  const frac = ((days % TROPICAL_YEAR) + TROPICAL_YEAR) % TROPICAL_YEAR / TROPICAL_YEAR;
  const moonFrac = ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH / SYNODIC_MONTH;

  const cx = 110;
  const cy = 110;
  const start = -Math.PI / 2;

  return (
    <div className="pointer-events-auto flex w-full flex-col gap-3 rounded-xl border border-border bg-bg-elevated/90 p-3 sm:w-[240px]">
      <p className="font-display text-lg leading-tight text-fg">Cuts of the year</p>
      <p className="text-xs leading-snug text-muted">Same orbit. Different knives. The Sun does not cut.</p>
      <svg viewBox="0 0 220 220" className="mx-auto h-[180px] w-[180px]" aria-hidden>
        <circle cx={cx} cy={cy} r={92} fill="none" stroke="currentColor" className="text-border-strong" strokeWidth="1" />
        {cut === "nature" &&
          [0, 0.25, 0.5, 0.75].map((f, i) => {
            const a = start + f * Math.PI * 2;
            const p0 = polar(cx, cy, 78, a);
            const p1 = polar(cx, cy, 98, a);
            return <line key={i} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="#e8e6e1" strokeWidth="2" />;
          })}
        {cut === "nature" &&
          Array.from({ length: 12 }, (_, i) => {
            const a = start + (i / 12.37) * Math.PI * 2;
            const p0 = polar(cx, cy, 84, a);
            const p1 = polar(cx, cy, 94, a);
            return <line key={`m${i}`} x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="#9aa3b2" strokeWidth="1" />;
          })}
        {cut === "gregorian" &&
          GREG_DAYS.reduce<{ acc: number; nodes: ReactNode[] }>(
            (st, d, i) => {
              const a0 = start + (st.acc / TROPICAL_YEAR) * Math.PI * 2;
              const a1 = start + ((st.acc + d) / TROPICAL_YEAR) * Math.PI * 2;
              const mid = (a0 + a1) / 2;
              const t = polar(cx, cy, 64, mid);
              st.nodes.push(
                <g key={i}>
                  <path d={wedgePath(cx, cy, 52, 90, a0, a1)} fill={i % 2 ? "rgba(232,230,225,0.08)" : "rgba(232,230,225,0.16)"} />
                  <text x={t.x} y={t.y} textAnchor="middle" dominantBaseline="middle" fill="#9aa3b2" fontSize="8">
                    {GREG_NAMES[i]}
                  </text>
                </g>,
              );
              st.acc += d;
              return st;
            },
            { acc: 0, nodes: [] },
          ).nodes}
        {cut === "fixed13" &&
          Array.from({ length: 13 }, (_, i) => {
            const span = (28 / TROPICAL_YEAR) * Math.PI * 2;
            const a0 = start + i * span;
            const a1 = a0 + span;
            const mid = (a0 + a1) / 2;
            const t = polar(cx, cy, 66, mid);
            return (
              <g key={i}>
                <path d={wedgePath(cx, cy, 52, 88, a0, a1)} fill={i % 2 ? "rgba(232,230,225,0.08)" : "rgba(232,230,225,0.16)"} />
                <text x={t.x} y={t.y} textAnchor="middle" dominantBaseline="middle" fill="#9aa3b2" fontSize="8">
                  {i + 1}
                </text>
              </g>
            );
          })}
        {cut === "fixed13" && (
          <path
            d={wedgePath(cx, cy, 52, 98, start + (364 / TROPICAL_YEAR) * Math.PI * 2, start + Math.PI * 2)}
            fill="rgba(232,230,225,0.45)"
          />
        )}
        {cut === "roman" &&
          ROMAN.map((name, i) => {
            const span = (Math.PI * 2) / 10;
            const a0 = start + i * span;
            const a1 = a0 + span;
            const t = polar(cx, cy, 66, (a0 + a1) / 2);
            return (
              <g key={name}>
                <path d={wedgePath(cx, cy, 52, 90, a0, a1)} fill={i % 2 ? "rgba(232,230,225,0.08)" : "rgba(232,230,225,0.16)"} />
                <text x={t.x} y={t.y} textAnchor="middle" dominantBaseline="middle" fill="#9aa3b2" fontSize="7">
                  {name}
                </text>
              </g>
            );
          })}
        {(() => {
          const a = start + frac * Math.PI * 2;
          const p = polar(cx, cy, 96, a);
          return <circle cx={p.x} cy={p.y} r="4" fill="#e8e6e1" />;
        })()}
        {(() => {
          const a = start + moonFrac * Math.PI * 2;
          const p = polar(cx, cy, 42, a);
          return <circle cx={p.x} cy={p.y} r="3.2" fill="#c5c1b8" />;
        })()}
        <circle cx={cx} cy={cy} r="18" fill="#6f93c4" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#07080c" fontSize="8">
          Earth
        </text>
      </svg>
      <div className="grid grid-cols-2 gap-1">
        {CUTS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCut(c.id)}
            className={`rounded-sm px-2 py-2 text-left text-[11px] leading-tight ${
              cut === c.id ? "bg-accent text-accent-fg" : "bg-bg-subtle text-muted hover:text-fg"
            }`}
          >
            <span className="block font-medium">{c.label}</span>
          </button>
        ))}
      </div>
      {cut === "fixed13" && (
        <p className="text-[11px] leading-snug text-muted">
          White sliver: the leftover ~1.24 days. 365 ÷ 28 is not 13.
        </p>
      )}
      {cut === "gregorian" && (
        <p className="text-[11px] leading-snug text-muted">Sep–Dec still wear the names of 7–10 from a March year.</p>
      )}
      {cut === "nature" && (
        <p className="text-[11px] leading-snug text-muted">Four season ticks. Twelve-and-a-fraction moons. No leftover invented.</p>
      )}
      {cut === "roman" && (
        <p className="text-[11px] leading-snug text-muted">September sits on wedge 7. The names were never hidden. The start moved.</p>
      )}
    </div>
  );
}
