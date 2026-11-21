# Places map — design

## Intent
A "Places" section on the homepage showing where Sean has travelled: pins on a
world map; hovering a pin shows the trip name and when he went. Source of truth
is the existing Notion "Travel DB" so adding a trip in Notion updates the site.

## Goals / non-goals / anti-goals
- Goals: pins per place, hover (tap on mobile) tooltip with trip name + month/year
  (+ trip type), auto-updates from Notion within a day.
- Non-goals: zoomable/pannable map, photos, per-trip pages.
- Anti-goals: exposing `Travel Group` (names friends/family); a heavy map library
  or tile provider/API key; the site failing to build when Notion is unreachable.

## Source data (Notion Travel DB, data source 35b75890-476e-449e-9adc-8679214c2567)
`Place` (title), `Departure Date`, `Return Date`, `Trip Type` (select),
`Location` (place: name, address, lat, lng), `Travel Group` (text — never read).
All rows had `Location` back-filled on 2026-11-21.

## Approaches considered
1. **Notion API at build time + daily revalidation** — chosen. Notion stays the
   single source; needs `NOTION_TOKEN` on the host.
2. One-time CSV export into `content/` — rejected: manual re-export per trip.
3. Fetch Notion from the browser — rejected: leaks token or needs a proxy; slower.

## Design
- `src/lib/places.ts`: query the data source via Notion REST API (`fetch`), map
  rows → `{ place, departure, tripType, lat, lng, locationName }`. Skip rows with
  no coordinates or a departure date in the future. Group by location
  (rounded lat/lng) into pins, visits sorted newest first. Returns `[]` on
  missing env vars or API failure (logged), and the section is hidden.
- Homepage: `export const revalidate = 86400`.
- Map: server-rendered SVG, `d3-geo` (Natural Earth projection) +
  `world-atlas` 110m countries via `topojson-client`. Neutral greys, small dots.
  Client component handles hover/focus/tap tooltip. Pins are focusable buttons.
- Section "Places", eyebrow "Been there", count = pins, after Sidequests,
  collapsible like the others; nav item "Places".

## Risk
Notion's `place` property type is newer; confirm the public API returns its
coordinates. Fallback: add `Lat`/`Lng` number columns and copy values.

## Left to the builder
Exact projection framing/crop, dot sizes, tooltip styling, accent colour.

## Addendum (2026-11-21): multi-city trips and countries
- Pins are cities. A trip's own `Location` is always pinned; extra cities live
  in a new Notion database **Trip Stops** (`City` title, `Location` place,
  `Trip` two-way relation → Travel DB, synced as `Stops` on the trip).
  Data source `41f646e6-5266-812a-b232-000b3d01cfb6`, env `NOTION_STOPS_DB_ID`.
- A stop inherits its trip's name, departure date and type, and the trip's
  filters (no departure / future → hidden). Same trip twice at one place counts once.
- Visited countries are shaded on the map (point-in-polygon on world-atlas,
  nudging coastal points that fall just outside the simplified outlines), and a
  caption reads "N cities across M countries".
- Approaches considered: Stops table (chosen); one Travel DB row per city
  (splits trip pages); free-text "also visited" column (needs geocoding).
