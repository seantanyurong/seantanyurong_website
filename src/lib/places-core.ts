/*
  Pure helpers that turn rows from the Notion "Travel DB" into map pins.
  No imports so the Node test runner can load this file directly.

  Only Place, Departure Date, Trip Type and Location are read — Travel Group
  names friends and family and must never reach the public site.
*/

export type Visit = {
  trip: string;
  departure: string; // YYYY-MM-DD
  tripType: string | null;
};

export type Pin = {
  key: string;
  label: string;
  lat: number;
  lng: number;
  visits: Visit[];
};

type Row = Visit & { lat: number; lng: number; locationName: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRow(page: any): Row | null {
  const props = page?.properties;
  const place = props?.Location?.place;
  const departure: unknown = props?.["Departure Date"]?.date?.start;
  if (
    typeof place?.lat !== "number" ||
    typeof place?.lon !== "number" ||
    typeof departure !== "string"
  ) {
    return null;
  }

  const titleParts: { plain_text?: string }[] = props?.Place?.title ?? [];
  const trip = titleParts.map((t) => t.plain_text ?? "").join("").trim();
  const tripType: unknown = props?.["Trip Type"]?.select?.name;
  const locationName =
    typeof place.name === "string" && place.name ? place.name : trip;

  return {
    trip: trip || locationName,
    departure: departure.slice(0, 10),
    tripType: typeof tripType === "string" ? tripType : null,
    lat: place.lat,
    lng: place.lon,
    locationName,
  };
}

export function parsePins(pages: unknown[], today: string): Pin[] {
  const pins = new Map<string, Pin>();

  for (const page of pages) {
    const row = parseRow(page);
    if (!row || row.departure > today) continue;

    // Round so the same place entered twice with slightly different
    // coordinates still lands on one pin.
    const key = `${row.lat.toFixed(2)},${row.lng.toFixed(2)}`;
    let pin = pins.get(key);
    if (!pin) {
      pin = {
        key,
        label: row.locationName.split(",")[0].trim(),
        lat: row.lat,
        lng: row.lng,
        visits: [],
      };
      pins.set(key, pin);
    }
    pin.visits.push({
      trip: row.trip,
      departure: row.departure,
      tripType: row.tripType,
    });
  }

  const byNewest = (a: Visit, b: Visit) => b.departure.localeCompare(a.departure);
  const result = [...pins.values()];
  result.forEach((p) => p.visits.sort(byNewest));
  return result.sort((a, b) => byNewest(a.visits[0], b.visits[0]));
}

export function formatMonth(iso: string): string {
  return new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString(
    "en-US",
    { month: "short", year: "numeric", timeZone: "UTC" },
  );
}

export type Cluster<T> = { x: number; y: number; items: T[] };

/*
  Groups projected points that would overlap on screen. Any two points
  within `radius` end up in the same cluster (chained, so A–B–C merge even if
  A and C are further apart). Cluster position is the mean of its points;
  clusters keep the input order of their first item.
*/
export function clusterPoints<T extends { x: number; y: number }>(
  points: T[],
  radius: number,
): Cluster<T>[] {
  const groupOf = points.map((_, i) => i);
  const find = (i: number): number =>
    groupOf[i] === i ? i : (groupOf[i] = find(groupOf[i]));

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      if (Math.hypot(dx, dy) <= radius) groupOf[find(j)] = find(i);
    }
  }

  const groups = new Map<number, T[]>();
  points.forEach((p, i) => {
    const root = find(i);
    groups.set(root, [...(groups.get(root) ?? []), p]);
  });

  return [...groups.values()].map((items) => ({
    x: items.reduce((s, p) => s + p.x, 0) / items.length,
    y: items.reduce((s, p) => s + p.y, 0) / items.length,
    items,
  }));
}
