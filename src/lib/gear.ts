import { queryAll, withNotionFallback } from "./notion.ts";
import { parseGear, type GearItem } from "./gear-core.ts";

/*
  Gear comes from the Notion "Gear" database (only rows ticked Public).
  Missing env vars → [] (empty page). See notion.ts for failure handling.
*/
export async function getGear(): Promise<GearItem[]> {
  const dataSourceId = process.env.NOTION_GEAR_DB_ID;
  if (!process.env.NOTION_TOKEN || !dataSourceId) return [];
  return withNotionFallback(
    "gear",
    async () => parseGear(await queryAll(dataSourceId)),
    [],
  );
}
