import { queryAll, withNotionFallback } from "./notion.ts";
import { parseSidequests, type Sidequest } from "./sidequests-core.ts";

/*
  Sidequests come from the Notion "Side Quests DB" (only rows ticked Public).
  Missing env vars → [] (section hidden). See notion.ts for failure handling.
*/

/*
  Sort key: descriptions encode status + quarter ("Done - 2025 Q3",
  "In Progress - 2026 Q2", "In the future"). In Progress first, then Done,
  then everything else; most recent quarter first within each.
*/
function sortKey(desc: string): { rank: number; quarter: number } {
  const m = desc.match(/(Done|In Progress)\s*-\s*(\d{4})\s*Q([1-4])/i);
  if (m) {
    return {
      rank: m[1].toLowerCase() === "in progress" ? 0 : 1,
      quarter: Number(m[2]) * 10 + Number(m[3]),
    };
  }
  return { rank: 2, quarter: 0 };
}

export async function getSidequests(): Promise<Sidequest[]> {
  const dataSourceId = process.env.NOTION_SIDEQUESTS_DB_ID;
  if (!process.env.NOTION_TOKEN || !dataSourceId) return [];

  const items = await withNotionFallback(
    "sidequests",
    async () => parseSidequests(await queryAll(dataSourceId)),
    [],
  );
  return items.sort((a, b) => {
    const ka = sortKey(a.description);
    const kb = sortKey(b.description);
    if (ka.rank !== kb.rank) return ka.rank - kb.rank;
    if (ka.quarter !== kb.quarter) return kb.quarter - ka.quarter;
    return a.title.localeCompare(b.title);
  });
}
