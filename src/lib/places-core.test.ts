import { test } from "node:test";
import assert from "node:assert/strict";
import {
  activePin,
  clusterPoints,
  clusterRadiusFor,
  formatMonth,
  parsePins,
  pinUiReducer,
} from "./places-core.ts";

// Builds a page in the shape returned by Notion's data source query API.
function page(
  place: string,
  departure: string | null,
  location: { lat: number; lng: number; name: string } | null,
  tripType: string | null = null,
) {
  return {
    object: "page",
    properties: {
      Place: { type: "title", title: [{ plain_text: place }] },
      "Departure Date": {
        type: "date",
        date: departure ? { start: departure, end: null } : null,
      },
      "Trip Type": {
        type: "select",
        select: tripType ? { name: tripType } : null,
      },
      Location: {
        type: "place",
        place: location
          ? {
              lat: location.lat,
              lon: location.lng,
              name: location.name,
              address: location.name,
            }
          : null,
      },
      "Travel Group": {
        type: "rich_text",
        rich_text: [{ plain_text: "Should never appear" }],
      },
    },
  };
}

const TODAY = "2026-11-21";
const bangkok = { lat: 13.75633, lng: 100.50177, name: "Bangkok, Thailand" };

test("groups repeat visits into one pin, newest first", () => {
  const pins = parsePins(
    [
      page("Bangkok", "2025-04-18", bangkok),
      page("Bangkok", "2025-10-24", {
        ...bangkok,
        lat: 13.75634,
        lng: 100.50178,
      }, "Solo"),
    ],
    TODAY,
  );
  assert.equal(pins.length, 1);
  assert.equal(pins[0].label, "Bangkok");
  assert.deepEqual(
    pins[0].visits.map((v) => v.departure),
    ["2025-10-24", "2025-04-18"],
  );
  assert.equal(pins[0].visits[0].trip, "Bangkok");
  assert.equal(pins[0].visits[0].tripType, "Solo");
});

test("skips rows without location or departure", () => {
  const pins = parsePins(
    [page("Nowhere", "2025-01-01", null), page("Bangkok", null, bangkok)],
    TODAY,
  );
  assert.deepEqual(pins, []);
});

test("skips trips that have not departed yet", () => {
  assert.deepEqual(parsePins([page("Bangkok", "2026-12-01", bangkok)], TODAY), []);
  assert.equal(parsePins([page("Bangkok", "2026-11-19", bangkok)], TODAY).length, 1);
});

test("orders pins by most recent visit first", () => {
  const pins = parsePins(
    [
      page("Taiwan", "2026-07-20", { lat: 25.03297, lng: 121.56541, name: "Taipei, Taiwan" }),
      page("UK", "2026-11-15", { lat: 51.50643, lng: -0.12719, name: "London, England, United Kingdom" }),
    ],
    TODAY,
  );
  assert.deepEqual(pins.map((p) => p.label), ["London", "Taipei"]);
});

test("allows a missing trip type", () => {
  const pins = parsePins([page("Bangkok", "2025-04-18", bangkok)], TODAY);
  assert.equal(pins[0].visits[0].tripType, null);
});

test("never exposes Travel Group", () => {
  const pins = parsePins([page("Bangkok", "2025-04-18", bangkok)], TODAY);
  assert.ok(!JSON.stringify(pins).includes("Should never appear"));
});

test("ignores malformed rows instead of throwing", () => {
  assert.deepEqual(parsePins([null, {}, { properties: null }], TODAY), []);
});

test("formatMonth renders short month and year", () => {
  assert.equal(formatMonth("2025-10-24"), "Oct 2025");
  assert.equal(formatMonth("2026-01-01"), "Jan 2026");
});

test("clusterPoints merges points within the radius and keeps far ones apart", () => {
  const clusters = clusterPoints(
    [
      { id: "yokohama", x: 100, y: 100 },
      { id: "shiga", x: 103, y: 98 },
      { id: "london", x: 10, y: 10 },
    ],
    12,
  );
  assert.deepEqual(
    clusters.map((c) => c.items.map((i) => i.id)),
    [["yokohama", "shiga"], ["london"]],
  );
  assert.deepEqual([clusters[0].x, clusters[0].y], [101.5, 99]);
});

