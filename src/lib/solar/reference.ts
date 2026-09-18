import type { CalendarCut, GroundCut, Mode, MonthCut, NumenCut, SkyCut } from "./store";

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
    groundCut?: GroundCut;
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
        human: "If you were born on the small wet one, you should not wait for the giants to be a home.",
        mark: "measured",
        go: { mode: "portrait" },
      },
      {
        id: "orbits",
        title: "Orbits",
        line: "The paths are real ellipses. The worlds are drawn large so you can see them.",
        human: "If you were born here, you should count one lap as a year. A child of Jupiter would wait twelve of yours.",
        mark: "measured",
        go: { mode: "orbits" },
      },
      {
        id: "void",
        title: "Void",
        line: "One scale. Almost nothing. That emptiness is the fact.",
        human: "If you were born in this emptiness, you should not expect the dark to hold a neighbor.",
        mark: "measured",
        go: { mode: "void" },
      },
      {
        id: "edge",
        title: "Edge",
        line: "Each ring is ten times farther than the last. Light takes hours, then years.",
        human: "If you were born this far from the Sun, you should know a call from here crawls. Nothing you love is waiting in the dark yet.",
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
        human: "If you were born on a leaning Earth, you should plant and coat with the seasons.",
        mark: "measured",
        go: { mode: "time", calendarCut: "nature" },
      },
      {
        id: "nature",
        title: "Nature",
        line: "Equinox. Solstice. About 12.37 moons. They do not close on the year.",
        human: "If you were born under light, heat, and tide, you should not wait for the year to round itself.",
        mark: "measured",
        go: { mode: "time", calendarCut: "nature" },
      },
      {
        id: "gregorian",
        title: "Gregorian",
        line: "Twelve uneven months. The year starts in January, in winter.",
        human: "If you were born in January, you should know your year started in the cold.",
        mark: "named",
        go: { mode: "time", calendarCut: "gregorian" },
      },
      {
        id: "thirteen",
        title: "Thirteen",
        line: "13 × 28 = 364. A leftover day remains. 365 ÷ 28 is not 13.",
        human: "If you were born into thirteen even months, you should still keep the leftover day. Offices never took it.",
        mark: "named",
        go: { mode: "time", calendarCut: "fixed13" },
      },
      {
        id: "roman",
        title: "Roman",
        line: "Ten months from March. September is seven. October is eight. The names still say so.",
        human: "If you were born after March, you should hear seven in September. Your mouth remembers planting.",
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
        human: "If you were born in Aries, you should know the wallpaper was Aries. It is a story you can stand in. It is not a cause in you.",
        mark: "named",
        go: { mode: "sky", skyCut: "tropical" },
      },
      {
        id: "tropical",
        title: "Twelve signs",
        line: "Twelve equal 30° slices, cut at the spring equinox. This is a horoscope.",
        human: "If you were born into twelve slices, you should not take a personality as flesh.",
        mark: "named",
        go: { mode: "sky", skyCut: "tropical" },
      },
      {
        id: "stars",
        title: "The stars",
        line: "The real constellations are unequal. Ophiuchus is the thirteenth. The twelve never had a house for him.",
        human: "If you were born when the Sun stood in Ophiuchus, you should know the twelve never had a house for you.",
        mark: "measured",
        go: { mode: "sky", skyCut: "stars" },
      },
      {
        id: "slip",
        title: "The slip",
        line: "Same sky. Two knives. The names stayed. The sky moved about 24°.",
        human: "If you were told Aries, you should look. The sky may say Pisces.",
        mark: "measured",
        go: { mode: "sky", skyCut: "both" },
      },
      {
        id: "months",
        title: "Months",
        line: "A second ring on the same orbit. January does not sit on the equinox. March does.",
        human: "If you were born in January, you should not wait for the equinox to match your month.",
        mark: "named",
        go: { mode: "sky", monthCut: "gregorian" },
      },
    ],
  },
  {
    id: "ground",
    title: "The ground",
    entries: [
      {
        id: "lines",
        title: "Ground",
        line: "Same sky. Different dirt. At one second, each planet has a place overhead, underfoot, rising, setting.",
        human: "If you were born under this sky, you should change the dirt, not the lamps.",
        mark: "measured",
        go: { mode: "ground", groundCut: "four" },
      },
      {
        id: "overhead",
        title: "Overhead",
        line: "The meridian. Where that planet stood highest. MC on the poster.",
        human: "If you were born at noon, you should walk the Sun’s overhead line every day.",
        mark: "measured",
        go: { mode: "ground", groundCut: "four" },
      },
      {
        id: "rising",
        title: "Rising",
        line: "The horizon great circle. Dawn of that lamp. AC on the poster.",
        human: "If you were born at dawn, you should know you arrived on the Sun’s rising line.",
        mark: "measured",
        go: { mode: "ground", groundCut: "day" },
      },
      {
        id: "poster",
        title: "The poster",
        line: "Every overhead meridian at once. This is the map people share.",
        human: "If you were born on a Jupiter line, you should not call luck a mechanism. Go there if the name fits.",
        mark: "named",
        go: { mode: "ground", groundCut: "poster" },
      },
      {
        id: "birthday",
        title: "Day of birth",
        line: "A ring of 365 days around the dirt. Equinox at the right. The bead is the birthday. Drag the ring.",
        human: "If you were born on 21 June, you should know the Sun stood over the tropic that day.",
        mark: "measured",
        go: { mode: "ground", groundCut: "four" },
      },
      {
        id: "birthhour",
        title: "Hour of birth",
        line: "The hour is Earth’s spin. Fifteen degrees of dirt per hour. Noon is the Sun overhead on some meridian.",
        human: "If you were born at 4:20, you should know that minute chose which dirt sat under the sky.",
        mark: "measured",
        go: { mode: "ground", groundCut: "four" },
      },
      {
        id: "birthplace",
        title: "A birth",
        line: "Type the day, the hour, the dirt. The ring, the clock, and the pin become that second.",
        human: "If you were born in Vero Beach on 14 March, you should read the lines from that second.",
        mark: "measured",
        go: { mode: "ground", groundCut: "four" },
      },
      {
        id: "nameddirt",
        title: "Named dirt",
        line: "Cities scored by closeness to Jupiter, Sun, Venus, Moon lines. Bright means near. “Best” is a name.",
        human: "If you were born in ___ on _____, you should go where Jupiter and the Sun stand high. Type the blanks. The globe fills them.",
        mark: "named",
        go: { mode: "ground", groundCut: "places" },
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
        human: "If you were born on a 1, you should not take the Sun as a character in you.",
        mark: "named",
        go: { mode: "sky", numenCut: "nine" },
      },
      {
        id: "week",
        title: "The week",
        line: "Sunday, Monday, Saturday. This one lives in the language.",
        human: "If you were born on a Sunday, you should know the name runs the week, not the sky.",
        mark: "named",
        go: { mode: "sky", numenCut: "week" },
      },
      {
        id: "square",
        title: "The square",
        line: "4 9 2 · 3 5 7 · 8 1 6. Every line is 15. A tablet sitting above the wheel, not on it.",
        human: "If you were born into 15, you should wear the puzzle as a charm, not a steering.",
        mark: "named",
        go: { mode: "sky", numenCut: "square" },
      },
      {
        id: "reduce",
        title: "The reductions",
        line: "365→5 · 28→1 · 13→4 · 12→3 · 7→7 · 9→9. Base ten. Not a sky law.",
        human: "If you were born in a year that folds to 5, you should remember that is base ten, not a law.",
        mark: "named",
        go: { mode: "sky", numenCut: "nine" },
      },
    ],
  },
];
