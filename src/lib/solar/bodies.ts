export type BodyKind = "star" | "planet" | "dwarf" | "moon";

export type Body = {
  id: string;
  name: string;
  kind: BodyKind;
  parent?: string;
  /** Equatorial diameter, km */
  diameterKm: number;
  /** Mean distance from Sun, AU (moons: from parent, AU) */
  au: number;
  perihelionAu: number;
  aphelionAu: number;
  /** Sidereal orbit, Earth days */
  periodDays: number;
  /** Sidereal rotation, hours (negative = retrograde) */
  rotationHours: number;
  /** Axial tilt, degrees */
  tilt: number;
  eccentricity: number;
  /** Orbital inclination to ecliptic, degrees */
  inclination: number;
  /** Approximate true-color hex */
  color: string;
  /** Textbook / enhanced hex */
  enhanced: string;
  moons?: number;
  blurb: string;
};

export const SUN_DIAMETER_KM = 1_392_000;
export const AU_KM = 149_597_870.7;
export const TROPICAL_YEAR = 365.24219;
export const SIDEREAL_YEAR = 365.25636;
export const SYNODIC_MONTH = 29.53059;
export const SIDEREAL_MONTH = 27.32166;
export const SIDEREAL_DAY_HOURS = 23.934469;
export const EARTH_TILT = 23.44;