test("clusterPoints chains nearby points into one cluster", () => {
  const clusters = clusterPoints(
    [
      { id: "bangkok", x: 0, y: 0 },
      { id: "khao-kho", x: 8, y: 0 },
      { id: "chiang-mai", x: 16, y: 0 },
    ],
    10,
  );
  assert.equal(clusters.length, 1);
  assert.equal(clusters[0].items.length, 3);
});

const closed = { hover: null, focus: null, pinned: null };

test("pinUi: a tap (enter, focus, click) leaves the tooltip open", () => {
  let s = pinUiReducer(closed, { type: "enter", index: 2 });
  s = pinUiReducer(s, { type: "focus", index: 2 });
  s = pinUiReducer(s, { type: "click", index: 2 });
  assert.equal(activePin(s), 2);
});

test("pinUi: hovering another pin does not steal keyboard focus after leaving", () => {
  let s = pinUiReducer(closed, { type: "focus", index: 0 });
  s = pinUiReducer(s, { type: "enter", index: 1 });
  assert.equal(activePin(s), 1);
  s = pinUiReducer(s, { type: "leave", index: 1 });
  assert.equal(activePin(s), 0);
});

test("pinUi: dismiss closes everything, a later click reopens", () => {
  let s = pinUiReducer(closed, { type: "enter", index: 3 });
  s = pinUiReducer(s, { type: "click", index: 3 });
  s = pinUiReducer(s, { type: "dismiss" });
  assert.equal(activePin(s), null);
  s = pinUiReducer(s, { type: "click", index: 3 });
  assert.equal(activePin(s), 3);
});

test("clusterRadiusFor converts a CSS-pixel hit area to SVG units", () => {
  assert.equal(clusterRadiusFor(960), 24);
  assert.equal(clusterRadiusFor(320), 72);
});

function withId<T extends object>(id: string, p: T) {
  return { id, ...p };
}
function stop(trip: string, location: { lat: number; lng: number; name: string } | null) {
  return {
    object: "page",
    properties: {
      City: { type: "title", title: [{ plain_text: location?.name ?? "?" }] },
      Location: {
        type: "place",
        place: location ? { lat: location.lat, lon: location.lng, name: location.name } : null,
      },
      Trip: { type: "relation", relation: [{ id: trip }] },
    },
  };
}
const hanoi = { lat: 21.02776, lng: 105.83416, name: "Hanoi, Vietnam" };
const sapa = { lat: 22.3364, lng: 103.8438, name: "Sa Pa, Lào Cai, Vietnam" };

test("stops add a pin per extra city, carrying the trip's name and date", () => {
  const pins = parsePins(
    [withId("trip-1", page("Hanoi & Sapa", "2025-08-22", hanoi, "Couple"))],
    TODAY,
    [stop("trip-1", sapa)],
  );
  assert.deepEqual(pins.map((p) => p.label).sort(), ["Hanoi", "Sa Pa"]);
  const sapaPin = pins.find((p) => p.label === "Sa Pa")!;
  assert.deepEqual(sapaPin.visits, [
    { trip: "Hanoi & Sapa", departure: "2025-08-22", tripType: "Couple" },
  ]);
});

test("stops of hidden trips, unknown trips, or without location are skipped", () => {
  const pins = parsePins(
    [
      withId("future", page("Later", "2027-01-01", hanoi)),
      withId("undated", page("Someday", null, hanoi)),
    ],
    TODAY,
    [stop("future", sapa), stop("undated", sapa), stop("missing", sapa), stop("future", null)],
  );
  assert.deepEqual(pins, []);
});

test("a stop at the trip's own location does not double the visit", () => {
  const pins = parsePins(
    [withId("trip-1", page("Hanoi & Sapa", "2025-08-22", hanoi))],
    TODAY,
    [stop("trip-1", hanoi)],
  );
  assert.equal(pins.length, 1);
  assert.equal(pins[0].visits.length, 1);
});

test("a stop works even when its trip has no Location of its own", () => {
  const pins = parsePins(
    [withId("trip-1", page("US road trip", "2025-03-01", null))],
    TODAY,
    [stop("trip-1", sapa)],
  );
  assert.equal(pins.length, 1);
  assert.equal(pins[0].visits[0].trip, "US road trip");
});
