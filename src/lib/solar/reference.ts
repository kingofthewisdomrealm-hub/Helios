import type { CalendarCut, Mode, MonthCut, NumenCut, SkyCut } from "./store";

export type Mark = "measured" | "named";

export type RefEntry = {
  id: string;
  title: string;
  line: string;
  human: string;
  mark: Mark;
  go?: {
    mode: Mode;
    calendarCut?: CalendarCut;
    skyCut?: SkyCut;
    monthCut?: MonthCut;
    numenCut?: NumenCut;
  };
};

export type RefSection = {
  id: string;
  title: string;
  entries: RefEntry[];
};

export const REFERENCE: RefSection[] = [
  {
    id: "worlds",
    title: "The worlds",
    entries: [
      {
        id: "family",
        title: "Family",
        line: "True widths, side by side. The gaps are a lie so they can share a page.",
        human: "You live on the small wet one. The giants are not a home.",
        mark: "measured",
        go: { mode: "portrait" },
      },
      {
        id: "orbits",
        title: "Orbits",
        line: "The paths are real ellipses. The worlds are drawn large so you can see them.",
        human: "Your year is one lap. Their years are longer. A child of Jupiter would wait twelve of yours.",
        mark: "measured",
        go: { mode: "orbits" },
      },
      {
        id: "void",
        title: "Void",
        line: "One scale. Almost nothing. That emptiness is the fact.",
        human: "The space that holds you is mostly empty. A life never feels that far.",
        mark: "measured",
        go: { mode: "void" },
      },
      {
        id: "edge",
        title: "Edge",
        line: "Each ring is ten times farther than the last. Light takes hours, then years.",
        human: "A call from here crawls. Nothing you love is waiting in the dark yet.",
        mark: "measured",
        go: { mode: "edge" },
      },
    ],
  },
  {
    id: "year",
    title: "The year",
    entries: [
      {
        id: "time",
        title: "Time",
        line: "Earth leans 23°. That lean is the seasons. The Moon does not keep a year.",
        human: "The lean gives you winter and harvest. Without it, no planting, no coat, no year you can feel.",
        mark: "measured",
        go: { mode: "time", calendarCut: "nature" },
      },
      {
        id: "nature",
        title: "Nature",
        line: "Equinox. Solstice. About 12.37 moons. They do not close on the year.",
        human: "Your body already knows light, heat, and tide. The year will not round itself for you.",
        mark: "measured",
        go: { mode: "time", calendarCut: "nature" },
      },
      {
        id: "gregorian",
        title: "Gregorian",
        line: "Twelve uneven months. The year starts in January, in winter.",
        human: "Pay, birthdays, school, tax. You were born into a new year that starts in the cold.",
        mark: "named",
        go: { mode: "time", calendarCut: "gregorian" },
      },
      {
        id: "thirteen",
        title: "Thirteen",
        line: "13 × 28 = 364. A leftover day remains. 365 ÷ 28 is not 13.",
        human: "A wish for even weeks — every month starting on the same weekday. Offices never took it.",
        mark: "named",
        go: { mode: "time", calendarCut: "fixed13" },
      },
      {
        id: "roman",
        title: "Roman",
        line: "Ten months from March. September is seven. October is eight. The names still say so.",
        human: "You still say September. Your mouth remembers a year that began at planting.",
        mark: "named",
        go: { mode: "time", calendarCut: "roman" },
      },
    ],
  },
  {
    id: "wheel",
    title: "The wheel",
    entries: [
      {
        id: "signs",
        title: "Signs",
        line: "You look out from Earth. The lamp is in front. The sign is the wallpaper behind it.",
        human: "People timed birth, war, and sowing by that wallpaper. It is a story you can stand in. It is not a cause in you.",
        mark: "named",
        go: { mode: "sky", skyCut: "tropical" },
      },
      {
        id: "tropical",
        title: "Twelve signs",
        line: "Twelve equal 30° slices, cut at the spring equinox. This is a horoscope.",
        human: "A personality cut into twelve. Easy to share. Not a mechanism in flesh.",
        mark: "named",
        go: { mode: "sky", skyCut: "tropical" },
      },
      {
        id: "stars",
        title: "The stars",
        line: "The real constellations are unequal. Ophiuchus is the thirteenth. The twelve never had a house for him.",
        human: "The pictures behind the Sun do not know your birthday.",
        mark: "measured",
        go: { mode: "sky", skyCut: "stars" },
      },
      {
        id: "slip",
        title: "The slip",
        line: "Same sky. Two knives. The names stayed. The sky moved about 24°.",
        human: "If you were told Aries, the sky may say Pisces. You inherited a name older than the star you were shown.",
        mark: "measured",
        go: { mode: "sky", skyCut: "both" },
      },
      {
        id: "months",
        title: "Months",
        line: "A second ring on the same orbit. January does not sit on the equinox. March does.",
        human: "You count a life in months. They match neither moons nor signs. You still show up.",
        mark: "named",
        go: { mode: "sky", monthCut: "gregorian" },
      },
    ],
  },
  {
    id: "numbers",
    title: "The numbers",
    entries: [
      {
        id: "nine",
        title: "The nine",
        line: "1 Sun, 2 Moon, 3 Jupiter, 4 Rahu, 5 Mercury, 6 Venus, 7 Ketu, 8 Saturn, 9 Mars. Seven lamps. Two shadows. A name map.",
        human: "People mapped character onto digits. The map lives in culture. It does not live in tissue.",
        mark: "named",
        go: { mode: "sky", numenCut: "nine" },
      },
      {
        id: "week",
        title: "The week",
        line: "Sunday, Monday, Saturday. This one lives in the language.",
        human: "This one runs you. Work, rest, worship. Seven named days, not a count the sky requires.",
        mark: "named",
        go: { mode: "sky", numenCut: "week" },
      },
      {
        id: "square",
        title: "The square",
        line: "4 9 2 · 3 5 7 · 8 1 6. Every line is 15. A tablet sitting above the wheel, not on it.",
        human: "A puzzle that sums. Worn as a charm. It does not steer a day.",
        mark: "named",
        go: { mode: "sky", numenCut: "square" },
      },
      {
        id: "reduce",
        title: "The reductions",
        line: "365→5 · 28→1 · 13→4 · 12→3 · 7→7 · 9→9. Base ten. Not a sky law.",
        human: "Folding a year into one digit is easy to remember. That is all it does.",
        mark: "named",
        go: { mode: "sky", numenCut: "nine" },
      },
    ],
  },
];
