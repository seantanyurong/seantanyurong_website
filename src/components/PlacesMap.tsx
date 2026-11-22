import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection } from "geojson";
import countries110m from "world-atlas/countries-110m.json";
import type { Pin } from "@/lib/places-core";
import { findCountry } from "@/lib/places-geo";
import { PlacesMapView, type MapPoint } from "./PlacesMapView";

/*
  Places map — a static world SVG drawn on the server (no tiles, no API key),
  inside an interactive client view (pins, tooltips, click-to-zoom).
  Countries with at least one pin are shaded.
*/

const WIDTH = 960;

const topology = countries110m as unknown as Topology<{
  countries: GeometryCollection;
}>;
const world = feature(
  topology,
  topology.objects.countries,
) as FeatureCollection;
// Antarctica (ISO 010) eats a lot of vertical space and has no pins.
const land: FeatureCollection = {
  ...world,
  features: world.features.filter((f) => f.id !== "010"),
};

const projection = geoNaturalEarth1().fitWidth(WIDTH, land);
const path = geoPath(projection);
const HEIGHT = Math.ceil(path.bounds(land)[1][1]);
const countryPaths = land.features.map((f) => ({ id: f.id, d: path(f) ?? "" }));

export function PlacesMap({ pins }: { pins: Pin[] }) {
  const points: MapPoint[] = pins.flatMap(({ key, label, lng, lat, visits }) => {
    const xy = projection([lng, lat]);
    return xy ? [{ key, label, visits, x: xy[0], y: xy[1] }] : [];
  });
  const visited = new Set(
    pins.flatMap((p) => findCountry(land.features, [p.lng, p.lat])?.id ?? []),
  );

  return (
    <div>
      <PlacesMapView
        points={points}
        width={WIDTH}
        height={HEIGHT}
        label={`World map with ${pins.length} places visited`}
      >
        {countryPaths.map(({ id, d }, i) => (
          <path
            key={i}
            d={d}
            className={`stroke-white ${
              id !== undefined && visited.has(id)
                ? "fill-teal-100"
                : "fill-neutral-100"
            }`}
            strokeWidth={0.5}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </PlacesMapView>
      <p className="mt-6 text-sm text-neutral-500">
        {pins.length} {pins.length === 1 ? "city" : "cities"} across{" "}
        {visited.size} {visited.size === 1 ? "country" : "countries"}.{" "}
        <span>
          <span className="sm:hidden">Tap</span>
          <span className="hidden sm:inline">Click</span> a dot to zoom in.
        </span>
      </p>
    </div>
  );
}
