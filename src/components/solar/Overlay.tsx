import { CircleHelp, Pause, Play, SunMedium } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { BODIES, bodyById, LIGHT_MINUTES_PER_AU, TROPICAL_YEAR } from "@/lib/solar/bodies";
import { MODES, useSolar } from "@/lib/solar/store";
import { CalendarPanel } from "./CalendarPanel";
import { GroundReadout } from "./GroundStage";
import { SkyReadout } from "./SkyStage";

export function Overlay() {
  const mode = useSolar((s) => s.mode);
  const setMode = useSolar((s) => s.setMode);
  const selectedId = useSolar((s) => s.selectedId);
  const selectAndFocus = useSolar((s) => s.selectAndFocus);
  const paused = useSolar((s) => s.paused);
  const togglePaused = useSolar((s) => s.togglePaused);
  const speed = useSolar((s) => s.speed);
  const setSpeed = useSolar((s) => s.setSpeed);
  const enhanced = useSolar((s) => s.enhanced);
  const toggleEnhanced = useSolar((s) => s.toggleEnhanced);
  const hover = useSolar((s) => s.hoverLabel);
  const body = selectedId ? bodyById(selectedId) : null;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-3 sm:p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="pointer-events-auto max-w-[18rem]">
          <p className="font-display text-[1.65rem] leading-none tracking-tight text-fg">Helios</p>
          <p className="mt-1 text-xs text-muted">{MODES.find((m) => m.id === mode)?.line}</p>
          <p className="mt-1 hidden text-[11px] text-subtle sm:block">
            {mode === "portrait"
              ? "True diameters. Space between them is a lie."
              : mode === "sky"
                ? "Nine digits above the months. The pairing is a name map."
                : mode === "ground"
                  ? "If you were born in ___ on _____, you should go to _____."
                  : "Drag to turn · scroll to close in"}
          </p>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          <AuthSlot />
          <Link
            to="/reference"
            className="flex size-11 items-center justify-center rounded-md border border-border bg-bg-elevated text-muted"
            aria-label="Reference"
          >
            <CircleHelp className="size-4" />
          </Link>
          <button
            type="button"
            onClick={toggleEnhanced}
            className="hidden h-11 items-center rounded-md border border-border bg-bg-elevated px-3 text-xs text-muted sm:flex"
          >
            {enhanced ? "Enhanced color" : "Window color"}
          </button>
          <button
            type="button"
            onClick={togglePaused}
            className="flex size-11 items-center justify-center rounded-md border border-border bg-bg-elevated text-fg"
            aria-label={paused ? "Play" : "Pause"}
          >
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col justify-end gap-3 pt-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="pointer-events-auto w-full max-w-md space-y-3 sm:w-[280px]">
          {mode === "sky" ? (
            <SkyReadout />
          ) : mode === "ground" ? (
            <GroundReadout />
          ) : (
            body && (
            <article className="rounded-lg border border-border bg-bg-elevated/92 p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">{body.kind}</p>
              <h2 className="font-display text-2xl leading-tight">{body.name}</h2>
              <p className="mt-1 hidden text-sm leading-snug text-muted sm:block">{body.blurb}</p>
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] sm:mt-3 sm:gap-y-2">
                <Stat label="Diameter" value={`${Math.round(body.diameterKm).toLocaleString()} km`} />
                {body.au > 0 && <Stat label="Distance" value={`${body.au.toFixed(2)} AU`} />}
                {body.periodDays > 0 && <Stat label="Year" value={`${body.periodDays < 400 ? body.periodDays.toFixed(1) + " d" : (body.periodDays / TROPICAL_YEAR).toFixed(2) + " yr"}`} />}
                <Stat label="Tilt" value={`${body.tilt.toFixed(1)}°`} />
                {mode === "void" && body.au > 0 && (
                  <Stat label="Light" value={`${(body.au * LIGHT_MINUTES_PER_AU).toFixed(1)} min`} />
                )}
              </dl>
            </article>
            )
          )}
          {mode === "time" && (
            <div className="hidden sm:block">
              <CalendarPanel />
            </div>
          )}
        </div>

        {mode === "time" && (
          <div className="pointer-events-auto sm:hidden">
            <CalendarPanel />
          </div>
        )}

        <div className="pointer-events-auto flex w-full flex-col items-stretch gap-2 sm:w-auto sm:items-end">
          <div className="hidden max-w-[min(28rem,46vw)] overflow-x-auto md:flex">
            <div className="flex gap-1">
            {BODIES.filter((b) => b.id !== "moon").map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => selectAndFocus(b.id)}
                className={`h-8 shrink-0 rounded-full px-2.5 text-[11px] ${
                  selectedId === b.id ? "bg-accent text-accent-fg" : "text-subtle hover:text-fg"
                }`}
              >
                {b.name}
              </button>
            ))}
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto rounded-lg border border-border bg-bg-elevated/92 p-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`h-11 shrink-0 rounded-md px-3 text-sm ${
                  mode === m.id ? "bg-accent text-accent-fg" : "text-muted hover:text-fg"
                }`}
              >
                {m.label}
              </button>
            ))}
          </nav>
          <label className="flex items-center gap-2 rounded-md border border-border bg-bg-elevated/92 px-3 py-2 text-xs text-muted">
            <SunMedium className="size-3.5" />
            <span className="w-10 tabular-nums">{speed < 1 ? speed.toFixed(2) : speed.toFixed(0)}×</span>
            <input
              type="range"
              min={0.2}
              max={80}
              step={0.2}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="h-11 w-32 accent-accent"
            />
          </label>
        </div>
      </div>

      {hover && hover.id !== selectedId && (
        <div
          className="pointer-events-none absolute rounded-sm border border-border bg-bg-elevated px-2 py-1 text-xs"
          style={{ left: hover.x + 12, top: hover.y + 12 }}
        >
          {bodyById(hover.id)?.name ?? hover.id}
        </div>
      )}
    </div>
  );
}

