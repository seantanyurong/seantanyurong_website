import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { feature } from "topojson-client";
import type { FeatureCollection } from "geojson";
import { findCountry } from "./places-geo.ts";

const require = createRequire(import.meta.url);
const topo = require("world-atlas/countries-110m.json");
const countries = (feature(topo, topo.objects.countries) as unknown as FeatureCollection)
  .features;
const nameAt = (lng: number, lat: number) =>
  findCountry(countries, [lng, lat])?.properties?.name ?? null;

test("finds the country containing an inland point", () => {
  assert.equal(nameAt(100.50177, 13.75633), "Thailand");
  assert.equal(nameAt(16.37208, 48.20849), "Austria");
});

test("nudges coastal points that fall outside simplified outlines", () => {
  assert.equal(nameAt(139.638, 35.44372), "Japan");
  assert.equal(nameAt(103.7578, 1.4655), "Malaysia");
  assert.equal(nameAt(28.97836, 41.00824), "Turkey");
});

test("returns null in the open ocean", () => {
  assert.equal(nameAt(-140, 0), null);
});
