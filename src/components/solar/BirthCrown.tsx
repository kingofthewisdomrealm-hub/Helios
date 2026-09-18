import { useCallback, useMemo, useRef, useState } from "react";
import { useSolar } from "@/lib/solar/store";
import {
  dateInputValue,
  hhmm,
  localStamp,
  partsOf,
  civilToDays,
  timeForHorizon,
  withLocalTime,
} from "@/lib/solar/birth";
import { parseCoords, searchPlaces, type Place } from "@/lib/solar/places";

export function BirthCrown() {
  const days = useSolar((s) => s.simDays);
  const setSimDays = useSolar((s) => s.setSimDays);
  const setPaused = useSolar((s) => s.setPaused);
  const pin = useSolar((s) => s.pin);
  const placeName = useSolar((s) => s.placeName);
  const setPlace = useSolar((s) => s.setPlace);
  const utc = partsOf(days);
  const shown = pin ? localStamp(utc, pin.lon) : utc;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const freeze = useCallback(
    (next: number) => {
      setPaused(true);
      setSimDays(next);
    },
    [setPaused, setSimDays],
  );

  const applyCivil = useCallback(
    (year: number, month: number, day: number, hour: number, minute: number, lon?: number | null) => {
      freeze(civilToDays(year, month, day, hour, minute, lon ?? undefined));
    },
    [freeze],
  );

  const hits = useMemo(() => {
    const coords = parseCoords(query);
    const places = searchPlaces(query);
    return coords ? [coords, ...places.filter((p) => p.name !== coords.name)] : places;
  }, [query]);

  const stand = (place: Place) => {
    setPlace(place.name, { lat: place.lat, lon: place.lon });
    applyCivil(shown.year, shown.monthNum, shown.day, shown.hour, shown.minute, place.lon);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="pointer-events-auto z-20 mb-1 w-full max-w-[min(100%,36rem)] px-1">
      <form
        className="grid grid-cols-2 gap-1 sm:grid-cols-[1fr_7.5rem]"
        onSubmit={(e) => {
          e.preventDefault();
          const coords = parseCoords(query);
          if (coords) stand(coords);
          else if (hits[0]) stand(hits[0]);
        }}
      >
        <label className="block">
          <span className="sr-only">Date of birth</span>
          <input
            type="date"
            value={dateInputValue(shown)}
            min="1800-01-01"
            max="2100-12-31"
            onChange={(e) => {
              const v = e.target.value;
              if (!v) return;
              const [y, m, d] = v.split("-").map(Number);
              applyCivil(y, m, d, shown.hour, shown.minute, pin?.lon);
            }}
            className="h-11 w-full rounded-sm border border-border bg-bg-elevated/95 px-2 text-sm text-fg"
            aria-label="Date of birth"
          />
        </label>
        <label className="block">
          <span className="sr-only">Time of birth</span>
          <input
            type="time"
            value={hhmm(shown)}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) return;
              const [h, m] = v.split(":").map(Number);
              applyCivil(shown.year, shown.monthNum, shown.day, h, m, pin?.lon);
            }}
            className="h-11 w-full rounded-sm border border-border bg-bg-elevated/95 px-2 text-sm tabular-nums text-fg"
            aria-label="Time of birth"
          />
        </label>
        <div className="relative col-span-2">
          <input
            type="text"
            value={open || query ? query : placeName ?? ""}
            placeholder="City, or lat, lon"
            autoComplete="off"
            spellCheck={false}
            onFocus={() => {
              setOpen(true);
              setQuery(placeName ?? query);
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onBlur={() => {
              window.setTimeout(() => setOpen(false), 140);
            }}
            className="h-11 w-full rounded-sm border border-border bg-bg-elevated/95 px-2 text-sm text-fg placeholder:text-subtle"
            aria-label="Place of birth"
            aria-autocomplete="list"
          />
          {open && hits.length > 0 && (
            <ul className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-sm border border-border bg-bg-elevated py-1 shadow-lg">
              {hits.map((p) => (
                <li key={`${p.name}-${p.lat}`}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => stand(p)}
                    className="flex h-11 w-full items-center justify-between px-3 text-left text-sm text-fg hover:bg-bg-subtle"
                  >
                    <span>{p.name}</span>
                    <span className="text-[11px] text-subtle">{p.region}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>
      <p className="mt-1 text-center text-[10px] uppercase tracking-[0.14em] text-subtle">
        {pin ? "Local mean at this dirt · not a timezone" : "Time is UTC until you name a place"}
      </p>

      <div className="mt-1 flex items-center gap-2">
        <HourClock
          hour={shown.hour + shown.minute / 60}
          onChange={(h) => freeze(withLocalTime(days, h, 0, pin?.lon))}
        />
        <HourBar
          hour={shown.hour + shown.minute / 60}
          onChange={(h) => freeze(withLocalTime(days, Math.floor(h), Math.round((h % 1) * 60), pin?.lon))}
        />
      </div>

      {pin && (
        <div className="mt-1 flex flex-wrap justify-center gap-1">
          <button
            type="button"
            onClick={() => freeze(timeForHorizon(days, pin, "rise"))}
            className="h-8 rounded-sm bg-bg-elevated/90 px-2 text-[10px] text-muted hover:text-fg"
          >
            Dawn here
          </button>
          <button
            type="button"
            onClick={() => freeze(timeForHorizon(days, pin, "set"))}
            className="h-8 rounded-sm bg-bg-elevated/90 px-2 text-[10px] text-muted hover:text-fg"
          >
            Dusk here
          </button>
        </div>
      )}
    </div>
  );
}

function HourBar({ hour, onChange }: { hour: number; onChange: (h: number) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-0.5 text-[10px] text-subtle">
      <span className="flex justify-between tabular-nums">
        <span>00</span>
        <span>12</span>
        <span>24</span>
      </span>
      <input
        ref={ref}
        type="range"
        min={0}
        max={24}
        step={0.0167}
        value={hour}
        onChange={(e) => onChange(Number(e.target.value) % 24)}
        className="h-11 w-full accent-accent"
        aria-label="Hour of birth"
      />
    </label>
  );
}

function HourClock({ hour, onChange }: { hour: number; onChange: (h: number) => void }) {
  const ref = useRef<SVGSVGElement>(null);
  const fromEvent = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const x = clientX - box.left - box.width / 2;
    const y = clientY - box.top - box.height / 2;
    const ang = Math.atan2(x, -y);
    const wrapped = (ang + Math.PI * 2) % (Math.PI * 2);
    onChange(((wrapped / (Math.PI * 2)) * 24 + 12) % 24);
  };
  const a = ((hour - 12) / 24) * Math.PI * 2;
  const hx = 36 + Math.sin(a) * 22;
  const hy = 36 - Math.cos(a) * 22;
  return (
    <svg
      ref={ref}
      viewBox="0 0 72 72"
      className="size-14 shrink-0 touch-none sm:size-16"
      role="slider"
      aria-label="24-hour clock"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        fromEvent(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) fromEvent(e.clientX, e.clientY);
      }}
    >
      <circle cx="36" cy="36" r="34" fill="#101218" stroke="currentColor" className="text-border" strokeWidth="1" />
      {Array.from({ length: 24 }, (_, i) => {
        const t = ((i - 12) / 24) * Math.PI * 2;
        const inner = i % 6 === 0 ? 24 : 28;
        return (
          <line
            key={i}
            x1={36 + Math.sin(t) * inner}
            y1={36 - Math.cos(t) * inner}
            x2={36 + Math.sin(t) * 32}
            y2={36 - Math.cos(t) * 32}
            stroke="currentColor"
            className={i % 6 === 0 ? "text-fg" : "text-subtle"}
            strokeWidth={i % 6 === 0 ? 1.4 : 0.6}
          />
        );
      })}
      <text x="36" y="16" textAnchor="middle" fill="currentColor" className="text-muted" fontSize="7">
        12
      </text>
      <text x="36" y="62" textAnchor="middle" fill="currentColor" className="text-subtle" fontSize="7">
        0
      </text>
      <line x1="36" y1="36" x2={hx} y2={hy} stroke="#f2e6c4" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="36" cy="36" r="2.2" fill="#f2e6c4" />
    </svg>
  );
}
