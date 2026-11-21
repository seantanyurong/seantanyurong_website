# Places Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Places" homepage section: a world map with one pin per visited place; hovering/focusing/tapping a pin shows the trip name and month/year of each visit, sourced live from the Notion Travel DB.

**Architecture:** Pure parsing/grouping logic in `src/lib/places-core.ts` (unit-tested with `node --test`), a thin Notion fetcher in `src/lib/places.ts`, a server component that projects the world SVG with `d3-geo`, and a small client component for the tooltip. Homepage revalidates daily.

**Tech Stack:** Next 16 App Router, React 19, Tailwind 4, `d3-geo`, `topojson-client`, `world-atlas`, Node 24 built-in test runner.

**Spec:** `docs/superpowers/specs/2026-11-21-places-map-design.md`

## Global Constraints

- Env vars: `NOTION_TOKEN`, `NOTION_TRAVEL_DB_ID` (value: data source id `35b75890-476e-449e-9adc-8679214c2567`). Live in `.env.local` (gitignored) and on the host.
- Notion API: `POST https://api.notion.com/v1/data_sources/{id}/query`, headers `Authorization: Bearer <token>`, `Notion-Version: 2026-03-11`. Place value shape: `{ type: "place", place: { lat, lon, name, address } | null }`.
- Never read or render the `Travel Group` property.
- Any Notion failure or missing env → empty list, section not rendered, build succeeds.
- Read `node_modules/next/dist/docs/` before using any Next API (AGENTS.md).

## Review Focus

- A row with `Location` empty or `Departure Date` empty → skipped, not a crash. (Task 1 test)
- A trip whose departure is after "today" → not shown. (Task 1 test)
- Two rows for the same place with coordinates a hair apart → one pin with both visits, newest first. (Task 1 test)
- More than 100 rows in Notion → all pages fetched via `start_cursor`. (Task 2 manual check via small `page_size`)
- Nearby pins (Bangkok / Khao Kho / Chiang Mai, Johor Bahru) → each still individually hoverable and keyboard-focusable. (Task 3 visual check)

---

### Task 1: Pure trip parsing and pin grouping

**Files:**
- Create: `src/lib/places-core.ts`
- Test: `src/lib/places-core.test.ts`
- Modify: `package.json` (add `"test": "node --test \"src/**/*.test.ts\""`), `tsconfig.json` (add `"allowImportingTsExtensions": true` so the test can import `./places-core.ts`)

**Interfaces:**
- Produces:
  - `type Visit = { trip: string; departure: string /* YYYY-MM-DD */; tripType: string | null }`
  - `type Pin = { key: string; label: string; lat: number; lng: number; visits: Visit[] }`
  - `parsePins(pages: unknown[], today: string /* YYYY-MM-DD */): Pin[]`
  - `formatMonth(iso: string): string` → e.g. `"Oct 2025"` (UTC, `en-US`, month short)

`parsePins` reads, from each page's `properties`: `Place` (title → plain_text joined), `Departure Date` (`date.start`, first 10 chars), `Trip Type` (`select?.name ?? null`), `Location` (`place.lat/lon/name`). `label` = `Location.place.name` up to the first comma. `key` = `lat.toFixed(2),lng.toFixed(2)`. Pins sorted by most recent visit first; visits within a pin newest first.

- [ ] **Step 1: Write failing tests** in `src/lib/places-core.test.ts` using `node:test` + `node:assert/strict`, with a `page(place, departure, lat, lng, name, tripType?)` fixture builder producing the Notion shape:
  - `groups repeat visits into one pin`: two Bangkok rows (13.75633,100.50177 and 13.75634,100.50178; 2025-04-18 and 2025-10-24) → 1 pin, `label === "Bangkok"`, `visits.map(v => v.departure)` deepEqual `["2025-10-24","2025-04-18"]`.
  - `skips rows without location or departure`: one row with `Location: { type: "place", place: null }`, one with `Departure Date: { date: null }` → `[]`.
  - `skips future trips`: departure `2026-12-01`, today `2026-11-21` → `[]`; departure `2026-11-19` → 1 pin.
  - `orders pins newest first`: Taipei 2026-07-20, London 2026-11-15 → labels `["London","Taipei"]`.
  - `null trip type is allowed`: `visits[0].tripType === null`.
  - `formatMonth`: `formatMonth("2025-10-24") === "Oct 2025"`.
