import { getSelectOptions, queryAll, withNotionFallback } from "./notion.ts";
import { parseGear, type GearItem } from "./gear-core.ts";

/*
  Gear comes from the Notion "Gear" database (only rows ticked Public), plus
  the Category option order so the site shows categories in Notion's order.
  Missing env vars → nothing (section hidden). See notion.ts for failures.
*/
export type GearData = { items: GearItem[]; categories: string[] };

export async function getGear(): Promise<GearData> {
  const empty: GearData = { items: [], categories: [] };
  const dataSourceId = process.env.NOTION_GEAR_DB_ID;
  if (!process.env.NOTION_TOKEN || !dataSourceId) return empty;
  return withNotionFallback(
    "gear",
    async () => {
      const [pages, categories] = await Promise.all([
        queryAll(dataSourceId),
        getSelectOptions(dataSourceId, "Category"),
      ]);
      return { items: parseGear(pages), categories };
    },
    empty,
  );
}
