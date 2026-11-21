import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection } from "geojson";
import countries110m from "world-atlas/countries-110m.json";
import { clusterPoints, type Pin } from "@/lib/places-core";
import { PlacesMapPins, type MapCluster } from "./PlacesMapPins";

/*
  Places map — a static world SVG drawn on the server (no tiles, no API key),
  with an interactive pin overlay. Pins that would overlap at this scale are
  merged into one cluster whose tooltip lists every place in it.
*/

const WIDTH = 960;
// Pins closer than this (in SVG units) would overlap, so they share a dot.
const CLUSTER_RADIUS = 14;

const topology = countries110m as unknown as Topology<{
  countries: GeometryCollection;
}>;
const world = feature(topology, topology.objects.countries) as FeatureCollection;
// Antarctica (ISO 010) eats a lot of vertical space and has no pins.
const land: FeatureCollection = {
  ...world,
  features: world.features.filter((f) => f.id !== "010"),
};

const projection = geoNaturalEarth1().fitWidth(WIDTH, land);
const path = geoPath(projection);
const HEIGHT = Math.ceil(path.bounds(land)[1][1]);
const countryPaths = land.features.map((f) => path(f) ?? "");

export function PlacesMap({ pins }: { pins: Pin[] }) {
  const projected = pins.flatMap((pin) => {
    const xy = projection([pin.lng, pin.lat]);
    return xy ? [{ ...pin, x: xy[0], y: xy[1] }] : [];
  });

  const clusters: MapCluster[] = clusterPoints(projected, CLUSTER_RADIUS).map(
    (c) => ({
      left: (c.x / WIDTH) * 100,
      top: (c.y / HEIGHT) * 100,
      pins: c.items.map(({ key, label, visits }) => ({ key, label, visits })),
    }),
  );

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label={`World map with ${pins.length} places visited`}
      >
        {countryPaths.map((d, i) => (
          <path
            key={i}
            d={d}
            className="fill-neutral-100 stroke-white"
            strokeWidth={0.5}
          />
        ))}
      </svg>
      <PlacesMapPins clusters={clusters} />
    </div>
  );
}
