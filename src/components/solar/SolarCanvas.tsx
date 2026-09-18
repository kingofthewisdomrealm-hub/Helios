import { useEffect, useRef, useState } from "react";
import type { HeliosEngine } from "@/lib/solar/engine";
import { BODIES } from "@/lib/solar/bodies";
import { useSolar } from "@/lib/solar/store";

export function SolarCanvas({ hidden = false }: { hidden?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const blitRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<HeliosEngine | null>(null);
  const [live, setLive] = useState(false);
  const mode = useSolar((s) => s.mode);
  const simDays = useSolar((s) => s.simDays);
  const enhanced = useSolar((s) => s.enhanced);
  const calendarCut = useSolar((s) => s.calendarCut);
  const selectedId = useSolar((s) => s.selectedId);
  const focusNonce = useSolar((s) => s.focusNonce);

  useEffect(() => {
    const wrap = wrapRef.current;
    const blitCanvas = blitRef.current;
    if (!wrap) return;
    const canvas = document.createElement("canvas");
    canvas.className = "absolute inset-0 block h-full w-full touch-none opacity-0";
    canvas.setAttribute("aria-hidden", "true");
    wrap.appendChild(canvas);

    let cancelled = false;
    let engine: HeliosEngine | null = null;
    let wait = 0;
    const onResize = () => engine?.resize();

    void import("@/lib/solar/engine").then(({ HeliosEngine }) => {
      if (cancelled) {
        canvas.remove();
        return;
      }
      const store = useSolar.getState();
      engine = new HeliosEngine(
        canvas,
        (id) => useSolar.getState().setSelected(id),
        (h) => useSolar.getState().setHoverLabel(h),
        blitCanvas,
      );
      engineRef.current = engine;
      engine.setMode(store.mode);
      engine.setSimDays(store.simDays);
      engine.setEnhanced(store.enhanced);
      engine.setCalendarCut(store.calendarCut);
      window.addEventListener("resize", onResize);
      wait = window.setInterval(() => {
        const calls = (window as unknown as { __helios?: { calls: () => { triangles: number } } }).__helios?.calls();
        if (calls && calls.triangles > 20) {
          setLive(true);
          window.clearInterval(wait);
        }
      }, 150);
    });

    return () => {
      cancelled = true;
      window.clearInterval(wait);
      window.removeEventListener("resize", onResize);
      engine?.dispose();
      engineRef.current = null;
      canvas.remove();
    };
  }, []);

  useEffect(() => {
    engineRef.current?.setMode(mode);
  }, [mode]);
  useEffect(() => {
    engineRef.current?.setSimDays(simDays);
  }, [simDays]);
  useEffect(() => {
    engineRef.current?.setEnhanced(enhanced);
  }, [enhanced]);
  useEffect(() => {
    engineRef.current?.setCalendarCut(calendarCut);
  }, [calendarCut]);
  useEffect(() => {
    engineRef.current?.setSelected(selectedId);
  }, [selectedId]);
  useEffect(() => {
    if (!focusNonce) return;
    const id = useSolar.getState().selectedId;
    if (id) engineRef.current?.focusBody(id);
  }, [focusNonce]);

  return (
    <div ref={wrapRef} className={`absolute inset-0 h-full w-full touch-none ${hidden ? "invisible" : ""}`}>
      <canvas ref={blitRef} className="absolute inset-0 block h-full w-full" aria-label="Solar system model" />
      {!live && <FamilyFallback />}
    </div>
  );
}

function FamilyFallback() {
  const maxD = 142984;
  return (
    <div className="absolute inset-0 flex items-end justify-start gap-2 overflow-hidden px-6 pb-[30vh] sm:items-center sm:pb-0">
      {BODIES.filter((b) => b.id !== "moon").map((b) => {
        const px = b.id === "sun" ? 88 : Math.max(10, (b.diameterKm / maxD) * 72);
        return (
          <div key={b.id} className="flex shrink-0 flex-col items-center gap-2">
            <div
              className="rounded-full"
              style={{
                width: px,
                height: px,
                background: `radial-gradient(circle at 32% 28%, #fff6, transparent 42%), ${b.color}`,
                boxShadow: b.id === "sun" ? "0 0 40px 12px #f2e6c455" : "inset -8px -6px 16px #0006",
              }}
            />
            <span className="text-[10px] text-subtle">{b.name}</span>
          </div>
        );
      })}
    </div>
  );
}
