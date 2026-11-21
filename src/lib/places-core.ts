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

type Place = { lat: number; lng: number; name: string | null };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parsePlace(prop: any): Place | null {
  const place = prop?.place;
  if (typeof place?.lat !== "number" || typeof place?.lon !== "number") {
    return null;
  }
  return {
    lat: place.lat,
    lng: place.lon,
    name: typeof place.name === "string" && place.name ? place.name : null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseTrip(page: any): (Visit & { place: Place | null }) | null {
  const props = page?.properties;
  const departure: unknown = props?.["Departure Date"]?.date?.start;
  if (typeof departure !== "string") return null;

  const titleParts: { plain_text?: string }[] = props?.Place?.title ?? [];
  const trip = titleParts.map((t) => t.plain_text ?? "").join("").trim();
  const tripType: unknown = props?.["Trip Type"]?.select?.name;
  const place = parsePlace(props?.Location);

  return {
    trip: trip || place?.name || "Trip",
    departure: departure.slice(0, 10),
    tripType: typeof tripType === "string" ? tripType : null,
    place,
  };
}

/*
  `pages` are Travel DB rows (one per trip). `stops` are optional Trip Stops
  rows: extra cities on a trip, linked through their `Trip` relation. A stop
  inherits its trip's name, date and type, and is hidden when its trip is.
*/
export function parsePins(
  pages: unknown[],
  today: string,
  stops: unknown[] = [],
): Pin[] {
  const pins = new Map<string, Pin>();
  // Pin key → trip ids already counted there, so a stop at the trip's own
  // Location doesn't add the same visit twice.
  const seen = new Map<string, Set<string>>();

  const addVisit = (tripId: string, place: Place, visit: Visit) => {
    // Round so the same place entered twice with slightly different
    // coordinates still lands on one pin.
    const key = `${place.lat.toFixed(2)},${place.lng.toFixed(2)}`;
    let pin = pins.get(key);
    if (!pin) {
      pin = {
        key,
        label: (place.name ?? visit.trip).split(",")[0].trim(),
        lat: place.lat,
        lng: place.lng,
        visits: [],
      };
      pins.set(key, pin);
      seen.set(key, new Set());
    }
    const tripsHere = seen.get(key)!;
    if (tripsHere.has(tripId)) return;
    tripsHere.add(tripId);
    pin.visits.push(visit);
  };

  const trips = new Map<string, Visit>();
  pages.forEach((page, i) => {
    const parsed = parseTrip(page);
    if (!parsed || parsed.departure > today) return;
    const { place, ...visit } = parsed;
    const id: string = (page as { id?: string })?.id ?? `row-${i}`;
    trips.set(id, visit);
    if (place) addVisit(id, place, visit);
  });

  for (const s of stops) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props = (s as any)?.properties;
    const place = parsePlace(props?.Location);
    const relations: { id?: string }[] = props?.Trip?.relation ?? [];
    if (!place) continue;
    for (const { id } of relations) {
      const visit = id ? trips.get(id) : undefined;
      if (id && visit) addVisit(id, place, visit);
    }
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

/*
  Pins are 24 CSS px hit targets; on a map rendered narrower than its SVG
  width they cover more SVG units, so the cluster radius scales up.
*/
export function clusterRadiusFor(
  renderedWidth: number,
  svgWidth = 960,
  hitPx = 24,
): number {
  return (hitPx * svgWidth) / Math.max(renderedWidth, 1);
}

/*
  Tooltip state. Hover, keyboard focus and tap/click are tracked separately so
  a touch tap (which fires enter → focus → click) opens and stays open, and a
  passing mouse doesn't steal a keyboard user's tooltip.
*/
export type PinUi = {
  hover: number | null;
  focus: number | null;
  pinned: number | null;
};

export type PinEvent =
  | { type: "enter" | "leave" | "focus" | "blur" | "click"; index: number }
  | { type: "dismiss" };

export function pinUiReducer(state: PinUi, event: PinEvent): PinUi {
  switch (event.type) {
    case "enter":
      return { ...state, hover: event.index };
    case "leave":
      return { ...state, hover: state.hover === event.index ? null : state.hover };
    case "focus":
      return { ...state, focus: event.index };
    case "blur":
      return { ...state, focus: state.focus === event.index ? null : state.focus };
    case "click":
      return { ...state, pinned: event.index };
    case "dismiss":
      return { hover: null, focus: null, pinned: null };
  }
}

export function activePin(state: PinUi): number | null {
  return state.hover ?? state.focus ?? state.pinned;
}
