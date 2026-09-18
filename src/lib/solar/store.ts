import { create } from "zustand";
import type { GroundCut } from "./astrocartography";
import type { Geo } from "./astrocartography";

export type Mode = "portrait" | "orbits" | "void" | "time" | "edge" | "sky" | "ground";
export type CalendarCut = "nature" | "gregorian" | "fixed13" | "roman";
export type SkyCut = "tropical" | "stars" | "both";
export type MonthCut = "gregorian" | "fixed13" | "roman";
export type NumenCut = "nine" | "week" | "square";
export type { GroundCut };

export const MODES: { id: Mode; label: string; line: string }[] = [
  { id: "portrait", label: "Family", line: "True sizes. Distances collapsed." },
  { id: "orbits", label: "Orbits", line: "Kepler motion. Worlds enlarged to be seen." },
  { id: "void", label: "Void", line: "One scale. Almost nothing." },
  { id: "time", label: "Time", line: "Spin, Moon, year. Calendars as cuts." },
  { id: "edge", label: "Edge", line: "Logarithm of the Sun’s reach." },
  { id: "sky", label: "Signs", line: "Earth in the middle. Numbers sit above the months." },
  { id: "ground", label: "Ground", line: "If you were born in ___ on _____, you should go to _____." },
];

type SolarState = {
  entered: boolean;
  mode: Mode;
  selectedId: string | null;
  focusNonce: number;
  simDays: number;
  speed: number;
  paused: boolean;
  enhanced: boolean;
  calendarCut: CalendarCut;
  skyCut: SkyCut;
  monthCut: MonthCut;
  numenCut: NumenCut;
  groundCut: GroundCut;
  pin: Geo | null;
  placeName: string | null;
  lookAt: Geo | null;
  lookNonce: number;
  hoverLabel: { id: string; x: number; y: number } | null;
  about: boolean;
  enter: () => void;
  setMode: (mode: Mode) => void;
  setSelected: (id: string | null) => void;
  selectAndFocus: (id: string) => void;
  setSimDays: (d: number) => void;
  advance: (deltaDays: number) => void;
  setSpeed: (s: number) => void;
  togglePaused: () => void;
  setPaused: (p: boolean) => void;
  toggleEnhanced: () => void;
  setCalendarCut: (c: CalendarCut) => void;
  setSkyCut: (c: SkyCut) => void;
  setMonthCut: (c: MonthCut) => void;
  setNumenCut: (c: NumenCut) => void;
  setGroundCut: (c: GroundCut) => void;
  setPin: (p: Geo | null) => void;
  setPlace: (name: string | null, geo: Geo | null) => void;
  setHoverLabel: (h: { id: string; x: number; y: number } | null) => void;
  setAbout: (v: boolean) => void;
};

export const useSolar = create<SolarState>((set) => ({
  entered: true,
  mode: "ground",
  selectedId: "sun",
  focusNonce: 0,
  simDays: 171.5,
  speed: 4,
  paused: true,
  enhanced: false,
  calendarCut: "nature",
  skyCut: "tropical",
  monthCut: "gregorian",
  numenCut: "nine",
  groundCut: "four",
  pin: null,
  placeName: null,
  lookAt: null,
  lookNonce: 0,
  hoverLabel: null,
  about: false,
  enter: () => set({ entered: true, about: false }),
  setMode: (mode) =>
    set((s) => ({
      mode,
      hoverLabel: null,
      selectedId: mode === "sky" || mode === "ground" ? "sun" : "earth",
      paused: mode === "ground" ? true : s.paused,
    })),
  setSelected: (selectedId) => set({ selectedId }),
  selectAndFocus: (selectedId) =>
    set((s) => ({ selectedId, focusNonce: s.focusNonce + 1 })),
  setSimDays: (simDays) => set({ simDays }),
  advance: (deltaDays) =>
    set((s) => ({ simDays: (s.simDays + deltaDays + 1e9) % 1e9 })),
  setSpeed: (speed) => set({ speed }),
  togglePaused: () => set((s) => ({ paused: !s.paused })),
  setPaused: (paused) => set({ paused }),
  toggleEnhanced: () => set((s) => ({ enhanced: !s.enhanced })),
  setCalendarCut: (calendarCut) => set({ calendarCut }),
  setSkyCut: (skyCut) => set({ skyCut }),
  setMonthCut: (monthCut) => set({ monthCut }),
  setNumenCut: (numenCut) => set({ numenCut }),
  setGroundCut: (groundCut) => set({ groundCut }),
  setPin: (pin) => set({ pin, placeName: null }),
  setPlace: (placeName, geo) =>
    set((s) => ({
      placeName,
      pin: geo ?? s.pin,
      lookAt: geo,
      lookNonce: geo ? s.lookNonce + 1 : s.lookNonce,
    })),
  setHoverLabel: (hoverLabel) => set({ hoverLabel }),
  setAbout: (about) => set({ about }),
}));
