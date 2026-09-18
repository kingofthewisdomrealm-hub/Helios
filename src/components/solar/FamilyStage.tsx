import { BODIES } from "@/lib/solar/bodies";
import { useSolar } from "@/lib/solar/store";

const PX = 11;

function radiusPx(diameterKm: number, id: string) {
  if (id === "sun") return 22 * PX;
  return Math.max((diameterKm / 12756) * 1.65 * PX, 5);
}

export function FamilyStage() {
  const selectedId = useSolar((s) => s.selectedId);
  const selectAndFocus = useSolar((s) => s.selectAndFocus);

  return (
    <div className="absolute inset-0 flex flex-col justify-center">
      <div className="mask-fade overflow-x-auto px-5 pt-16 pb-36 sm:px-10 sm:pb-8">
        <div className="flex origin-left scale-[0.48] items-end gap-3 sm:scale-100">
          {BODIES.map((b) => {
          const r = radiusPx(b.diameterKm, b.id);
          const selected = selectedId === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => selectAndFocus(b.id)}
              className="flex shrink-0 flex-col items-center gap-2"
              aria-pressed={selected}
              aria-label={b.name}
            >
              <span
                className="relative block rounded-full"
                style={{
                  width: r * 2,
                  height: r * 2,
                  background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.35), transparent 42%), ${b.color}`,
                  boxShadow:
                    b.id === "sun"
                      ? "0 0 48px 16px rgba(242,230,196,0.28)"
                      : selected
                        ? "0 0 0 2px var(--color-accent)"
                        : "inset -10px -8px 18px rgba(0,0,0,0.35)",
                  animation: b.id === "sun" ? "helios-pulse 6s ease-in-out infinite" : "helios-spin 64s linear infinite",
                }}
              >
                {b.id === "saturn" && (
                  <span
                    className="pointer-events-none absolute top-1/2 left-1/2 block rounded-full"
                    style={{
                      width: "168%",
                      height: "28%",
                      marginLeft: "-84%",
                      marginTop: "-14%",
                      border: "3px solid rgba(224,211,176,0.72)",
                      transform: "rotate(-18deg)",
                    }}
                  />
                )}
              </span>
              <span className={`text-[11px] ${selected ? "text-fg" : "text-subtle"}`}>{b.name}</span>
            </button>
          );
        })}
        </div>
      </div>
      <p className="absolute bottom-[9.5rem] left-5 max-w-sm text-[11px] text-subtle sm:bottom-auto sm:top-[5.5rem] sm:left-10">
        Distances collapsed. Diameters true. Jupiter is a world; Earth is a marble; the Sun is the room.
      </p>
    </div>
  );
}
