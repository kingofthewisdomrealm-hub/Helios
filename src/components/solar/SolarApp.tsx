import { useEffect } from "react";
import { useSolar } from "@/lib/solar/store";
import { Intro, Overlay } from "./Overlay";
import { SolarCanvas } from "./SolarCanvas";
import { FamilyStage } from "./FamilyStage";
import { GroundStage } from "./GroundStage";
import { SkyStage } from "./SkyStage";

export function SolarApp() {
  const about = useSolar((s) => s.about);
  const enter = useSolar((s) => s.enter);
  const mode = useSolar((s) => s.mode);
  const paused = useSolar((s) => s.paused);
  const speed = useSolar((s) => s.speed);
  const advance = useSolar((s) => s.advance);
  const togglePaused = useSolar((s) => s.togglePaused);
  const setMode = useSolar((s) => s.setMode);

  useEffect(() => {
    if (paused) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      advance(speed * dt);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused, speed, advance]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePaused();
      }
      const map: Record<string, Parameters<typeof setMode>[0]> = {
        Digit1: "portrait",
        Digit2: "orbits",
        Digit3: "void",
        Digit4: "time",
        Digit5: "edge",
        Digit6: "sky",
        Digit7: "ground",
      };
      if (map[e.code]) setMode(map[e.code]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setMode, togglePaused]);

  const hideCanvas = mode === "portrait" || mode === "sky" || mode === "ground";

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-bg">
      <SolarCanvas hidden={hideCanvas} />
      {mode === "portrait" && <FamilyStage />}
      {mode === "sky" && <SkyStage />}
      {mode === "ground" && <GroundStage />}
      <Overlay />
      {about && (
        <div className="absolute inset-0 z-20 overflow-y-auto bg-bg/80">
          <Intro onEnter={enter} />
        </div>
      )}
    </main>
  );
}