function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="size-11 animate-pulse rounded-md border border-border bg-bg-elevated" />;
  }
  if (user) {
    return (
      <div className="h-11 max-w-[8.5rem] overflow-hidden sm:max-w-[12rem]">
        <UserButton />
      </div>
    );
  }
  return (
    <SignedOut>
      <Link
        to="/login"
        className="flex h-11 items-center rounded-md border border-border bg-bg-elevated px-3 text-xs text-muted hover:text-fg"
      >
        Sign in
      </Link>
    </SignedOut>
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

export function Intro({ onEnter }: { onEnter: () => void }) {
  const setMode = useSolar((s) => s.setMode);
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-end gap-5 px-5 pt-10 pb-4 sm:justify-center sm:gap-8 sm:py-12">
        <p className="text-[11px] uppercase tracking-[0.28em] text-subtle">A visual model</p>
        <h1 className="font-display text-[2.15rem] leading-[0.95] tracking-tight text-fg sm:text-6xl">
          You cannot show size, distance, and time in one picture.
        </h1>
        <p className="max-w-lg text-sm leading-relaxed text-muted sm:text-base">
          Worlds are small. Years are a lean and a loop. Calendars are knives we lay across that loop. None of them are the sky.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id);
                onEnter();
              }}
              className="rounded-md border border-border bg-bg-elevated px-3 py-3 text-left"
            >
              <span className="block text-sm text-fg">{m.label}</span>
              <span className="mt-1 block text-[11px] leading-snug text-muted">{m.line}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="sticky bottom-0 mx-auto w-full max-w-2xl px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2">
        <button
          type="button"
          onClick={onEnter}
          className="h-12 w-full rounded-md bg-accent text-sm font-medium text-accent-fg sm:w-auto sm:px-8"
        >
          Back to the model
        </button>
      </div>
    </div>
  );
}
