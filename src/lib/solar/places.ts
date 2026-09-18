export type Place = {
  name: string;
  region: string;
  lat: number;
  lon: number;
};

/** Enough dirt to stand on. Type a name, or lat, lon. */
export const PLACES: Place[] = [
  { name: "Vero Beach", region: "Florida", lat: 27.6386, lon: -80.3973 },
  { name: "Miami", region: "Florida", lat: 25.7617, lon: -80.1918 },
  { name: "Orlando", region: "Florida", lat: 28.5383, lon: -81.3792 },
  { name: "Tampa", region: "Florida", lat: 27.9506, lon: -82.4572 },
  { name: "Jacksonville", region: "Florida", lat: 30.3322, lon: -81.6557 },
  { name: "West Palm Beach", region: "Florida", lat: 26.7153, lon: -80.0534 },
  { name: "Fort Lauderdale", region: "Florida", lat: 26.1224, lon: -80.1373 },
  { name: "Fellsmere", region: "Florida", lat: 27.7678, lon: -80.6014 },
  { name: "New York", region: "United States", lat: 40.7128, lon: -74.006 },
  { name: "Los Angeles", region: "United States", lat: 34.0522, lon: -118.2437 },
  { name: "Chicago", region: "United States", lat: 41.8781, lon: -87.6298 },
  { name: "Houston", region: "United States", lat: 29.7604, lon: -95.3698 },
  { name: "Phoenix", region: "United States", lat: 33.4484, lon: -112.074 },
  { name: "Philadelphia", region: "United States", lat: 39.9526, lon: -75.1652 },
  { name: "San Francisco", region: "United States", lat: 37.7749, lon: -122.4194 },
  { name: "Seattle", region: "United States", lat: 47.6062, lon: -122.3321 },
  { name: "Denver", region: "United States", lat: 39.7392, lon: -104.9903 },
  { name: "Atlanta", region: "United States", lat: 33.749, lon: -84.388 },
  { name: "Boston", region: "United States", lat: 42.3601, lon: -71.0589 },
  { name: "Washington", region: "United States", lat: 38.9072, lon: -77.0369 },
  { name: "Dallas", region: "United States", lat: 32.7767, lon: -96.797 },
  { name: "Austin", region: "United States", lat: 30.2672, lon: -97.7431 },
  { name: "New Orleans", region: "United States", lat: 29.9511, lon: -90.0715 },
  { name: "Honolulu", region: "United States", lat: 21.3069, lon: -157.8583 },
  { name: "Anchorage", region: "United States", lat: 61.2181, lon: -149.9003 },
  { name: "Mexico City", region: "Mexico", lat: 19.4326, lon: -99.1332 },
  { name: "Toronto", region: "Canada", lat: 43.6532, lon: -79.3832 },
  { name: "Vancouver", region: "Canada", lat: 49.2827, lon: -123.1207 },
  { name: "Havana", region: "Cuba", lat: 23.1136, lon: -82.3666 },
  { name: "San Juan", region: "Puerto Rico", lat: 18.4655, lon: -66.1057 },
  { name: "São Paulo", region: "Brazil", lat: -23.5505, lon: -46.6333 },
  { name: "Rio de Janeiro", region: "Brazil", lat: -22.9068, lon: -43.1729 },
  { name: "Buenos Aires", region: "Argentina", lat: -34.6037, lon: -58.3816 },
  { name: "Lima", region: "Peru", lat: -12.0464, lon: -77.0428 },
  { name: "Bogotá", region: "Colombia", lat: 4.711, lon: -74.0721 },
  { name: "Santiago", region: "Chile", lat: -33.4489, lon: -70.6693 },
  { name: "London", region: "United Kingdom", lat: 51.5074, lon: -0.1278 },
  { name: "Paris", region: "France", lat: 48.8566, lon: 2.3522 },
  { name: "Madrid", region: "Spain", lat: 40.4168, lon: -3.7038 },
  { name: "Rome", region: "Italy", lat: 41.9028, lon: 12.4964 },
  { name: "Berlin", region: "Germany", lat: 52.52, lon: 13.405 },
  { name: "Amsterdam", region: "Netherlands", lat: 52.3676, lon: 4.9041 },
  { name: "Lisbon", region: "Portugal", lat: 38.7223, lon: -9.1393 },
  { name: "Athens", region: "Greece", lat: 37.9838, lon: 23.7275 },
  { name: "Istanbul", region: "Türkiye", lat: 41.0082, lon: 28.9784 },
  { name: "Moscow", region: "Russia", lat: 55.7558, lon: 37.6173 },
  { name: "Cairo", region: "Egypt", lat: 30.0444, lon: 31.2357 },
  { name: "Lagos", region: "Nigeria", lat: 6.5244, lon: 3.3792 },
  { name: "Nairobi", region: "Kenya", lat: -1.2921, lon: 36.8219 },
  { name: "Cape Town", region: "South Africa", lat: -33.9249, lon: 18.4241 },
  { name: "Johannesburg", region: "South Africa", lat: -26.2041, lon: 28.0473 },
  { name: "Casablanca", region: "Morocco", lat: 33.5731, lon: -7.5898 },
  { name: "Dubai", region: "United Arab Emirates", lat: 25.2048, lon: 55.2708 },
  { name: "Jerusalem", region: "Israel", lat: 31.7683, lon: 35.2137 },
  { name: "Tehran", region: "Iran", lat: 35.6892, lon: 51.389 },
  { name: "Mumbai", region: "India", lat: 19.076, lon: 72.8777 },
  { name: "Delhi", region: "India", lat: 28.7041, lon: 77.1025 },
  { name: "Kolkata", region: "India", lat: 22.5726, lon: 88.3639 },
  { name: "Bangkok", region: "Thailand", lat: 13.7563, lon: 100.5018 },
  { name: "Singapore", region: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "Jakarta", region: "Indonesia", lat: -6.2088, lon: 106.8456 },
  { name: "Manila", region: "Philippines", lat: 14.5995, lon: 120.9842 },
  { name: "Hong Kong", region: "China", lat: 22.3193, lon: 114.1694 },
  { name: "Shanghai", region: "China", lat: 31.2304, lon: 121.4737 },
  { name: "Beijing", region: "China", lat: 39.9042, lon: 116.4074 },
  { name: "Tokyo", region: "Japan", lat: 35.6762, lon: 139.6503 },
  { name: "Seoul", region: "South Korea", lat: 37.5665, lon: 126.978 },
  { name: "Sydney", region: "Australia", lat: -33.8688, lon: 151.2093 },
  { name: "Melbourne", region: "Australia", lat: -37.8136, lon: 144.9631 },
  { name: "Auckland", region: "New Zealand", lat: -36.8509, lon: 174.7645 },
  { name: "Reykjavík", region: "Iceland", lat: 64.1466, lon: -21.9426 },
  { name: "Portland", region: "Oregon", lat: 45.5152, lon: -122.6784 },
  { name: "Minneapolis", region: "United States", lat: 44.9778, lon: -93.265 },
  { name: "Las Vegas", region: "United States", lat: 36.1699, lon: -115.1398 },
  { name: "Nashville", region: "United States", lat: 36.1627, lon: -86.7816 },
  { name: "Montreal", region: "Canada", lat: 45.5017, lon: -73.5673 },
  { name: "Dublin", region: "Ireland", lat: 53.3498, lon: -6.2603 },
  { name: "Stockholm", region: "Sweden", lat: 59.3293, lon: 18.0686 },
  { name: "Vienna", region: "Austria", lat: 48.2082, lon: 16.3738 },
  { name: "Prague", region: "Czechia", lat: 50.0755, lon: 14.4378 },
  { name: "Zurich", region: "Switzerland", lat: 47.3769, lon: 8.5417 },
  { name: "Barcelona", region: "Spain", lat: 41.3874, lon: 2.1686 },
  { name: "Milan", region: "Italy", lat: 45.4642, lon: 9.19 },
  { name: "Accra", region: "Ghana", lat: 5.6037, lon: -0.187 },
  { name: "Tel Aviv", region: "Israel", lat: 32.0853, lon: 34.7818 },
  { name: "Riyadh", region: "Saudi Arabia", lat: 24.7136, lon: 46.6753 },
  { name: "Karachi", region: "Pakistan", lat: 24.8607, lon: 67.0011 },
  { name: "Dhaka", region: "Bangladesh", lat: 23.8103, lon: 90.4125 },
  { name: "Taipei", region: "Taiwan", lat: 25.033, lon: 121.5654 },
  { name: "Osaka", region: "Japan", lat: 34.6937, lon: 135.5023 },
  { name: "Perth", region: "Australia", lat: -31.9523, lon: 115.8613 },
  { name: "Brisbane", region: "Australia", lat: -27.4698, lon: 153.0251 },
];

