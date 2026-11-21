import { geoContains } from "d3-geo";
import type { Feature } from "geojson";

/*
  Which country a pin is in, for shading visited countries. The 110m world
  outlines are simplified, so coastal cities (Yokohama, Johor Bahru) can sit
  just offshore — if no country contains the point, try small nudges outward
  before giving up.
*/

const NUDGES_DEG = [0.25, 0.5, 1];
const DIRECTIONS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

export function findCountry<F extends Feature>(
  countries: F[],
  [lng, lat]: [number, number],
): F | null {
  const at = (p: [number, number]) =>
    countries.find((c) => geoContains(c, p)) ?? null;

  const exact = at([lng, lat]);
  if (exact) return exact;
  for (const d of NUDGES_DEG) {
    for (const [dx, dy] of DIRECTIONS) {
      const hit = at([lng + dx * d, lat + dy * d]);
      if (hit) return hit;
    }
  }
  return null;
}