- [ ] **Step 2:** `npm test` → FAIL (module not found).
- [ ] **Step 3:** Implement `src/lib/places-core.ts` (no imports; defensive optional chaining over `unknown`).
- [ ] **Step 4:** `npm test` → all pass; `npx tsc --noEmit` → no errors.
- [ ] **Step 5: Commit** `feat: parse Notion travel rows into map pins`

### Task 2: Notion fetcher

**Files:**
- Create: `src/lib/places.ts`

**Interfaces:**
- Consumes: `parsePins`, `Pin` from Task 1.
- Produces: `getPlacePins(): Promise<Pin[]>`

Loop `fetch` over the query endpoint with body `{ page_size: 100, start_cursor? }` while `has_more`; pass `next: { revalidate: 86400 }` on fetch. Missing env → `[]` silently. Non-OK response or thrown error → `console.error("[places]", ...)` and `[]`. `today` = `new Date().toISOString().slice(0,10)`. Add a `import "server-only"`-style guard only if the package is already present; otherwise just keep it imported solely from server components.

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** `npx tsc --noEmit` → clean. Live verification happens in Task 4 (rendered page): temporarily set `page_size: 5` and confirm all 16 rows arrive → 13 pins (Bangkok, Johor Bahru, Khao Kho repeat). Restore `100`.
- [ ] **Step 3: Commit** `feat: fetch travel pins from Notion`

### Task 3: Map components

**Files:**
- Create: `src/components/PlacesMap.tsx` (server), `src/components/PlacesMapPins.tsx` (`"use client"`)
- Modify: `package.json` (deps `d3-geo@^3.1.1`, `topojson-client@^3.1.0`, `world-atlas@^2.0.2`; devDeps `@types/d3-geo`, `@types/topojson-client`)

**Interfaces:**
- Consumes: `Pin`, `formatMonth` from Task 1.
- Produces: `PlacesMap({ pins }: { pins: Pin[] })`; `PlacesMapPins({ pins }: { pins: (Pin & { x: number; y: number })[]; width: number; height: number })`

`PlacesMap`: load `world-atlas/countries-110m.json`, `feature(topo, topo.objects.countries)`, `geoNaturalEarth1().fitSize([960, 500], land)`, render one `<path>` per country (`fill-neutral-100 stroke-white`), drop Antarctica (id `"010"`). Project each pin to x/y and hand to `PlacesMapPins`. SVG `viewBox="0 0 960 500"`, `w-full h-auto`.

`PlacesMapPins`: absolutely positioned overlay (percent left/top from x/width, y/height) of `<button>`s — 8px teal-500 dot, 24px hit area, `aria-label="{label}: {visits}"`. Active pin on hover/focus/click shows tooltip: bold label, then one line per visit `"{trip} · {formatMonth(departure)}{ · tripType}"`. Tooltip flips left when x > 70% width. Click outside / Escape clears.

- [ ] **Step 1:** Install deps.
- [ ] **Step 2:** Implement both components.
- [ ] **Step 3:** `npx tsc --noEmit` and `npm run lint` → clean.
- [ ] **Step 4: Commit** `feat: world map with hoverable trip pins`

### Task 4: Homepage section and nav

**Files:**
- Modify: `src/app/page.tsx`, `src/components/Nav.tsx`

**Interfaces:**
- Consumes: `getPlacePins` (Task 2), `PlacesMap` (Task 3).

`page.tsx`: `export const revalidate = 86400`; add `getPlacePins()` to the `Promise.all`; after Sidequests, when `pins.length > 0` render `<section id="places">` with the same `<details open>` pattern and `SectionHeading eyebrow="Been there" title="Places" accent="teal" count={pins.length} collapsible`. `Nav.tsx`: append `{ id: "places", label: "Places" }`.

- [ ] **Step 1:** Implement.
- [ ] **Step 2:** `npm run build` → succeeds with `.env.local` present; also succeeds with it renamed away (section absent).
- [ ] **Step 3:** `npm run dev`, open `/#places`: 13 pins, Bangkok tooltip lists Oct 2025 and Apr 2025, nav highlights "Places", Tab moves through pins, phone-width (375px) tap works. Do the Task 2 pagination check here.
- [ ] **Step 4: Commit** `feat: add Places section to homepage`