export function parseCoords(q: string): Place | null {
  const compact = q.trim();
  const signed = compact.match(/^(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (signed) {
    const lat = Number(signed[1]);
    const lon = Number(signed[2]);
    if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      return { name: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`, region: "Coordinates", lat, lon };
    }
  }
  const hemi = compact.match(
    /^(\d+(?:\.\d+)?)\s*°?\s*([NS])\s*[, ]\s*(\d+(?:\.\d+)?)\s*°?\s*([EW])$/i,
  );
  if (hemi) {
    const lat = Number(hemi[1]) * (hemi[2].toUpperCase() === "S" ? -1 : 1);
    const lon = Number(hemi[3]) * (hemi[4].toUpperCase() === "W" ? -1 : 1);
    if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      return { name: `${Math.abs(lat).toFixed(2)}°${hemi[2].toUpperCase()} ${Math.abs(lon).toFixed(2)}°${hemi[4].toUpperCase()}`, region: "Coordinates", lat, lon };
    }
  }
  return null;
}

export function searchPlaces(q: string, limit = 6): Place[] {
  const s = q.trim().toLowerCase();
  if (s.length < 1) return [];
  const scored = PLACES.map((p) => {
    const n = p.name.toLowerCase();
    const r = p.region.toLowerCase();
    let score = 0;
    if (n === s) score = 100;
    else if (n.startsWith(s)) score = 80;
    else if (n.includes(s)) score = 50;
    else if (r.startsWith(s)) score = 30;
    else if (r.includes(s)) score = 15;
    return { p, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.p.name.localeCompare(b.p.name));
  return scored.slice(0, limit).map((x) => x.p);
}
