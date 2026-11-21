import { queryAll, withNotionFallback, type QueryOptions } from "./notion.ts";
import { parsePins, type Pin } from "./places-core.ts";

/*
  Reads the Notion "Travel DB" (one row per trip) and, when configured, the
  "Trip Stops" database (extra cities per trip), and returns map pins.
  Missing env vars → [] (section hidden). Stops are optional.
  See notion.ts for how Notion failures are handled.
*/

export async function getPlacePins(opts: QueryOptions = {}): Promise<Pin[]> {
  const tripsId = process.env.NOTION_TRAVEL_DB_ID;
  const stopsId = process.env.NOTION_STOPS_DB_ID;
  if (!process.env.NOTION_TOKEN || !tripsId) return [];

  return withNotionFallback(
    "places",
    async () => {
      const [trips, stops] = await Promise.all([
        queryAll(tripsId, opts),
        stopsId ? queryAll(stopsId, opts) : Promise.resolve([]),
      ]);
      return parsePins(trips, new Date().toISOString().slice(0, 10), stops);
    },
    [],
  );
}
