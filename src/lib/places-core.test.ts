import { test } from "node:test";
import assert from "node:assert/strict";
import { formatMonth, parsePins } from "./places-core.ts";

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
