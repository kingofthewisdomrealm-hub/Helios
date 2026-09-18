import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { deleteChart, listCharts, saveChart, type SavedChart } from "@/lib/solar/charts";
import { useSolar } from "@/lib/solar/store";
import { localStamp, partsOf } from "@/lib/solar/birth";
import { goAdvice } from "@/lib/solar/advice";
import type { PlaceScore } from "@/lib/solar/bestPlaces";

export function ChartDesk({ ranked }: { ranked: PlaceScore[] }) {
  const { user, isPending } = useCurrentUserState();
  const days = useSolar((s) => s.simDays);
  const pin = useSolar((s) => s.pin);
  const placeName = useSolar((s) => s.placeName);
  const setPlace = useSolar((s) => s.setPlace);
  const setSimDays = useSolar((s) => s.setSimDays);
  const setPaused = useSolar((s) => s.setPaused);
  const setGroundCut = useSolar((s) => s.setGroundCut);
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!user) return;
    listCharts()
      .then(setCharts)
      .catch(() => setCharts([]));
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const load = (c: SavedChart) => {
    setPaused(true);
    setSimDays(c.simDays);
    setPlace(c.placeName, { lat: c.lat, lon: c.lon });
    setGroundCut("places");
  };

  const save = async () => {
    if (!pin || !placeName) {
      setNote("Name a place first.");
      return;
    }
    const utc = partsOf(days);
    const local = localStamp(utc, pin.lon);
    setBusy(true);
    setNote(null);
    try {
      await saveChart({
        data: {
          name: `${placeName} · ${local.day} ${local.month.ab} ${local.year}`,
          placeName,
          year: local.year,
          month: local.monthNum,
          day: local.day,
          hour: local.hour,
          minute: local.minute,
          lat: pin.lat,
          lon: pin.lon,
          simDays: days,
        },
      });
      refresh();
      setGroundCut("places");
      setNote("Kept.");
    } catch {
      setNote("Could not keep it. Sign in again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      {ranked.length > 0 && (
        <ol className="space-y-1">
          {ranked.slice(0, 6).map((p, i) => (
            <li key={`${p.name}-${p.lat}`}>
              <button
                type="button"
                onClick={() => setPlace(p.name, { lat: p.lat, lon: p.lon })}
                className="flex w-full flex-col gap-0.5 rounded-sm px-1 py-1.5 text-left hover:bg-bg-subtle"
              >
                <span className="text-[12px] leading-snug text-fg">{goAdvice(p)}</span>
                <span className="text-[10px] text-muted">
                  {p.nearest.planet} {p.nearest.angleName.toLowerCase()}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
      {isPending ? (
        <div className="h-11 animate-pulse rounded-sm bg-bg-subtle" />
      ) : user ? (
        <>
          <button
            type="button"
            disabled={busy || !placeName}
            onClick={() => void save()}
            className="h-11 w-full rounded-sm bg-accent text-sm text-accent-fg disabled:opacity-40"
          >
            {busy ? "Keeping…" : "Keep this birth"}
          </button>
          {charts.length > 0 && (
            <ul className="space-y-1">
              {charts.map((c) => (
                <li key={c.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => load(c)}
                    className="min-w-0 flex-1 truncate rounded-sm px-1 py-1.5 text-left text-[11px] text-muted hover:text-fg"
                  >
                    {c.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void deleteChart({ data: c.id }).then(refresh);
                    }}
                    className="px-2 text-[10px] text-subtle hover:text-false"
                    aria-label={`Delete ${c.name}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className="text-[11px] leading-snug text-subtle">
          <Link to="/login" className="text-fg underline-offset-2 hover:underline">
            Sign in
          </Link>{" "}
          to keep a birth. If you were born there, you should come back to this sentence.
        </p>
      )}
      {note && <p className="text-[11px] text-mix">{note}</p>}
    </div>
  );
}
