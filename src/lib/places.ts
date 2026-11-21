import { parsePins, type Pin } from "./places-core.ts";

/*
  Reads the Notion "Travel DB" (one row per trip) and, when configured, the
  "Trip Stops" database (extra cities per trip), and returns map pins.
  Server-only: uses NOTION_TOKEN.

  Failure handling:
  - Missing env vars → [] (section hidden). Stops are optional.
  - Notion error/timeout during `next build` → [] so the build never fails.
  - Notion error/timeout during runtime revalidation → throw, so Next keeps
    serving the last successfully generated page instead of one without pins.
*/

const NOTION_VERSION = "2026-03-11";

type QueryOptions = { token: string; pageSize: number; timeoutMs: number };

async function queryAll(
  dataSourceId: string,
  { token, pageSize, timeoutMs }: QueryOptions,
): Promise<unknown[]> {
  const pages: unknown[] = [];
  let cursor: string | undefined;
  do {
    const res = await fetch(
      `https://api.notion.com/v1/data_sources/${dataSourceId}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page_size: pageSize,
          ...(cursor ? { start_cursor: cursor } : {}),
        }),
        signal: AbortSignal.timeout(timeoutMs),
      },
    );
    if (!res.ok) {
      throw new Error(`Notion query failed: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    pages.push(...(data.results ?? []));
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return pages;
}

export async function getPlacePins({
  pageSize = 100,
  timeoutMs = 10_000,
}: { pageSize?: number; timeoutMs?: number } = {}): Promise<Pin[]> {
  const token = process.env.NOTION_TOKEN;
  const tripsId = process.env.NOTION_TRAVEL_DB_ID;
  const stopsId = process.env.NOTION_STOPS_DB_ID;
  if (!token || !tripsId) return [];

  const opts = { token, pageSize, timeoutMs };
  try {
    const [trips, stops] = await Promise.all([
      queryAll(tripsId, opts),
      stopsId ? queryAll(stopsId, opts) : Promise.resolve([]),
    ]);
    return parsePins(trips, new Date().toISOString().slice(0, 10), stops);
  } catch (err) {
    console.error("[places]", err);
    if (process.env.NEXT_PHASE === "phase-production-build") return [];
    throw err;
  }
}