export const BODIES: Body[] = [
  {
    id: "sun",
    name: "Sun",
    kind: "star",
    diameterKm: SUN_DIAMETER_KM,
    au: 0,
    perihelionAu: 0,
    aphelionAu: 0,
    periodDays: 0,
    rotationHours: 609.12,
    tilt: 7.25,
    eccentricity: 0,
    inclination: 0,
    color: "#f2e6c4",
    enhanced: "#ffcc66",
    blurb: "A yellow-white dwarf. Everything else is debris in its gravity well.",
  },
  {
    id: "mercury",
    name: "Mercury",
    kind: "planet",
    diameterKm: 4879,
    au: 0.387,
    perihelionAu: 0.307,
    aphelionAu: 0.467,
    periodDays: 87.97,
    rotationHours: 1407.6,
    tilt: 0.03,
    eccentricity: 0.206,
    inclination: 7.0,
    color: "#9a958c",
    enhanced: "#c4b9a8",
    moons: 0,
    blurb: "Grey, cratered, the most stretched inner orbit.",
  },
  {
    id: "venus",
    name: "Venus",
    kind: "planet",
    diameterKm: 12104,
    au: 0.723,
    perihelionAu: 0.718,
    aphelionAu: 0.728,
    periodDays: 224.7,
    rotationHours: -5832.5,
    tilt: 177.4,
    eccentricity: 0.007,
    inclination: 3.4,
    color: "#d9c9a0",
    enhanced: "#e8d48a",
    moons: 0,
    blurb: "Opaque sulfur cloud. The globe you see is never the land.",
  },
  {
    id: "earth",
    name: "Earth",
    kind: "planet",
    diameterKm: 12756,
    au: 1,
    perihelionAu: 0.983,
    aphelionAu: 1.017,
    periodDays: 365.256,
    rotationHours: 23.934,
    tilt: 23.44,
    eccentricity: 0.017,
    inclination: 0,
    color: "#6f93c4",
    enhanced: "#3d7ad6",
    moons: 1,
    blurb: "Blue ocean, white swirl. Seasons are a lean, not a closer sun.",
  },
  {
    id: "moon",
    name: "Moon",
    kind: "moon",
    parent: "earth",
    diameterKm: 3475,
    au: 0.00257,
    perihelionAu: 0.00243,
    aphelionAu: 0.00271,
    periodDays: 27.322,
    rotationHours: 655.7,
    tilt: 6.68,
    eccentricity: 0.055,
    inclination: 5.15,
    color: "#c5c1b8",
    enhanced: "#ddd8cc",
    blurb: "Large versus Earth. Phases keep time every 29.53 days — not 28.",
  },
  {
    id: "mars",
    name: "Mars",
    kind: "planet",
    diameterKm: 6792,
    au: 1.524,
    perihelionAu: 1.381,
    aphelionAu: 1.666,
    periodDays: 686.98,
    rotationHours: 24.623,
    tilt: 25.19,
    eccentricity: 0.093,
    inclination: 1.85,
    color: "#c07a58",
    enhanced: "#e07a45",
    moons: 2,
    blurb: "Butterscotch rust and white caps. Seasons live here too.",
  },
  {
    id: "ceres",
    name: "Ceres",
    kind: "dwarf",
    diameterKm: 940,
    au: 2.77,
    perihelionAu: 2.56,
    aphelionAu: 2.98,
    periodDays: 1680,
    rotationHours: 9.07,
    tilt: 4,
    eccentricity: 0.08,
    inclination: 10.6,
    color: "#8b8680",
    enhanced: "#a8a29a",
    blurb: "The belt’s only round world. The belt itself is mostly empty.",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    kind: "planet",
    diameterKm: 142984,
    au: 5.204,
    perihelionAu: 4.95,
    aphelionAu: 5.46,
    periodDays: 4332.6,
    rotationHours: 9.93,
    tilt: 3.13,
    eccentricity: 0.049,
    inclination: 1.3,
    color: "#d3c3a0",
    enhanced: "#e0b56a",
    moons: 95,
    blurb: "Banded cream. Spins so fast it flattens.",
  },
  {
    id: "saturn",
    name: "Saturn",
    kind: "planet",
    diameterKm: 120536,
    au: 9.583,
    perihelionAu: 9.04,
    aphelionAu: 10.12,
    periodDays: 10759,
    rotationHours: 10.7,
    tilt: 26.73,
    eccentricity: 0.057,
    inclination: 2.49,
    color: "#e0d3b0",
    enhanced: "#f0d48a",
    moons: 274,
    blurb: "Pale gold. The rings are ice-bright and paper-thin.",
  },
  {
    id: "uranus",
    name: "Uranus",
    kind: "planet",
    diameterKm: 51118,
    au: 19.19,
    perihelionAu: 18.28,
    aphelionAu: 20.1,
    periodDays: 30685,
    rotationHours: -17.2,
    tilt: 97.77,
    eccentricity: 0.047,
    inclination: 0.77,
    color: "#b7d4d2",
    enhanced: "#7fd4d0",
    moons: 28,
    blurb: "Pale cyan. It rolls on its side for decades of polar day.",
  },
  {
    id: "neptune",
    name: "Neptune",
    kind: "planet",
    diameterKm: 49528,
    au: 30.07,
    perihelionAu: 29.81,
    aphelionAu: 30.33,
    periodDays: 60190,
    rotationHours: 16.1,
    tilt: 28.32,
    eccentricity: 0.009,
    inclination: 1.77,
    color: "#6f8fb8",
    enhanced: "#2f6fe0",
    moons: 16,
    blurb: "A muted green-blue twin of Uranus. The electric postcard is stretched.",
  },
  {
    id: "pluto",
    name: "Pluto",
    kind: "dwarf",
    diameterKm: 2376,
    au: 39.48,
    perihelionAu: 29.66,
    aphelionAu: 49.3,
    periodDays: 90560,
    rotationHours: -153.3,
    tilt: 122.5,
    eccentricity: 0.249,
    inclination: 17.16,
    color: "#c9b49a",
    enhanced: "#e8c4a0",
    moons: 5,
    blurb: "A charcoal world with a bright ice heart. Charon is a partner, not a speck.",
  },
];

export const PLANETS = BODIES.filter((b) => b.kind === "planet");
export const MAJOR = BODIES.filter((b) => b.kind === "planet" || b.id === "sun");

export function bodyById(id: string) {
  return BODIES.find((b) => b.id === id);
}

export function earthRadii(diameterKm: number) {
  return diameterKm / 12756;
}

/** Keplerian position in the orbital plane; x toward perihelion. */
export function keplerPosition(au: number, ecc: number, meanAnomaly: number) {
  let E = meanAnomaly;
  for (let i = 0; i < 8; i++) {
    E = meanAnomaly + ecc * Math.sin(E);
  }
  const x = au * (Math.cos(E) - ecc);
  const z = au * Math.sqrt(1 - ecc * ecc) * Math.sin(E);
  return { x, z };
}

export const LIGHT_MINUTES_PER_AU = 8.31675;
