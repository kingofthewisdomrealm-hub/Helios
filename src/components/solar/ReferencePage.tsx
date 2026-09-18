import { Link, useNavigate } from "@tanstack/react-router";
import { REFERENCE, type Mark, type RefEntry } from "@/lib/solar/reference";
import { useSolar } from "@/lib/solar/store";

export function ReferencePage() {
  const navigate = useNavigate();
  const setMode = useSolar((s) => s.setMode);
  const setCalendarCut = useSolar((s) => s.setCalendarCut);
  const setSkyCut = useSolar((s) => s.setSkyCut);
  const setMonthCut = useSolar((s) => s.setMonthCut);
  const setNumenCut = useSolar((s) => s.setNumenCut);
  const setGroundCut = useSolar((s) => s.setGroundCut);

  function open(entry: RefEntry) {
    const g = entry.go;
    if (!g) return;
    if (g.calendarCut) setCalendarCut(g.calendarCut);
    if (g.skyCut) setSkyCut(g.skyCut);
    if (g.monthCut) setMonthCut(g.monthCut);
    if (g.numenCut) setNumenCut(g.numenCut);
    if (g.groundCut) setGroundCut(g.groundCut);
    setMode(g.mode);
    void navigate({ to: "/" });
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/92 px-5 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div>
            <p className="font-display text-2xl leading-none">Helios</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-subtle">Reference</p>
          </div>
          <Link
            to="/"
            className="flex h-11 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg"
          >
            Back to the model
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10 pb-24">
        <h1 className="font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl">
          If you were born, here is what to do.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          Fill the blanks. Place. Day. Then the sentence tells you where to stand.
        </p>
        <p className="mt-3 text-[11px] tracking-wide">
          <span className="text-true">measured</span>
          <span className="text-subtle"> — from the sky. </span>
          <span className="text-mix">named</span>
          <span className="text-subtle"> — a knife we laid on it.</span>
        </p>

        {REFERENCE.map((section) => (
          <section key={section.id} className="mt-12">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-subtle">{section.title}</h2>
            <ul className="mt-4 divide-y divide-border">
              {section.entries.map((entry) => (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={() => open(entry)}
                    className="grid w-full grid-cols-1 gap-2 py-5 text-left sm:grid-cols-[11rem_1fr] sm:items-start sm:gap-x-6"
                  >
                    <span className="flex items-baseline gap-2 sm:w-auto">
                      <span className="font-display text-2xl leading-none">{entry.title}</span>
                      <MarkDot mark={entry.mark} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm leading-snug text-fg">{entry.human}</span>
                      <span className="mt-1 block text-[12px] leading-snug text-subtle">{entry.line}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className="mt-14 text-sm leading-relaxed text-subtle">
          Tap a name to see it.
        </p>
      </main>
    </div>
  );
}

function MarkDot({ mark }: { mark: Mark }) {
  return (
    <span className={`text-[10px] uppercase tracking-wide ${mark === "measured" ? "text-true" : "text-mix"}`}>
      {mark}
    </span>
  );
}
